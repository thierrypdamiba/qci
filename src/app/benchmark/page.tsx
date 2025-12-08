'use client';
import {useState} from 'react';
import { PlayCircle, CheckCircle, Activity, ArrowLeft, BarChart2 } from 'lucide-react';
import Link from 'next/link';

export default function Benchmark() {
    const [running, setRunning] = useState(false);
    const [useHybrid, setUseHybrid] = useState(false);

    // Results State
    const [results, setResults] = useState({
        local: { latency: 0, width: 0 },
        api: { latency: 0, width: 0 },
        qdrant: { latency: 0, width: 0 }
    });

    const runBenchmark = async () => {
        setRunning(true);

        // Reset UI
        setResults({
            local: { latency: 0, width: 0 },
            api: { latency: 0, width: 0 },
            qdrant: { latency: 0, width: 0 }
        });

        const query = "strategy to kill netscape";

        await Promise.all([
            runLane('local', query),
            runLane('api', query),
            runLane('qdrant', query, useHybrid)
        ]);

        setRunning(false);
    };

    const runLane = async (mode: 'local' | 'api' | 'qdrant', query: string, hybrid = false) => {
        // Fake visual progress
        let p = 0;
        const interval = setInterval(() => {
            const inc = mode === 'qdrant' ? 8 : (mode === 'api' ? 2 : Math.random() * 3);
            if (p < 90) {
                p += inc;
                setResults(prev => ({
                    ...prev,
                    [mode]: { ...prev[mode], width: p }
                }));
            }
        }, 50);

        try {
            const res = await fetch(`/api/benchmark?mode=${mode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: query, use_hybrid: hybrid })
            });
            const data = await res.json();

            clearInterval(interval);

            setResults(prev => ({
                ...prev,
                [mode]: { latency: data.latency, width: 100 }
            }));
        } catch (e) {
            console.error(e);
            clearInterval(interval);
        }
    };

    return (
        <div className="h-[calc(100vh-9rem)] flex flex-col p-10 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-white font-sans">

            {/* Navigation */}
            <div className="flex justify-between items-center mb-6">
                <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Demo
                </Link>
                <Link href="/compare" className="flex items-center gap-2 text-amber-400/80 hover:text-amber-300 transition-colors text-sm">
                    <BarChart2 className="w-4 h-4" />
                    Why QCI?
                </Link>
            </div>

            {/* Header */}
            <div className="flex justify-between items-end mb-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_green]"></div>
                        <span className="text-xs font-mono text-green-500 font-bold tracking-widest uppercase">Cloud Inference v1.4</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white">Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">Showdown</span></h1>
                </div>

                <button
                    onClick={runBenchmark}
                    disabled={running}
                    className="px-8 py-3 bg-white text-black font-bold rounded hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {running ? <Activity className="animate-spin w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                    {running ? "BENCHMARKING..." : "RUN BENCHMARK"}
                </button>
            </div>

            {/* The Grid */}
            <div className="grid grid-cols-3 gap-6 flex-1">

                {/* CARD 1: LOCAL */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-xl p-6 flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-lg text-slate-300">Local (Laptop)</h2>
                        <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-red-400">CPU BOUND</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="text-4xl font-mono font-bold text-white mb-2">
                            {results.local.latency}<span className="text-lg text-slate-500 ml-1">ms</span>
                        </div>
                        <div className="bg-[#0f172a] rounded overflow-hidden h-2 mt-2">
                            <div className="h-full bg-red-500 transition-all duration-1000 ease-out" style={{ width: `${results.local.width}%` }}></div>
                        </div>
                        <div className="mt-4 flex justify-between text-xs font-mono text-slate-500">
                            <span>Payload: 4.2KB</span>
                            <span>Complexity: High</span>
                        </div>
                    </div>
                </div>

                {/* CARD 2: API */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-xl p-6 flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-lg text-slate-300">Jina API</h2>
                        <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-yellow-400">NETWORK BOUND</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="text-4xl font-mono font-bold text-white mb-2">
                            {results.api.latency}<span className="text-lg text-slate-500 ml-1">ms</span>
                        </div>
                        <div className="bg-[#0f172a] rounded overflow-hidden h-2 mt-2">
                            <div className="h-full bg-yellow-500 transition-all duration-1000 ease-out" style={{ width: `${results.api.width}%` }}></div>
                        </div>
                        <div className="mt-4 flex justify-between text-xs font-mono text-slate-500">
                            <span>Payload: 4.2KB</span>
                            <span>Complexity: Med</span>
                        </div>
                    </div>
                </div>

                {/* CARD 3: QDRANT (Feature Rich) */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-blue-500/50 rounded-xl p-6 flex flex-col shadow-[0_0_40px_rgba(59,130,246,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-lg text-white">Qdrant Cloud</h2>
                        <span className="text-xs font-mono bg-blue-900/30 border border-blue-500/50 px-2 py-1 rounded text-blue-400">OPTIMIZED</span>
                    </div>

                    {/* Qdrant Feature Toggles */}
                    <div className="mb-6 space-y-2 bg-slate-900/50 p-3 rounded border border-white/5">

                        {/* Hybrid Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-300">Universal Query API</span>
                                <span className="text-[10px] text-slate-500">Dense + Sparse Fusion (RRF)</span>
                            </div>
                            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input
                                    type="checkbox"
                                    id="hybridToggle"
                                    checked={useHybrid}
                                    onChange={(e) => setUseHybrid(e.target.checked)}
                                    className="absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-700 checked:right-0 checked:border-blue-500 transition-all right-full"
                                    style={{ right: useHybrid ? '0' : 'auto', left: useHybrid ? 'auto' : '0' }}
                                />
                                <label
                                    htmlFor="hybridToggle"
                                    className={`block overflow-hidden h-5 rounded-full cursor-pointer ${useHybrid ? 'bg-blue-600' : 'bg-slate-700'}`}
                                ></label>
                            </div>
                        </div>

                        {/* Quantization Badge (Visual Only for Demo) */}
                        <div className="flex items-center justify-between opacity-50">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-300">Binary Quantization</span>
                                <span className="text-[10px] text-slate-500">Always-on 30% Speedup</span>
                            </div>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        <div className="text-6xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-blue-200 mb-2 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                            {results.qdrant.latency}<span className="text-2xl text-slate-500 ml-1">ms</span>
                        </div>
                        <div className="bg-[#0f172a] rounded overflow-hidden h-2 mt-2">
                            <div className="h-full bg-blue-500 transition-all duration-1000 ease-out" style={{ width: `${results.qdrant.width}%` }}></div>
                        </div>
                        <div className="mt-4 flex justify-between text-xs font-mono text-green-400">
                            <span>Payload: <span className="text-white">0.05KB</span></span>
                            <span>Status: <span>{useHybrid ? "HYBRID FUSION" : "DENSE SEARCH"}</span></span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Code Peek Footer */}
            <div className="mt-8 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-lg p-4 flex gap-8 items-center text-xs font-mono text-slate-400">
                <div>Query: <span className="text-white">"strategy to kill netscape"</span></div>
                <div className="h-4 w-[1px] bg-slate-700"></div>
                <div>Active Model: <span className="text-white">Jina v3 (1024d)</span></div>
                <div className="h-4 w-[1px] bg-slate-700"></div>
                <div className={`text-blue-400 transition-opacity duration-300 ${useHybrid ? 'opacity-100' : 'opacity-0'}`}>
                    client.query_points(fusion=RRF)
                </div>
            </div>

        </div>
    );
}
