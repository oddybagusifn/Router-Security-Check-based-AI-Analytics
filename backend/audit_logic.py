import json
import os
import re
from groq import Groq
from netmiko import ConnectHandler
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_ai_analysis_groq(raw_data):
    print("[*] Mengirim data ke Groq AI...")
    try:
        system_message = (
            "Anda adalah Senior Network Security Engineer di CV. Karya Hidup Sentosa. "
            "Tugas Anda melakukan audit keamanan Mikrotik berdasarkan data router yang diberikan. "
            "Berikan analisis yang mendalam namun mudah dipahami."
        )
        
        # Prompt yang lebih spesifik untuk memaksa AI mengisi setiap field
        prompt = f"""
        ANALISIS DATA MIKROTIK BERIKUT:
        {raw_data}

        KEMBALIKAN HANYA JSON DENGAN STRUKTUR:
        {{
          "audit_results": [
            {{
              "feature": "Nama fitur (contoh: 'SSH Service' atau 'DNS Allow Remote Requests')",
              "penjelasan_sederhana": "Analogi cara kerja fitur ini",
              "status": "PASS/FAIL/WARNING",
              "issue": "Detail masalah keamanan yang ditemukan",
              "mitigation": "Perintah terminal Mikrotik untuk memperbaiki (contoh: /ip service set ssh port=2222)"
            }}
          ]
        }}

        PASTIKAN SEMUA FIELD TERISI DAN TIDAK KOSONG.
        """

        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3 # Sedikit dinaikkan agar AI lebih deskriptif
        )
        
        content = chat_completion.choices[0].message.content
        data = json.loads(content)

        # Standarisasi Output
        if isinstance(data, dict) and "audit_results" in data:
            return data["audit_results"]
        
        # Fallback jika struktur sedikit meleset
        for val in data.values():
            if isinstance(val, list): return val
            
        return []
    except Exception as e:
        print(f"[-] AI Error: {str(e)}")
        return []

def run_mikrotik_audit(device_config):
    connection = None
    try:
        device_config['device_type'] = 'mikrotik_routeros'
        device_config['port'] = int(device_config.get('port', 22))
        
        print(f"[*] Menghubungi router: {device_config['host']} Port: {device_config['port']}")
        connection = ConnectHandler(**device_config)
        
        print("[*] Mengekstraksi konfigurasi...")
        raw_combined = (
            f"RES: {connection.send_command('/system resource print')}\n"
            f"DNS: {connection.send_command('/ip dns print')}\n"
            f"SVC: {connection.send_command('/ip service print')}\n"
            f"FW: {connection.send_command('/ip firewall filter print where dynamic=no')}\n"
        )
        
        return get_ai_analysis_groq(raw_combined)
    except Exception as e:
        print(f"[!] Gagal Audit: {str(e)}")
        raise e
    finally:
        if connection:
            connection.disconnect()
            print("[*] Koneksi SSH ditutup.")