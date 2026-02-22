"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("templates");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none flex justify-center">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px]" />
      </div>

      <nav className="relative z-10 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">NotiAdmin</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <header>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Notification Hub</h1>
            <p className="text-slate-400">Manage your event templates, routing schemas, and view real-time delivery metrics.</p>
          </header>

          <div className="flex space-x-1 p-1 bg-slate-900/50 rounded-xl border border-white/5 w-fit backdrop-blur-md">
            {["templates", "metrics", "preferences"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab
                    ? "bg-indigo-500/10 text-indigo-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] border border-indigo-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Active Templates</h2>
                  <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/25">
                    + New Template
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 1, name: "Welcome Email", event: "user.created", channels: ["IN_APP", "EMAIL"] },
                    { id: 2, name: "Order Receipt", event: "payment.success", channels: ["EMAIL"] },
                  ].map((tpl) => (
                    <div key={tpl.id} className="group p-4 rounded-xl bg-slate-900/50 border border-transparent hover:border-slate-700 hover:bg-slate-800/50 transition-all cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-slate-200 group-hover:text-white transition-colors">{tpl.name}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">
                              {tpl.event}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {tpl.channels.map(c => (
                            <span key={c} className="text-[10px] font-bold tracking-wider text-slate-500 bg-slate-900 px-2 py-1 rounded-full border border-slate-800">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 backdrop-blur-xl">
                <h2 className="text-sm font-semibold text-indigo-300 tracking-wide uppercase mb-4">System Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">RabbitMQ Broker</span>
                    <span className="flex items-center gap-2 text-sm text-green-400">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Redis Store</span>
                    <span className="flex items-center gap-2 text-sm text-green-400">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      Connected
                    </span>
                  </div>
                  <div className="h-px bg-white/5 my-4" />
                  <div className="pt-2">
                    <p className="text-xs text-slate-500">
                      Idempotency intercepts are functioning normally. Peak throughput: 1,204 events/sec.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
