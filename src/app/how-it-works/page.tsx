import React from 'react';
import { Gavel, CloudLightning, Laptop, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-[#02040a] text-white font-sans bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col md:flex-row relative">

                {/* Back Button */}
                <Link href="/" className="absolute top-4 left-4 z-50 p-2 rounded-full bg-black/40 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>

                {/* Left: The Context */}
                <div className="p-12 md:w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-center">
                    <div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Gavel className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white">AI Co-Counsel</h2>
                        </div>
                        <p className="text-lg text-slate-400 leading-relaxed mb-8">
                            You are observing a real-time legal assistant analyzing a courtroom transcript.
                            To be effective, it must <strong>listen, research, and advise</strong> in the blink of an eye.
                        </p>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-red-400 shrink-0"></div>
                                <span className="text-base text-slate-300"><strong className="text-white">The Challenge:</strong> Traditional RAG pipelines are too slow. Moving data between the database and the embedding model creates network latency.</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-yellow-400 shrink-0"></div>
                                <span className="text-base text-slate-300"><strong className="text-white">The Goal:</strong> Provide instant, grounded objections the moment the witness finishes speaking.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right: The Solution */}
                <div className="p-12 md:w-1/2 bg-slate-900 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <CloudLightning className="w-8 h-8 text-blue-400" />
                            <h3 className="text-2xl font-bold text-white">Powered by Qdrant Cloud Inference</h3>
                        </div>

                        <p className="text-lg text-slate-400 leading-relaxed mb-10">
                            We are comparing two architectures side-by-side:
                        </p>

                        <div className="space-y-6 mb-10">
                            <div className="p-6 rounded-xl bg-slate-800/50 border border-white/5 flex items-center gap-6">
                                <Laptop className="w-8 h-8 text-slate-500" />
                                <div>
                                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Client-Side (Standard)</div>
                                    <div className="text-base text-slate-300">Embeddings run on the application server.</div>
                                </div>
                            </div>

                            <div className="p-6 rounded-xl bg-blue-900/10 border border-blue-500/30 flex items-center gap-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
                                <CloudLightning className="w-8 h-8 text-blue-400 relative z-10" />
                                <div className="relative z-10">
                                    <div className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-1">Qdrant Cloud Inference</div>
                                    <div className="text-base text-white">Embeddings run <strong>on the database cluster</strong>. Zero network hops.</div>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/"
                            className="block w-full py-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-center transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:scale-[1.02]"
                        >
                            Try it Now!
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
