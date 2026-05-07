"use client";
import { useState, useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import BorderGlow from "@/components/BorderGlow";

interface AuditResult {
  feature: string;
  penjelasan_sederhana: string;
  status: "PASS" | "FAIL" | "WARNING";
  issue: string;
  mitigation: string;
}

export default function Home() {
  const [host, setHost] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [results, setResults] = useState<AuditResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- INTERACTIVE BACKGROUND LOGIC ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalisasi posisi kursor
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 100);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 100);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // --- AUDIT EXECUTION LOGIC ---
  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host, username, password }),
      });

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.detail || "Authentication Failed or Router Unreachable");
      }

      setResults(res.data || []);
    } catch (err: any) {
      setError(err.message === "Failed to fetch" 
        ? "Network Error: Cannot connect to backend server." 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#060606] font-sans text-white selection:bg-white selection:text-black overflow-x-hidden">
      
      {/* BACKGROUND: FLUID COLOR BLENDS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ x: smoothX, y: smoothY }}
          animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[10%] w-[80vw] h-[80vh] rounded-full bg-gradient-to-br from-purple-600/20 via-fuchsia-500/5 to-transparent blur-[120px]"
        />
        <motion.div
          style={{ x: smoothY, y: smoothX }}
          animate={{ scale: [1.1, 1, 1.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[10%] w-[60vw] h-[60vh] rounded-full bg-gradient-to-tr from-indigo-600/15 via-purple-500/5 to-transparent blur-[100px]"
        />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <main className="relative z-10 flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
        {/* HEADER */}
        <header className="mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
          <h1 className="text-6xl font-light tracking-tighter mb-2">
            ROUTER <span className="font-black text-outline">LOGIC</span>
          </h1>
          <p className="text-white/40 text-[10px] uppercase tracking-[0.5em] font-bold">
             Vierre Works • Network Security Dashboard
          </p>
        </header>

        {/* ERROR NOTIFICATION */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 relative group"
          >
            <div className="absolute -inset-1 bg-rose-500/20 blur-xl rounded-2xl opacity-50" />
            <div className="relative flex items-center justify-between backdrop-blur-2xl bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                  <span className="text-rose-500 font-black">!</span>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Access Denied</h4>
                  <p className="text-sm text-white/70 font-medium">{error}</p>
                </div>
              </div>
              <button onClick={() => setError(null)} className="text-white/20 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest px-4">Dismiss</button>
            </div>
          </motion.div>
        )}

        {/* FORM SECTION */}
        <section className="backdrop-blur-3xl bg-white/[0.03] border border-white/10 rounded-[40px] p-10 mb-20 shadow-2xl animate-in fade-in zoom-in-95 duration-700">
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

        {/* RESULTS TABLE */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-10 duration-1000">
          {results.length > 0 ? (
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-transparent blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative overflow-x-auto backdrop-blur-3xl bg-white/[0.02] border border-white/10 rounded-[32px] shadow-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03]">
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Status</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Feature</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Security Issue</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Mitigation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {results.map((res, idx) => (
                      <tr key={idx} className="group/row hover:bg-white/[0.03] transition-colors duration-500">
                        <td className="px-8 py-6"><StatusBadge status={res.status} /></td>
                        <td className="px-8 py-6 min-w-[250px]">
                          <div className="font-bold text-sm uppercase tracking-tight mb-1 group-hover/row:text-white">{res.feature}</div>
                          <div className="text-[11px] text-white/40 leading-relaxed max-w-[200px]">{res.penjelasan_sederhana}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-[11px] text-white/60 font-mono italic max-w-[300px]">// {res.issue}</div>
                        </td>
                        <td className="px-8 py-6 min-w-[300px]">
                          <code className="text-[10px] font-mono text-emerald-400 group-hover/row:text-white transition-colors break-all leading-relaxed">
                            {res.mitigation}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : !loading && (
            <div className="py-40 text-center border border-dashed border-white/5 rounded-[40px] backdrop-blur-sm bg-white/[0.01]">
              <div className="text-white/5 uppercase tracking-[1.5em] text-[10px] font-black italic">Awaiting Data Stream • Standby</div>
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

// --- SUBCOMPONENTS ---

function StatusBadge({ status }: { status: "PASS" | "FAIL" | "WARNING" }) {
  const configs = {
    PASS: { color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", glow: "bg-emerald-500" },
    WARNING: { color: "text-amber-500 bg-amber-500/10 border-amber-500/20", glow: "bg-amber-500" },
    FAIL: { color: "text-rose-500 bg-rose-500/10 border-rose-500/20", glow: "bg-rose-500" },
  };
  const config = configs[status];
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 group-hover:bg-black group-hover:text-white ${config.color}`}>
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
        className="w-full h-[60px] bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-xs outline-none focus:bg-white/[0.08] focus:border-white/30 transition-all font-mono"
      />
    </div>
  );
}