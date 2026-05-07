import json
import os
from groq import Groq
from netmiko import ConnectHandler

load_dotenv()

# --- KONFIGURASI ---
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

def get_ai_analysis_groq(raw_data):
    """Mengirim data ke Groq AI untuk analisis hardening."""
    print("[*] Mengirim data ke Groq AI...")
    
    system_message = (
        "Anda adalah Senior Network Security Engineer di CV. Karya Hidup Sentosa. "
        "Tugas Anda melakukan audit hardening Mikrotik dan memberikan edukasi sederhana."
    )
    
    prompt = f"""
    ANALISIS DATA BERIKUT:
    {raw_data}

    WAJIB KEMBALIKAN DALAM FORMAT JSON:
    {{
      "audit_results": [
        {{
          "feature": "Nama Fitur",
          "penjelasan_sederhana": "Analogi fungsi fitur",
          "status": "PASS/FAIL/WARNING",
          "issue": "Detail temuan",
          "mitigation": "Perintah terminal Mikrotik"
        }}
      ]
    }}
    """

    try:
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"[-] Gagal mendapatkan analisis AI: {e}")
        return {"audit_results": []}

def run_mikrotik_audit(device_config):
    """Logika utama koneksi SSH dan pengambilan data Mikrotik."""
    connection = None
    try:
        print(f"[*] Menghubungi router: {device_config['host']}")
        connection = ConnectHandler(**device_config)
        
        # Ekstraksi data
        dns = connection.send_command("/ip dns print")
        services = connection.send_command("/ip service print")
        firewall = connection.send_command("/ip firewall filter print where dynamic=no")
        mndp = connection.send_command("/ip neighbor discovery-settings print")
        users = connection.send_command("/user print")
        resource = connection.send_command("/system resource print")

        raw_combined = (
            f"--- RESOURCE ---\n{resource}\n--- DNS ---\n{dns}\n"
            f"--- SERVICES ---\n{services}\n--- FIREWALL ---\n{firewall}\n"
            f"--- MNDP ---\n{mndp}\n--- USERS ---\n{users}\n"
        )
        
        return get_ai_analysis_groq(raw_combined)
    except Exception as e:
        print(f"[!] Gagal mengeksekusi audit: {e}")
        raise e
    finally:
        if connection:
            connection.disconnect()