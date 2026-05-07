"use client";
import { useState, useEffect } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import BorderGlow  from "@/components/BorderGlow"; 

interface AuditResult {
  feature: string;
  penjelasan_sederhana: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  issue: string;
  mitigation: string;
}

export default function Home() {
  const [init, setInit] = useState(false);
  const [host, setHost] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [results, setResults] = useState<AuditResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    try {
      const response = await fetch("http://localhost:8000/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host, username, password }),
      });
      const res = await response.json();
      setResults(res.data || []);
    } catch (err) {
      alert("Koneksi gagal! Pastikan backend Python berjalan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#060606] font-sans text-white selection:bg-white selection:text-black overflow-x-hidden">
      {/* Particle Background */}
      {init && (
        <Particles
          id="tsparticles"
          options={{
            fpsLimit: 120,
            interactivity: {
              events: { onHover: { enable: true, mode: "parallax" } },
              modes: { parallax: { enable: true, force: 50, smooth: 10 } },
            },
            particles: {
              color: { value: "#ffffff" },
              move: { enable: true, speed: 0.6, random: true },
              number: { density: { enable: true, area: 800 }, value: 70 },
              opacity: { value: { min: 0.1, max: 0.3 } },
              size: { value: { min: 1, max: 2 } },
            },
          }}
        />
      )}

      <main className="relative z-10 flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
        <header className="mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
          <h1 className="text-6xl font-light tracking-tighter mb-2">
            AUDIT <span className="font-black text-outline">LOGIC</span>
          </h1>
          <p className="text-white/40 text-[10px] uppercase tracking-[0.5em] font-bold">
            Vierre Works • Network Security Dashboard
          </p>
        </header>

        {/* Form Section - Desain Glassify Murni */}
        <section className="backdrop-blur-3xl bg-white/[0.02] border border-white/10 rounded-[40px] p-10 mb-20 shadow-2xl animate-in fade-in zoom-in-95 duration-700">
          <form onSubmit={handleAudit} className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end text-left">
            <InputGroup label="Network Host" value={host} onChange={setHost} placeholder="192.168.x.x" />
            <InputGroup label="Access Identity" value={username} onChange={setUsername} placeholder="Admin" />
            <InputGroup label="Security Token" value={password} onChange={setPassword} type="password" />
            <button 
              type="submit" 
              disabled={loading}
              className="group relative h-[60px] w-full overflow-hidden rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30"
            >
              <div className="absolute inset-0 bg-neutral-200 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="relative z-10">{loading ? "Analyzing..." : "Execute Audit"}</span>
            </button>
          </form>
        </section>

        {/* Results Grid - Menggunakan BorderGlow hanya pada kartu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.length > 0 ? results.map((res, idx) => (
            <div key={idx} style={{ animationDelay: `${idx * 100}ms` }} className="animate-in fade-in slide-in-from-bottom-8">
              <BorderGlow 
                edgeSensitivity={10} 
                glowColor="#fff"
                backgroundColor="#0D0D0D" 
                borderRadius={20} 
                glowRadius={50} 
                glowIntensity={0.7} 
                animated={true}
                colors={res.status === 'FAIL' ? ['#fff', '#fff'] : ['#ffffff', '#ffff']}
              >
                <div className="p-8 min-h-[400px] flex flex-col group">
                  <div className="flex justify-between items-center mb-10">
                    <StatusBadge status={res.status} />
                    <div className="text-[9px] font-mono opacity-20 group-hover:opacity-40 tracking-tighter">
                      SEC_REPORT_{idx.toString().padStart(3, '0')}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold tracking-tight mb-3 uppercase group-hover:translate-x-1 transition-transform">
                    {res.feature}
                  </h3>
                  <p className="text-sm text-white/40 mb-10 leading-relaxed font-medium  transition-colors">
                    {res.penjelasan_sederhana}
                  </p>
                  
                  <div className="mt-auto space-y-5">
                    <div className="text-[11px] leading-relaxed opacity-70 group-hover:font-medium">
                      {res.issue}
                    </div>
                    <div className="relative bg-white/5 p-5 rounded-2xl border border-white/5 group-hover:bg-black transition-all">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/10 group-hover:bg-blue-600 transition-colors" />
                      <code className="text-[9px] font-mono block break-all text-emerald-400 group-hover:text-white transition-colors uppercase italic leading-loose">
                        {res.mitigation}
                      </code>
                    </div>
                  </div>
                </div>
              </BorderGlow>
            </div>
          )) : !loading && (
            <div className="col-span-full py-40 text-center border border-dashed border-white/10 rounded-[40px] text-white/10 uppercase tracking-[1em] text-[10px] font-black italic">
              System Standby
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        .text-outline { -webkit-text-stroke: 1px white; color: transparent; }
        .group:hover .text-outline { -webkit-text-stroke: 1px black; }
      `}</style>
    </div>
  );
}

// Sub-Komponen Tetap
function StatusBadge({ status }: { status: 'PASS' | 'FAIL' | 'WARNING' }) {
  const configs = {
    PASS: { color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", glow: "bg-emerald-500" },
    WARNING: { color: "text-amber-500 bg-amber-500/10 border-amber-500/20", glow: "bg-amber-500" },
    FAIL: { color: "text-rose-500 bg-rose-500/10 border-rose-500/20", glow: "bg-rose-500" }
  };
  const config = configs[status];
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 group-hover:bg-black group-hover:text-white group-hover:border-transparent ${config.color}`}>
      <span className={`w-1 h-1 rounded-full animate-pulse shadow-[0_0_8px_currentColor] ${config.glow}`} />
      {status}
    </div>
  );
}

function InputGroup({ label, value, onChange, placeholder = "", type = "text" }: any) {
  return (
    <div className="space-y-3 group/input text-left">
      <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-1 group-focus-within/input:text-white transition-colors">
        {label}
      </label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[60px] bg-white/[0.01] border border-white/5 rounded-2xl px-6 text-xs outline-none focus:bg-white/[0.04] focus:border-white/20 transition-all font-mono"
      />
    </div>
  );
}