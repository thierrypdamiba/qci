'use client';
import { useState } from 'react';

export default function DragRace() {
    const [racing, setRacing] = useState(false);

    // State for each lane
    const [localWidth, setLocalWidth] = useState(0);
    const [localTime, setLocalTime] = useState("0 ms");
    const [localLabelOpacity, setLocalLabelOpacity] = useState(0);
    const [localDim, setLocalDim] = useState(false);

    const [apiWidth, setApiWidth] = useState(0);
    const [apiTime, setApiTime] = useState("0 ms");
    const [apiLabelOpacity, setApiLabelOpacity] = useState(0);
    const [apiDim, setApiDim] = useState(false);

    const [qdrantWidth, setQdrantWidth] = useState(0);
    const [qdrantTime, setQdrantTime] = useState("0 ms");
    const [qdrantLabelOpacity, setQdrantLabelOpacity] = useState(0);
    const [qdrantDim, setQdrantDim] = useState(false);

    const startRace = async () => {
        setRacing(true);

        // Reset
        setLocalWidth(0); setLocalTime("0 ms"); setLocalLabelOpacity(0); setLocalDim(false);
        setApiWidth(0); setApiTime("0 ms"); setApiLabelOpacity(0); setApiDim(false);
        setQdrantWidth(0); setQdrantTime("0 ms"); setQdrantLabelOpacity(0); setQdrantDim(false);

        const query = "Evidence regarding threats to kill competition";

        await Promise.all([
            runLane('local', query),
            runLane('api', query),
            runLane('qdrant', query)
        ]);

        setRacing(false);
    };

    const runLane = async (mode: string, query: string) => {
        // Fake animation loop
        let width = 0;
        const interval = setInterval(() => {
            if (width < 90) {
                if (mode === 'local') width += Math.random() * 2; // Choppy
                else if (mode === 'api') width += 1; // Steady slow
                else width += 5; // Fast

                if (mode === 'local') setLocalWidth(width);
                if (mode === 'api') setApiWidth(width);
                if (mode === 'qdrant') setQdrantWidth(width);
            }
        }, 20);

        // Actual API Call
        try {
            const res = await fetch(`/api/race?mode=${mode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: query })
            });
            const data = await res.json();

            clearInterval(interval);

            // Finish
            if (mode === 'local') {
                setLocalWidth(100);
                setLocalTime(data.ms + " ms");
                setLocalLabelOpacity(1);
                if (!data.winner) setLocalDim(true);
            }
            if (mode === 'api') {
                setApiWidth(100);
                setApiTime(data.ms + " ms");
                setApiLabelOpacity(1);
                if (!data.winner) setApiDim(true);
            }
            if (mode === 'qdrant') {
                setQdrantWidth(100);
                setQdrantTime(data.ms + " ms");
                setQdrantLabelOpacity(1);
                // Winner usually doesn't dim
            }

        } catch (e) {
            console.error(e);
            clearInterval(interval);
        }
    };

    return (
        <div className="h-[calc(100vh-9rem)] flex flex-col items-center justify-center p-8 bg-[#050505] text-white font-mono bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">

            <div className="w-full max-w-4xl">

                {/* HEADER */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-2 tracking-wider font-sans">LATENCY <span className="text-blue-600">SHOOTOUT</span></h1>
                    <p className="text-gray-500 uppercase tracking-widest text-sm">Real-time Architecture Benchmark // all-MiniLM-L6-v2 (384d)</p>
                </div>

                {/* RACE TRACK */}
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-8 shadow-2xl backdrop-blur-sm">

                    {/* LANE 1: LOCAL */}
                    <div className="mb-8 relative">
                        <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase">
                            <span>Lane 1: Local (FastEmbed)</span>
                            <span className={`text-white transition-all ${localDim ? 'opacity-50' : ''}`}>{localTime}</span>
                        </div>
                        <div className="h-12 bg-gray-800 rounded-lg overflow-hidden relative border border-gray-700">
                            <div
                                className={`h-full bg-red-600 flex items-center justify-end px-3 transition-all duration-200 ${localDim ? 'opacity-50' : ''}`}
                                style={{ width: `${localWidth}%` }}
                            >
                                <span className="text-[10px] font-bold text-black transition-opacity" style={{ opacity: localLabelOpacity }}>CPU BOUND</span>
                            </div>
                        </div>
                    </div>

                    {/* LANE 2: API */}
                    <div className="mb-8 relative">
                        <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase">
                            <span>Lane 2: External API</span>
                            <span className={`text-white transition-all ${apiDim ? 'opacity-50' : ''}`}>{apiTime}</span>
                        </div>
                        <div className="h-12 bg-gray-800 rounded-lg overflow-hidden relative border border-gray-700">
                            <div
                                className={`h-full bg-yellow-500 flex items-center justify-end px-3 transition-all duration-200 ${apiDim ? 'opacity-50' : ''}`}
                                style={{ width: `${apiWidth}%` }}
                            >
                                <span className="text-[10px] font-bold text-black transition-opacity" style={{ opacity: apiLabelOpacity }}>NETWORK LAG</span>
                            </div>
                        </div>
                    </div>

                    {/* LANE 3: QDRANT */}
                    <div className="relative">
                        <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase">
                            <span>Lane 3: Qdrant Cloud Inference</span>
                            <span className={`text-white transition-all ${qdrantDim ? 'opacity-50' : 'text-green-400 font-bold text-xl'}`}>{qdrantTime}</span>
                        </div>
                        <div className="h-12 bg-gray-800 rounded-lg overflow-hidden relative border border-blue-900 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                            <div
                                className={`h-full bg-blue-500 flex items-center justify-end px-3 shadow-[0_0_15px_#3b82f6] transition-all duration-200 ${qdrantDim ? 'opacity-50' : ''}`}
                                style={{ width: `${qdrantWidth}%` }}
                            >
                                <span className="text-[10px] font-bold text-white transition-opacity" style={{ opacity: qdrantLabelOpacity }}>WINNER</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* CONTROLS */}
                <div className="mt-12 text-center">
                    <button
                        onClick={startRace}
                        disabled={racing}
                        className="text-xl font-bold bg-white text-black px-12 py-4 rounded hover:bg-gray-200 transition transform hover:scale-105 shadow-xl border-b-4 border-gray-400 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {racing ? "RACING..." : "RUN BENCHMARK"}
                    </button>
                    <div className="mt-4 text-xs text-gray-600">Query: "Evidence regarding threats to kill competition"</div>
                </div>

            </div>
        </div>
    );
}
