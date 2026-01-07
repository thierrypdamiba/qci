'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Server, Clock, DollarSign, Shield, Zap } from 'lucide-react';

// Production benchmarks from Vercel → Qdrant Cloud (us-west-2)
// Fair comparison: same model (all-MiniLM-L6-v2, 384 dims) for both paths
const BENCHMARK_DATA = {
  external: {
    name: 'External API + Qdrant',
    subtitle: 'HuggingFace API → Vector → Search',
    coldStart: 0,
    warmEmbed: 100,   // ~100ms embed via HF
    search: 50,       // ~50ms search
    totalWarm: 150,   // ~150ms total
    color: 'slate',
  },
  qci: {
    name: 'QCI Native',
    subtitle: 'Text → Qdrant (embed + search in-cluster)',
    coldStart: 0,
    warmEmbed: 50,    // embed happens in-cluster
    search: 50,       // search
    totalWarm: 100,   // ~100ms total
    color: 'amber',
  },
};

export default function ComparePage() {
  const [activeSection, setActiveSection] = useState<'architecture' | 'latency' | 'operations' | 'tradeoffs'>('architecture');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-20">
      <main className="max-w-5xl mx-auto px-6 py-16">
        <section className="mb-20">
          <h1 className="text-4xl font-light mb-6 leading-tight">
            Where should embedding<br />
            happen in your RAG stack?
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
            Every vector search starts with an embedding. The question is not if you
            need one - it is where that computation should live. Here is what we learned.
          </p>
        </section>

        <section className="mb-20 p-8 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-4">TL;DR</h2>
          <div className="grid grid-cols-2 gap-8 max-w-2xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-zinc-400" />
                <span className="font-medium text-zinc-200">External API + Qdrant</span>
              </div>
              <p className="text-sm text-zinc-500">
                Two API calls. Embed externally, then search. ~150ms total.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-medium text-zinc-200">QCI Native</span>
              </div>
              <p className="text-sm text-zinc-500">
                One API call. Embed + search in-cluster. ~100ms total. <span className="text-green-400">~35% faster.</span>
              </p>
            </div>
          </div>
        </section>

        <nav className="flex gap-1 mb-12 p-1 bg-zinc-900 rounded-lg w-fit">
          {[
            { id: 'architecture', label: 'Architecture' },
            { id: 'latency', label: 'Latency' },
            { id: 'operations', label: 'Operations' },
            { id: 'tradeoffs', label: 'Trade-offs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as 'architecture' | 'latency' | 'operations' | 'tradeoffs')}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                activeSection === tab.id
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeSection === 'architecture' && (
          <section className="space-y-12">
            <div>
              <h2 className="text-2xl font-light mb-4">The network hop problem</h2>
              <p className="text-zinc-400 max-w-2xl mb-8">
                In a traditional RAG setup, your query travels through multiple services.
                Each hop adds latency, complexity, and potential failure points.
              </p>
            </div>

            {/* Traditional Architecture Flowchart */}
            <div className="p-8 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Traditional Architecture</h3>
                <span className="text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-full">4 network hops</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                {/* Client */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-xl bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center">
                    <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs text-zinc-500 mt-2 font-medium">Your App</span>
                </div>

                {/* Arrow 1 */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full h-0.5 bg-gradient-to-r from-zinc-600 to-blue-500 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-blue-500" />
                  </div>
                  <span className="text-xs text-zinc-600 mt-1">1. Send text</span>
                </div>

                {/* Embedding API */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-20 rounded-xl bg-blue-500/10 border-2 border-blue-500/50 flex flex-col items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <span className="text-xs text-blue-400 mt-1 font-medium">Embedding</span>
                    <span className="text-xs text-blue-400/60">API</span>
                  </div>
                  <span className="text-xs text-blue-400 mt-2 font-mono">~100ms</span>
                </div>

                {/* Arrow 2 */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full h-0.5 bg-gradient-to-r from-blue-500 to-zinc-600 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-zinc-600" />
                  </div>
                  <span className="text-xs text-zinc-600 mt-1">2. Return vector</span>
                </div>

                {/* Client (middle) */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-lg bg-zinc-800/50 border border-zinc-700 border-dashed flex items-center justify-center">
                    <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs text-zinc-600 mt-2">relay</span>
                </div>

                {/* Arrow 3 */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full h-0.5 bg-gradient-to-r from-zinc-600 to-purple-500 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-purple-500" />
                  </div>
                  <span className="text-xs text-zinc-600 mt-1">3. Send vector</span>
                </div>

                {/* Vector DB */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-20 rounded-xl bg-purple-500/10 border-2 border-purple-500/50 flex flex-col items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                    <span className="text-xs text-purple-400 mt-1 font-medium">Vector</span>
                    <span className="text-xs text-purple-400/60">Database</span>
                  </div>
                  <span className="text-xs text-purple-400 mt-2 font-mono">~50ms</span>
                </div>

                {/* Arrow 4 */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full h-0.5 bg-gradient-to-r from-purple-500 to-zinc-600 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-zinc-600" />
                  </div>
                  <span className="text-xs text-zinc-600 mt-1">4. Results</span>
                </div>

                {/* Client (end) */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-xl bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center">
                    <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs text-zinc-500 mt-2 font-medium">Done</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-zinc-500">Total latency: <span className="text-zinc-300 font-mono">~150ms</span></span>
                  <span className="text-zinc-600">|</span>
                  <span className="text-zinc-500">Vendors: <span className="text-zinc-300">2</span></span>
                  <span className="text-zinc-600">|</span>
                  <span className="text-zinc-500">Data transfer: <span className="text-zinc-300">vector over network</span></span>
                </div>
              </div>
            </div>

            {/* QCI Architecture Flowchart */}
            <div className="p-8 bg-zinc-900/50 rounded-xl border-2 border-amber-500/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-amber-400 uppercase tracking-wider">QCI Architecture</h3>
                <span className="text-xs text-green-400 bg-green-500/10 px-3 py-1 rounded-full">2 network hops</span>
              </div>

              <div className="flex items-center justify-center gap-4">
                {/* Client */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-xl bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center">
                    <svg className="w-10 h-10 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-sm text-zinc-400 mt-3 font-medium">Your App</span>
                </div>

                {/* Arrow to Qdrant */}
                <div className="flex-1 max-w-32 flex flex-col items-center">
                  <div className="w-full h-1 bg-gradient-to-r from-zinc-600 via-amber-500 to-amber-500 relative rounded-full">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[12px] border-transparent border-l-amber-500" />
                  </div>
                  <span className="text-xs text-amber-400/80 mt-2 font-medium">1. Send text</span>
                </div>

                {/* Qdrant Cloud - Combined */}
                <div className="flex flex-col items-center">
                  <div className="w-48 h-32 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-500/50 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.1),transparent_70%)]" />
                    <div className="relative flex flex-col items-center">
                      <svg className="w-8 h-8 text-amber-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-sm text-amber-400 font-bold">Qdrant Cloud</span>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded">embed</span>
                        <span className="text-amber-500/50">+</span>
                        <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded">search</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-amber-400 mt-3 font-mono font-bold">~100ms</span>
                </div>

                {/* Arrow back */}
                <div className="flex-1 max-w-32 flex flex-col items-center">
                  <div className="w-full h-1 bg-gradient-to-r from-amber-500 to-zinc-600 relative rounded-full">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[12px] border-transparent border-l-zinc-600" />
                  </div>
                  <span className="text-xs text-amber-400/80 mt-2 font-medium">2. Results</span>
                </div>

                {/* Client (done) */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-xl bg-green-500/10 border-2 border-green-500/50 flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm text-green-400 mt-3 font-medium">Done</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-zinc-500">Total latency: <span className="text-amber-400 font-mono font-bold">~100ms</span></span>
                  <span className="text-zinc-600">|</span>
                  <span className="text-zinc-500">Vendors: <span className="text-amber-400 font-bold">1</span></span>
                  <span className="text-zinc-600">|</span>
                  <span className="text-zinc-500">Data transfer: <span className="text-amber-400">text only</span></span>
                </div>
                <span className="text-sm text-green-400 font-bold">~35% faster</span>
              </div>
            </div>

            <div className="p-6 bg-zinc-800/30 rounded-lg">
              <h4 className="text-sm font-medium text-zinc-300 mb-2">Why this matters</h4>
              <p className="text-sm text-zinc-500">
                Network latency is unpredictable. TLS handshakes, TCP slow-start, geographic
                distance - all add variance. By colocating embedding and search, QCI eliminates
                the client-as-intermediary pattern entirely. You send text, you get results.
              </p>
            </div>
          </section>
        )}

        {activeSection === 'latency' && (
          <section className="space-y-12">
            <div>
              <h2 className="text-2xl font-light mb-4">Measured latency</h2>
              <p className="text-zinc-400 max-w-2xl">
                Real numbers from Vercel to Qdrant Cloud. Same model (all-MiniLM-L6-v2, 384 dims)
                for both paths - the only difference is where embedding happens.
              </p>
            </div>

            <div className="space-y-6">
              {(() => {
                // Include cold start in total for fair comparison (first request latency)
                const getFirstRequestTime = (d: typeof BENCHMARK_DATA.external) => d.coldStart + d.totalWarm;
                const maxTotal = Math.max(...Object.values(BENCHMARK_DATA).map(getFirstRequestTime));

                // Sort by first request time (best first)
                const sortedEntries = Object.entries(BENCHMARK_DATA).sort(
                  ([, a], [, b]) => getFirstRequestTime(a) - getFirstRequestTime(b)
                );

                return sortedEntries.map(([key, data]) => {
                  const firstRequestTime = getFirstRequestTime(data);
                  const totalWidth = (firstRequestTime / maxTotal) * 100;
                  const coldStartPct = (data.coldStart / firstRequestTime) * totalWidth;
                  const embedPct = (data.warmEmbed / firstRequestTime) * totalWidth;
                  const searchPct = (data.search / firstRequestTime) * totalWidth;

                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-zinc-200">{data.name}</span>
                          <span className="text-zinc-600 text-sm">{data.subtitle}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {data.coldStart > 0 && (
                            <span className="text-sm text-zinc-500">
                              ({data.totalWarm}ms warm)
                            </span>
                          )}
                          <span className={`text-2xl font-light ${
                            key === 'qci' ? 'text-amber-400' : 'text-zinc-400'
                          }`}>
                            {firstRequestTime >= 1000
                              ? `${(firstRequestTime / 1000).toFixed(1)}s`
                              : `${firstRequestTime}ms`
                            }
                          </span>
                        </div>
                      </div>
                      <div className="h-8 bg-zinc-900 rounded-lg overflow-hidden flex">
                        {/* Cold start segment */}
                        {data.coldStart > 0 && (
                          <div
                            className={`h-full flex items-center justify-center text-xs font-medium ${
                              data.coldStart >= 10000 ? 'bg-red-500/40 text-red-300' : 'bg-yellow-500/30 text-yellow-300'
                            }`}
                            style={{width: `${coldStartPct}%`}}
                          >
                            {coldStartPct > 15 ? `cold start ${data.coldStart >= 1000 ? `${(data.coldStart / 1000).toFixed(0)}s` : `${data.coldStart}ms`}` : ''}
                          </div>
                        )}
                        {/* Embed segment */}
                        <div
                          className={`h-full flex items-center justify-center text-xs font-medium ${
                            key === 'qci' ? 'bg-amber-500/30 text-amber-300' : 'bg-zinc-700 text-zinc-400'
                          }`}
                          style={{width: `${embedPct}%`}}
                        >
                          {embedPct > 5 ? `embed` : ''}
                        </div>
                        {/* Search segment */}
                        <div
                          className="h-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-500"
                          style={{width: `${searchPct}%`}}
                        >
                          {searchPct > 5 ? `search` : ''}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-500" />
                No cold starts
              </h3>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="p-4 bg-zinc-800/50 rounded-lg text-center">
                  <div className="text-3xl font-light text-green-400 mb-1">0s</div>
                  <div className="text-xs text-zinc-500">External API</div>
                  <p className="text-xs text-zinc-600 mt-2">Always available</p>
                </div>
                <div className="p-4 bg-zinc-800/50 rounded-lg text-center border border-amber-500/20">
                  <div className="text-3xl font-light text-green-400 mb-1">0s</div>
                  <div className="text-xs text-amber-400">QCI Native</div>
                  <p className="text-xs text-zinc-600 mt-2">Always warm</p>
                </div>
              </div>
              <p className="text-xs text-zinc-600 mt-4 text-center">
                Both approaches have no cold start - the difference is network hops and total latency.
              </p>
            </div>

          </section>
        )}

        {activeSection === 'operations' && (
          <section className="space-y-12">
            <div>
              <h2 className="text-2xl font-light mb-4">What you are signing up for</h2>
              <p className="text-zinc-400 max-w-2xl">
                Performance is only part of the equation. Here is the operational reality
                of each approach.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-4 text-zinc-500 font-medium">Concern</th>
                    <th className="text-left py-4 text-zinc-500 font-medium">External API</th>
                    <th className="text-left py-4 text-amber-400 font-medium">QCI Native</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300">
                  <tr className="border-b border-zinc-800/50">
                    <td className="py-4 text-zinc-500">Setup complexity</td>
                    <td className="py-4"><span className="text-green-400">Low</span></td>
                    <td className="py-4"><span className="text-green-400">Low</span></td>
                  </tr>
                  <tr className="border-b border-zinc-800/50">
                    <td className="py-4 text-zinc-500">Infrastructure</td>
                    <td className="py-4">None</td>
                    <td className="py-4">None</td>
                  </tr>
                  <tr className="border-b border-zinc-800/50">
                    <td className="py-4 text-zinc-500">Network hops</td>
                    <td className="py-4 text-yellow-400">4 (embed + search round trips)</td>
                    <td className="py-4 text-green-400">2 (single round trip)</td>
                  </tr>
                  <tr className="border-b border-zinc-800/50">
                    <td className="py-4 text-zinc-500">Scaling</td>
                    <td className="py-4"><span className="text-yellow-400">Rate limited</span></td>
                    <td className="py-4"><span className="text-green-400">Automatic</span></td>
                  </tr>
                  <tr>
                    <td className="py-4 text-zinc-500">Vendor count</td>
                    <td className="py-4 text-yellow-400">2 (embedding API + vector DB)</td>
                    <td className="py-4 text-green-400">1 (Qdrant Cloud)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-zinc-500" />
                  <h4 className="font-medium text-zinc-300">On vendor consolidation</h4>
                </div>
                <p className="text-sm text-zinc-500">
                  Two vendors means two SLAs, two support channels, two billing relationships,
                  and debugging across system boundaries. QCI consolidates embedding and search.
                </p>
              </div>
              <div className="p-5 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-zinc-500" />
                  <h4 className="font-medium text-zinc-300">On latency</h4>
                </div>
                <p className="text-sm text-zinc-500">
                  External APIs add network round-trip to embedding provider. QCI eliminates
                  this hop by embedding in-cluster, cutting ~35% off total query latency.
                </p>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'tradeoffs' && (
          <section className="space-y-12">
            <div>
              <h2 className="text-2xl font-light mb-4">Honest trade-offs</h2>
              <p className="text-zinc-400 max-w-2xl">
                No solution is perfect for everyone. Here is where each approach
                genuinely excels and where it falls short.
              </p>
            </div>

            <div className="p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center">
                  <Server className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <h3 className="font-medium text-zinc-200">External API + Qdrant</h3>
                  <p className="text-sm text-zinc-500">HuggingFace, OpenAI, Cohere + separate vector search</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-medium text-green-400 uppercase tracking-wide mb-2">Excels at</h4>
                  <ul className="space-y-1.5 text-sm text-zinc-400">
                    <li>Zero infrastructure</li>
                    <li>Access to any embedding model</li>
                    <li>Pay-per-use flexibility</li>
                    <li>Quick prototyping</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Falls short</h4>
                  <ul className="space-y-1.5 text-sm text-zinc-500">
                    <li>~150ms total latency</li>
                    <li>4 network hops per query</li>
                    <li>Two vendor dependencies</li>
                    <li>Rate limits at scale</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-800 text-sm text-zinc-500">
                <strong className="text-zinc-400">Best for:</strong> Prototypes, when you need specific external models.
              </div>
            </div>

            <div className="p-6 bg-zinc-900/50 rounded-lg border border-amber-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-medium text-zinc-200">QCI Native</h3>
                  <p className="text-sm text-zinc-500">Embedding + search in one API call</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-medium text-amber-400 uppercase tracking-wide mb-2">Excels at</h4>
                  <ul className="space-y-1.5 text-sm text-zinc-400">
                    <li>~100ms total latency (~35% faster)</li>
                    <li>2 network hops (single round trip)</li>
                    <li>One vendor integration</li>
                    <li>Consistent latency</li>
                    <li>Automatic scaling</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Considerations</h4>
                  <ul className="space-y-1.5 text-sm text-zinc-500">
                    <li>Limited to native models (MiniLM, mxbai)</li>
                    <li>Requires Qdrant Cloud</li>
                    <li>Third-party models route externally</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-amber-500/20 text-sm text-zinc-500">
                <strong className="text-amber-400">Best for:</strong> Production RAG prioritizing latency and simplicity.
              </div>
            </div>

            <div className="p-6 bg-zinc-800/30 rounded-lg">
              <h3 className="font-medium text-zinc-300 mb-4">Decision framework</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-4">
                  <span className="text-zinc-500 w-48">Need specific external model?</span>
                  <span className="text-zinc-300">&rarr; External API + Qdrant</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-zinc-500 w-48">Just prototyping?</span>
                  <span className="text-zinc-300">&rarr; External API + Qdrant</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-zinc-500 w-48">Want lowest latency?</span>
                  <span className="text-amber-400">&rarr; QCI Native</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-zinc-500 w-48">Want single vendor?</span>
                  <span className="text-amber-400">&rarr; QCI Native</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-zinc-500 w-48">Production with standard model?</span>
                  <span className="text-amber-400">&rarr; QCI Native</span>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mt-20 pt-12 border-t border-zinc-800 text-center">
          <p className="text-zinc-500 mb-8">See the numbers in action</p>
          <div className="flex gap-6 justify-center">
            <div className="flex flex-col items-center gap-2">
              <Link
                href="/benchmark"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/10 text-amber-400
                           border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors"
              >
                Run Live Benchmark <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-xs text-zinc-600 max-w-48">
                Race all three modes side-by-side on a real query
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 text-zinc-300
                           border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Try Co-Counsel Demo
              </Link>
              <p className="text-xs text-zinc-600 max-w-48">
                Interactive legal AI demo with live embedding
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16 pt-8 border-t border-zinc-800">
          <h4 className="text-xs font-medium text-zinc-600 uppercase tracking-wide mb-3">Methodology</h4>
          <p className="text-xs text-zinc-600 max-w-2xl leading-relaxed mb-3">
            Benchmarks measured from Vercel serverless functions (us-east-1) to Qdrant Cloud (us-west-2).
            Both paths use the same model (all-MiniLM-L6-v2, 384 dims) for fair comparison.
            External API uses HuggingFace Inference API + separate Qdrant search.
            QCI Native embeds and searches in a single API call using Qdrant-hosted model.
            Collection contains 20 Wikipedia articles with HNSW indexing.
            Latencies measured over 5+ warm queries.
          </p>
          <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">
            <strong className="text-zinc-400">Note:</strong> QCI with third-party models (jinaai/, openai/, cohere/) routes to external APIs
            and won&apos;t show latency improvements. For maximum benefit, use native Qdrant-hosted models
            like all-MiniLM-L6-v2 which run directly on Qdrant infrastructure.
          </p>
        </section>
      </main>
    </div>
  );
}
