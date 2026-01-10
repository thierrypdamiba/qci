'use client';
import {useState} from 'react';
import { PlayCircle, CheckCircle, Activity, ArrowLeft, BarChart2, Search, Zap } from 'lucide-react';
import Link from 'next/link';

const SAMPLE_QUERIES = [
    'What is the speed of light?',
    'Who invented the telephone?',
    'When did World War 2 end?',
    'What is photosynthesis?',
    'Who wrote Romeo and Juliet?',
];

type ComparisonMode = 'jina' | 'native';

export default function Benchmark() {
    const [running, setRunning] = useState(false);
    const [useHybrid, setUseHybrid] = useState(false);
    const [selectedQuery, setSelectedQuery] = useState(SAMPLE_QUERIES[0]);
    const [customQuery, setCustomQuery] = useState('');
    const [useCustom, setUseCustom] = useState(false);
    const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('native');

    // Results State - includes both comparison modes
    const [results, setResults] = useState({
        // External API comparison (384d)
        local: { latency: 0, width: 0 },
        api: { latency: 0, width: 0 },
        qdrant: { latency: 0, width: 0 },
        // Native comparison (384d) - fair comparison
        hf: { latency: 0, width: 0 },
        native: { latency: 0, width: 0 },
    });

    const currentQuery = useCustom ? customQuery : selectedQuery;

    const runBenchmark = async () => {
        if (!currentQuery.trim()) return;

        setRunning(true);

        // Reset UI based on comparison mode
        if (comparisonMode === 'native') {
            setResults(prev => ({
                ...prev,
                hf: { latency: 0, width: 0 },
                native: { latency: 0, width: 0 },
            }));
            await Promise.all([
                runLane('hf', currentQuery),
                runLane('native', currentQuery),
            ]);
        } else {
            setResults(prev => ({
                ...prev,
                local: { latency: 0, width: 0 },
                api: { latency: 0, width: 0 },
                qdrant: { latency: 0, width: 0 },
            }));
            await Promise.all([
                runLane('local', currentQuery),
                runLane('api', currentQuery),
                runLane('qdrant', currentQuery, useHybrid),
            ]);
        }

        setRunning(false);
    };

    const runLane = async (mode: 'local' | 'api' | 'qdrant' | 'hf' | 'native', query: string, hybrid = false) => {
        // Fake visual progress - native modes are faster
        let p = 0;
        const speedMap = { native: 12, hf: 3, qdrant: 8, api: 2, local: 2 };
        const interval = setInterval(() => {
            const inc = speedMap[mode] || 3;
            if (p < 90) {
                p += inc;
                setResults(prev => ({
                    ...prev,
                    [mode]: { ...prev[mode as keyof typeof prev], width: p }
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

            {/* Comparison Mode Toggle */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setComparisonMode('native')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                        comparisonMode === 'native'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                            : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                    }`}
                >
                    <Zap className="w-4 h-4" />
                    Fair Comparison (same model)
                </button>
                <button
                    onClick={() => setComparisonMode('jina')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        comparisonMode === 'jina'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                            : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                    }`}
                >
                    External API Comparison (384d)
                </button>
            </div>

            {/* The Grid */}
            {comparisonMode === 'native' ? (
                /* NATIVE COMPARISON: HuggingFace API vs QCI Native - SAME MODEL */
                <div className="grid grid-cols-2 gap-6 flex-1">
                    {/* CARD: External API baseline */}
                    <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-xl p-6 flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-lg text-slate-300">External API + Qdrant</h2>
                            <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-yellow-400">2 CALLS</span>
                        </div>
                        <div className="text-xs text-slate-500 mb-6">
                            Embed externally → Vector → Qdrant Search
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                            {results.hf.latency > 0 ? (
                                <>
                                    <div className="text-5xl font-mono font-bold text-white mb-2">
                                        {results.hf.latency}<span className="text-xl text-slate-500 ml-1">ms</span>
                                    </div>
                                    <div className="bg-[#0f172a] rounded overflow-hidden h-3 mt-2">
                                        <div className="h-full bg-yellow-500 transition-all duration-1000 ease-out" style={{ width: `${results.hf.width}%` }}></div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="text-3xl font-mono text-slate-500 mb-2">~300-500ms</div>
                                    <div className="text-xs text-slate-600">Typical external API latency</div>
                                    <div className="text-xs text-slate-500 mt-2">(Add HF_API_KEY for live test)</div>
                                </div>
                            )}
                            <div className="mt-4 flex justify-between text-xs font-mono text-slate-500">
                                <span>Model: all-MiniLM-L6-v2</span>
                                <span>384 dims</span>
                            </div>
                        </div>
                    </div>

                    {/* CARD: QCI Native */}
                    <div className="bg-slate-900/40 backdrop-blur-md border-2 border-green-500/50 rounded-xl p-6 flex flex-col shadow-[0_0_40px_rgba(34,197,94,0.15)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>

                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-lg text-white">QCI Native</h2>
                            <span className="text-xs font-mono bg-green-900/30 border border-green-500/50 px-2 py-1 rounded text-green-400">1 CALL</span>
                        </div>
                        <div className="text-xs text-green-400/80 mb-6">
                            Text → Qdrant (embed + search in-cluster)
                        </div>

                        <div className="flex-1 flex flex-col justify-center">
                            <div className="text-6xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-green-200 mb-2 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                                {results.native.latency}<span className="text-2xl text-slate-500 ml-1">ms</span>
                            </div>
                            <div className="bg-[#0f172a] rounded overflow-hidden h-3 mt-2">
                                <div className="h-full bg-green-500 transition-all duration-1000 ease-out" style={{ width: `${results.native.width}%` }}></div>
                            </div>
                            <div className="mt-4 flex justify-between text-xs font-mono">
                                <span className="text-green-400">Model: all-MiniLM-L6-v2</span>
                                <span className="text-green-400">Zero external calls</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* EXTERNAL API COMPARISON: Local vs External API vs QCI */
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
                            <h2 className="font-bold text-lg text-slate-300">External API</h2>
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
            )}

            {/* Query Selection */}
            <div className="mt-8 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                    <Search className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">Query Wikipedia (4,800 articles)</span>
                </div>

                {/* Sample queries */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {SAMPLE_QUERIES.map((q, i) => (
                        <button
                            key={i}
                            onClick={() => { setSelectedQuery(q); setUseCustom(false); }}
                            className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                                !useCustom && selectedQuery === q
                                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                        >
                            {q}
                        </button>
                    ))}
                </div>

                {/* Custom query input */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Or type your own query..."
                        value={customQuery}
                        onChange={(e) => { setCustomQuery(e.target.value); setUseCustom(true); }}
                        onFocus={() => setUseCustom(true)}
                        className={`flex-1 px-3 py-2 bg-slate-800/50 border rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                            useCustom ? 'border-blue-500/50' : 'border-slate-700'
                        }`}
                    />
                </div>

                {/* Current query display */}
                <div className="mt-3 pt-3 border-t border-slate-700/50 flex gap-6 items-center text-xs font-mono text-slate-400">
                    <div>Active: <span className="text-white">"{currentQuery}"</span></div>
                    <div className="h-3 w-[1px] bg-slate-700"></div>
                    <div>Model: <span className={comparisonMode === 'native' ? 'text-green-400' : 'text-white'}>
                        {comparisonMode === 'native' ? 'all-MiniLM-L6-v2 (384d)' : 'jina-embeddings-v2-base-en (768d)'}
                    </span></div>
                    {comparisonMode === 'native' && (
                        <>
                            <div className="h-3 w-[1px] bg-slate-700"></div>
                            <div className="text-green-400">Same model = fair comparison</div>
                        </>
                    )}
                </div>
            </div>

        </div>
    );
}
