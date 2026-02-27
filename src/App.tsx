import React, { useState } from "react";
import { motion } from "motion/react";
import { User, Phone, Mail, Search, History, Database as DbIcon, AlertCircle } from "lucide-react";

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email || null,
          phoneNumber: phoneNumber || null,
        }),
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
    <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 border-b border-[#141414]/10 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <DbIcon className="w-8 h-8 text-[#5A5A40]" />
            <h1 className="text-4xl font-serif italic font-medium tracking-tight">FluxKart Identity</h1>
          </div>
          <p className="text-[#141414]/60 max-w-xl">
            Identity Reconciliation Service for Bitespeed. Link customer contact points across multiple purchases.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Form Section */}
          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-[#141414]/40 mb-6 flex items-center gap-2">
              <Search className="w-3 h-3" /> Identify Request
            </h2>
            <form onSubmit={handleIdentify} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 opacity-40" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. mcfly@hillvalley.edu"
                  className="w-full bg-white border border-[#141414]/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 opacity-40" /> Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full bg-white border border-[#141414]/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading || (!email && !phoneNumber)}
                className="w-full bg-[#5A5A40] text-white rounded-full py-4 font-medium hover:bg-[#4A4A30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#5A5A40]/10"
              >
                {loading ? "Reconciling..." : "Identify Contact"}
              </button>
            </form>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </section>

          {/* Result Section */}
          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-[#141414]/40 mb-6 flex items-center gap-2">
              <History className="w-3 h-3" /> Reconciliation Result
            </h2>
            
            {result ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-[#141414]/10 rounded-3xl p-8 shadow-xl shadow-[#141414]/5"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#F5F5F0] rounded-2xl flex items-center justify-center">
                      <User className="w-6 h-6 text-[#5A5A40]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#141414]/40 font-bold uppercase tracking-tighter">Primary ID</p>
                      <p className="text-2xl font-serif font-medium">#{result.contact.primaryContatctId}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                    Consolidated
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/30 mb-2">Linked Emails</p>
                    <div className="flex flex-wrap gap-2">
                      {result.contact.emails.map((e, i) => (
                        <span key={e} className={`px-3 py-1.5 rounded-lg text-sm ${i === 0 ? 'bg-[#5A5A40] text-white' : 'bg-[#F5F5F0] text-[#141414]/70'}`}>
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/30 mb-2">Linked Phone Numbers</p>
                    <div className="flex flex-wrap gap-2">
                      {result.contact.phoneNumbers.map((p, i) => (
                        <span key={p} className={`px-3 py-1.5 rounded-lg text-sm ${i === 0 ? 'bg-[#5A5A40] text-white' : 'bg-[#F5F5F0] text-[#141414]/70'}`}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/30 mb-2">Secondary IDs</p>
                    <div className="flex flex-wrap gap-2">
                      {result.contact.secondaryContactIds.length > 0 ? (
                        result.contact.secondaryContactIds.map(id => (
                          <span key={id} className="px-3 py-1.5 bg-[#F5F5F0] text-[#141414]/70 rounded-lg text-sm font-mono">
                            #{id}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm italic text-[#141414]/40">None</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-64 border-2 border-dashed border-[#141414]/10 rounded-3xl flex flex-col items-center justify-center text-[#141414]/30">
                <Search className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">Submit a request to see reconciliation</p>
              </div>
            )}
          </section>
        </div>

        <footer className="mt-24 pt-8 border-t border-[#141414]/10 text-center text-[10px] uppercase tracking-[0.2em] text-[#141414]/30">
          Bitespeed Identity Reconciliation System &copy; 2026
        </footer>
      </div>
    </div>
  );
}
