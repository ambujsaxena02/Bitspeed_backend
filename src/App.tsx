import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, Mail, Search, History, Database as DbIcon, AlertCircle, Cpu, Link as LinkIcon } from "lucide-react";

interface ReconciliationResponse {
  contact: {
    primaryContatctId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
}

export default function App() {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReconciliationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email || null, phoneNumber: phoneNumber || null }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to identify contact");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans selection:bg-[#C1FF72] selection:text-black">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#C1FF72]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto p-6 md:p-12">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#C1FF72] rounded-lg">
                <Cpu className="w-6 h-6 text-black" />
              </div>
              <h1 className="text-3xl font-serif italic font-bold tracking-tight text-[#C1FF72]">FluxKart.OS</h1>
            </div>
            <p className="text-white/50 max-w-md text-sm leading-relaxed">
              Advanced Identity Reconciliation Engine. Consolidating fragmented customer touchpoints into a unified neural profile.
            </p>
          </div>
          <div className="flex gap-4 text-[10px] uppercase tracking-widest font-bold text-white/30">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> System Online</span>
            <span>v2.0.26</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Panel */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md"
          >
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#C1FF72] mb-8">Search Parameters</h2>
            <form onSubmit={handleIdentify} className="space-y-8">
              <div className="group relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#C1FF72] transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#C1FF72]/50 focus:ring-1 focus:ring-[#C1FF72]/50 transition-all placeholder:text-white/20"
                />
              </div>

              <div className="group relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#C1FF72] transition-colors" />
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter Phone"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#C1FF72]/50 focus:ring-1 focus:ring-[#C1FF72]/50 transition-all placeholder:text-white/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading || (!email && !phoneNumber)}
                className="w-full bg-[#C1FF72] text-black rounded-2xl py-5 font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 shadow-[0_0_20px_rgba(193,255,114,0.3)]"
              >
                {loading ? "Scanning Data..." : "Execute Reconciliation"}
              </button>
            </form>
          </motion.section>

          {/* Results Display */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-3xl p-8 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <History className="w-24 h-24" />
                  </div>

                  <div className="flex items-center gap-6 mb-10">
                    <div className="w-16 h-16 bg-[#C1FF72] rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(193,255,114,0.5)]">
                      <User className="w-8 h-8 text-black" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#C1FF72]">Subject Identity</p>
                      <h3 className="text-4xl font-mono font-bold">PID-{result.contact.primaryContatctId}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <p className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        <Mail className="w-3 h-3" /> Emails
                      </p>
                      <div className="space-y-2">
                        {result.contact.emails.map((e, i) => (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                            key={e} className={`p-3 rounded-xl border text-xs font-mono ${i === 0 ? 'bg-[#C1FF72]/10 border-[#C1FF72]/30 text-[#C1FF72]' : 'bg-white/5 border-white/10 text-white/70'}`}>
                            {e}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        <Phone className="w-3 h-3" /> Phone Network
                      </p>
                      <div className="space-y-2">
                        {result.contact.phoneNumbers.map((p, i) => (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                            key={p} className={`p-3 rounded-xl border text-xs font-mono ${i === 0 ? 'bg-[#C1FF72]/10 border-[#C1FF72]/30 text-[#C1FF72]' : 'bg-white/5 border-white/10 text-white/70'}`}>
                            {p}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {result.contact.secondaryContactIds.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-white/10">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Linked Secondary Nodes</p>
                      <div className="flex flex-wrap gap-2">
                        {result.contact.secondaryContactIds.map(id => (
                          <span key={id} className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono text-white/50">
                            <LinkIcon className="w-3 h-3" /> NODE-{id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="h-full min-h-[400px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-white/20 p-12 text-center">
                  <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center mb-6 animate-pulse">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-white/60 font-bold mb-2">Awaiting Input</h3>
                  <p className="text-xs max-w-[200px]">Provide contact details to initiate identity reconciliation.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}