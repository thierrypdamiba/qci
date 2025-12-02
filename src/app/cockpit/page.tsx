'use client';
import { useState, useEffect, useRef } from 'react';
import { Mic, Gavel, ShieldCheck, ChevronDown, Activity, Database, Zap, Layers, GitMerge, Laptop, Trophy, CloudLightning } from 'lucide-react';

const CASES = {
    msft: {
        title: "US v. Microsoft",
        color: "blue",
        script: [
            { s: "JUDGE JACKSON", t: "Mr. Boies, you may continue your cross-examination." },
            { s: "MR. BOIES (GOV)", t: "Mr. Gates, you claim Microsoft welcomes competition." },
            { s: "BILL GATES", t: "That is correct. We innovate for customers." },
            { s: "MR. BOIES (GOV)", t: "Did you ever have a strategy to kill Netscape?" }, // OBJECTION!
            { s: "BILL GATES", t: "I... I don't recall using that language." },
            { s: "MR. BOIES (GOV)", t: "Did you refer to the meeting as a 'visit from the Godfather'?" }, // OBJECTION!
            { s: "BILL GATES", t: "I did not." },
            { s: "MR. BOIES (GOV)", t: "Did you write that you must control the browser to control the platform?" }, // OBJECTION!
            { s: "BILL GATES", t: "I write many memos." }
        ]
    },
    enron: {
        title: "US v. Skilling (Enron)",
        color: "emerald",
        script: [
            { s: "PROSECUTOR", t: "Mr. Skilling, let's discuss the accounting practices." },
            { s: "JEFF SKILLING", t: "Our accounting was aggressive but compliant." },
            { s: "PROSECUTOR", t: "Did you use mark-to-market to book future profits today?" }, // OBJECTION!
            { s: "JEFF SKILLING", t: "It is the industry standard for energy trading." },
            { s: "PROSECUTOR", t: "Tell us about the Raptor vehicles. Were they hiding debt?" }, // OBJECTION!
            { s: "JEFF SKILLING", t: "They were hedging instruments." },
            { s: "PROSECUTOR", t: "Did you manipulate the California energy market?" }, // OBJECTION!
            { s: "JEFF SKILLING", t: "The market was flawed. We just traded it." }
        ]
    },
    oj: {
        title: "People v. Simpson",
        color: "orange",
        script: [
            { s: "MR. DARDEN", t: "Mr. Simpson, please try on the glove found at the scene." },
            { s: "O.J. SIMPSON", t: "(Struggles) It's too small. It doesn't fit." }, // OBJECTION!
            { s: "MR. COCHRAN", t: "If it doesn't fit, you must acquit." },
            { s: "MR. DARDEN", t: "We have DNA evidence placing you at the scene." }, // OBJECTION!
            { s: "MR. SCHECK", t: "The collection methods were flawed." },
            { s: "MR. DARDEN", t: "The timeline establishes opportunity." }, // OBJECTION!
            { s: "MR. COCHRAN", t: "The timeline is physically impossible." }
        ]
    },
    kitzmiller: {
        title: "Kitzmiller v. Dover",
        color: "purple",
        script: [
            { s: "MR. MUISE", t: "Dr. Behe, look at page 99 of 'Of Pandas and People'." },
            { s: "MR. MUISE", t: "It says: 'Intelligent design means life began abruptly through an intelligent agency.'" },
            { s: "MICHAEL BEHE", t: "I think that's a way of saying this is a matter of disagreement." },
            { s: "MR. MUISE", t: "Dr. Padian testified that 'abrupt' means something different in geology." }, // OBJECTION!
            { s: "MR. ROTHSCHILD", t: "Objection, mischaracterizing Dr. Padian's testimony." },
            { s: "THE COURT", t: "In what sense?" },
            { s: "MR. ROTHSCHILD", t: "Dr. Padian referred to fossils, not the appearance of creatures." },
            { s: "THE COURT", t: "If you're going to paraphrase Dr. Padian, you ought to be sure." }, // SUSTAINED
            { s: "THE COURT", t: "I'll sustain the objection. You can rephrase." },
            { s: "MR. MUISE", t: "Dr. Behe, do you see 'abrupt' as a concept in geological time?" },
            { s: "MICHAEL BEHE", t: "Yes. Pandas is speaking of the fossil record." }
        ]
    }
};

export default function Cockpit() {
    const [activeCase, setActiveCase] = useState<keyof typeof CASES>('msft');
    const [transcriptLines, setTranscriptLines] = useState<any[]>([]);
    const [started, setStarted] = useState(false);

    // Dual Lane State
    const [qciState, setQciState] = useState({
        trace: { decision: "WAITING...", text: "...", collection: "---", filters: "---", dense: { ms: 0, model: "---", dim: 0 }, sparse: { ms: 0, model: "---" }, hybrid: { dense_k: 0, sparse_k: 0 }, fusion: { method: "---", results: 0, top_k: "---" }, latency_e2e: 0 },
        insight: { type: "INFO", recommendation: "Stand by", score: 0, script: "---", glow: '' },
        hits: [] as any[],
        timings: { preprocess: 0, embed_dense: 0, embed_sparse: 0, search: 0, fusion: 0, total: 0 }
    });

    const [localState, setLocalState] = useState({
        trace: { decision: "WAITING...", text: "...", collection: "---", filters: "---", dense: { ms: 0, model: "---", dim: 0 }, sparse: { ms: 0, model: "---" }, hybrid: { dense_k: 0, sparse_k: 0 }, fusion: { method: "---", results: 0, top_k: "---" }, latency_e2e: 0 },
        insight: { type: "INFO", recommendation: "Stand by", score: 0, script: "---", glow: '' },
        hits: [] as any[],
        timings: { preprocess: 0, embed_dense: 0, embed_sparse: 0, search: 0, fusion: 0, total: 0 }
    });

    // History State
    const [history, setHistory] = useState<any[]>([]);

    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const historyEndRef = useRef<HTMLDivElement>(null);

    const startTrial = () => {
        setStarted(true);
        setTranscriptLines([]);
        setHistory([]);
        let i = 0;
        const currentScript = CASES[activeCase].script;

        const nextLine = async () => {
            if (i >= currentScript.length) return;
            const line = currentScript[i];

            setTranscriptLines(prev => [...prev, line]);

            // ALWAYS SEARCH (Continuous Scanning)
            await performSearch(line.t);

            i++;
            setTimeout(nextLine, 4000);
        };
        nextLine();
    };

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [transcriptLines]);

    useEffect(() => {
        historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    const performSearch = async (query: string) => {
        // 1. SET SCANNING STATE
        setQciState(prev => ({ ...prev, trace: { ...prev.trace, decision: "ANALYZING...", text: query } }));
        setLocalState(prev => ({ ...prev, trace: { ...prev.trace, decision: "ANALYZING...", text: query } }));

        try {
            // 2. CONCURRENT REQUESTS
            const [qciRes, localRes] = await Promise.all([
                fetch('/api/cockpit?mode=qdrant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: query }) }),
                fetch('/api/cockpit?mode=local', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: query }) })
            ]);

            const qciData = await qciRes.json();
            const localData = await localRes.json();

            // 3. UPDATE STATES
            const updateLane = (data: any, setState: any) => {
                const isActionable = data.trace.decision === "ACTIONABLE";
                setState((prev: any) => ({
                    trace: { ...data.trace, text: query },
                    hits: data.hits || [],
                    timings: data.timings || { total: 0 },
                    insight: {
                        type: isActionable ? "OBJECTION" : "INFO",
                        recommendation: isActionable ? data.recommendation : "Stand by",
                        score: data.score,
                        script: isActionable ? data.script : "---",
                        glow: isActionable ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'border-white/10'
                    }
                }));

                // Remove glow
                if (isActionable) {
                    setTimeout(() => {
                        setState((prev: any) => ({ ...prev, insight: { ...prev.insight, glow: 'border-white/10' } }));
                    }, 2500);
                }
            };

            updateLane(qciData, setQciState);
            updateLane(localData, setLocalState);

            // 4. HISTORY (Unified - based on QCI for now)
            if (qciData.trace.decision === "ACTIONABLE") {
                setHistory(prev => [...prev, {
                    title: qciData.objection,
                    text: query,
                    timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
                }]);
            }

        } catch (e) {
            console.error(e);
        }
    };

    // Timeline Step Component
    const TimelineStep = ({
        icon: Icon,
        label,
        value,
        status = "default",
        expanded,
        onToggle,
        children,
        subValue
    }: any) => {
        const statusColors = {
            default: "text-slate-500",
            ok: "text-emerald-400",
            warn: "text-yellow-400",
            alert: "text-red-400",
            fast: "text-blue-400",
            slow: "text-orange-400"
        };

        return (
            <div className="border border-white/5 rounded-lg bg-slate-900/40 overflow-hidden transition-all duration-300">
                <div
                    onClick={onToggle}
                    className={`flex items-center justify-between p-2 cursor-pointer hover:bg-white/5 transition-colors ${expanded ? 'bg-white/5' : ''}`}
                >
                    <div className="flex items-center gap-3">
                        <Icon className={`w-3.5 h-3.5 ${statusColors[status as keyof typeof statusColors] || statusColors.default}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {subValue && <span className="text-[9px] text-slate-500 hidden sm:inline">{subValue}</span>}
                        <span className={`text-[10px] font-mono ${value === "---" ? "text-slate-600" : "text-slate-200 animate-fade-in"}`}>{value}</span>
                        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </div>
                </div>
                {expanded && (
                    <div className="p-2 border-t border-white/5 bg-black/20 animate-fade-in">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    // Lane Component
    const Lane = ({ title, state, hits, insight, isLocal, opponentState }: any) => {
        const [expandedSteps, setExpandedSteps] = useState<string[]>(['trigger', 'query', 'embed', 'search', 'fusion', 'decision']);
        const [showAllEvidence, setShowAllEvidence] = useState(false);

        // Auto-expand Decision on Objection
        useEffect(() => {
            if (state.trace.decision === "ACTIONABLE") {
                setExpandedSteps(prev => prev.includes("decision") ? prev : [...prev, "decision"]);
            }
        }, [state.trace.decision]);

        const toggle = (step: string) => {
            setExpandedSteps(prev =>
                prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
            );
        };
        const isQci = !isLocal;

        // Calculate Embed Delta (only for QCI)
        const embedDelta = isQci && state.timings.embed_dense > 0 && opponentState?.timings.embed_dense > 0
            ? state.timings.embed_dense - opponentState.timings.embed_dense
            : 0;

        return (
            <div className="flex flex-col h-full gap-2 overflow-hidden">
                {/* Sticky Header */}
                <div className={`shrink-0 p-3 rounded-xl border flex justify-between items-center ${isLocal ? 'bg-slate-800/40 border-slate-700/50' : 'bg-blue-900/20 border-blue-500/30'}`}>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            {isLocal ? <Laptop className="w-4 h-4 text-slate-400" /> : <CloudLightning className="w-4 h-4 text-blue-400" />}
                            <span className={`text-xs font-bold uppercase tracking-widest ${isLocal ? 'text-slate-300' : 'text-blue-300'}`}>{title}</span>
                        </div>
                        {isQci && embedDelta !== 0 && (
                            <div className="text-[10px] font-mono text-green-400 mt-0.5">
                                Embed Δ: {embedDelta.toFixed(0)}ms
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] text-slate-500 uppercase">Total E2E</span>
                        <span className={`text-sm font-mono font-bold ${state.timings.total < 100 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {state.timings.total > 0 ? `${state.timings.total}ms` : "---"}
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 pr-1 scroll-thin">

                    {/* 1. Trigger */}
                    <TimelineStep
                        icon={Activity}
                        label="Trigger"
                        value="Active"
                        status="ok"
                        expanded={expandedSteps.includes("trigger")}
                        onToggle={() => toggle("trigger")}
                    >
                        <div className="text-[10px] text-slate-400">
                            Detected new transcript line.
                        </div>
                    </TimelineStep>

                    {/* 2. Query */}
                    <TimelineStep
                        icon={Zap}
                        label="Query Built"
                        value={state.timings.preprocess > 0 ? `${state.timings.preprocess}ms` : "---"}
                        status="default"
                        expanded={expandedSteps.includes("query")}
                        onToggle={() => toggle("query")}
                    >
                        <div className="space-y-1">
                            <div className="bg-slate-800/50 p-1.5 rounded border border-white/5">
                                <div className="text-[9px] text-slate-500 uppercase mb-0.5">Locked Input</div>
                                <div className="text-[10px] italic text-slate-300 truncate">"{state.trace.text}"</div>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">case_id: {activeCase}</span>
                            </div>
                        </div>
                    </TimelineStep>

                    {/* 3. Embed */}
                    <TimelineStep
                        icon={isQci ? CloudLightning : Laptop}
                        label={isQci ? "Embed (In-Cluster)" : "Embed (Client)"}
                        value={state.timings.embed_dense > 0 ? `${state.timings.embed_dense}ms` : "---"}
                        status={isQci ? "fast" : "slow"}
                        subValue={state.trace.dense.model}
                        expanded={expandedSteps.includes("embed")}
                        onToggle={() => toggle("embed")}
                    >
                        <div className="space-y-1 text-[10px] font-mono">
                            <div className="flex justify-between items-center">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${isQci ? "bg-blue-900/50 text-blue-300 border border-blue-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
                                    {isQci ? "In-Cluster" : "Client-Side"}
                                </span>
                                {isQci && opponentState?.timings.embed_dense > 0 && (
                                    <span className="text-green-400 font-bold">
                                        {state.timings.embed_dense}ms <span className="text-slate-500 font-normal">vs {opponentState.timings.embed_dense}ms</span>
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Model</span>
                                <span className="text-slate-300">{state.trace.dense.model}</span>
                            </div>
                        </div>
                    </TimelineStep>

                    {/* 4. Search */}
                    <TimelineStep
                        icon={Database}
                        label="Hybrid Search"
                        value={state.timings.search > 0 ? `${state.timings.search}ms` : "---"}
                        status="default"
                        expanded={expandedSteps.includes("search")}
                        onToggle={() => toggle("search")}
                    >
                        <div className="space-y-1 text-[10px] font-mono">
                            <div className="flex justify-between p-1.5 bg-slate-800/30 rounded border border-white/5">
                                <span className="text-slate-300">dense k=30 • sparse k=30 • retrieved 60</span>
                            </div>
                        </div>
                    </TimelineStep>

                    {/* 5. Fusion (Evidence) */}
                    <TimelineStep
                        icon={GitMerge}
                        label="Fusion (RRF)"
                        value={state.timings.fusion > 0 ? `${state.timings.fusion}ms` : "---"}
                        status="default"
                        subValue={`Top ${state.trace.fusion.top_k}`}
                        expanded={expandedSteps.includes("fusion")}
                        onToggle={() => toggle("fusion")}
                    >
                        <div className="space-y-2">
                            <div className="space-y-1.5">
                                {(showAllEvidence ? hits : hits.slice(0, 3)).map((hit: any, i: number) => (
                                    <div key={i} className="bg-black/40 p-1.5 rounded border border-white/5 hover:border-blue-500/30 transition-colors group">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-blue-300 truncate w-24">{hit.title}</span>
                                                <span className="text-[8px] text-slate-500 bg-slate-800/50 px-1 rounded uppercase">{hit.payload?.doc_type || "doc"}</span>
                                            </div>
                                            <span className="text-[9px] text-green-400 font-mono">#{hit.fused_rank}</span>
                                        </div>
                                        <div className="text-[9px] text-slate-400 line-clamp-1 font-serif" dangerouslySetInnerHTML={{ __html: hit.snippet }}></div>
                                    </div>
                                ))}
                            </div>
                            {hits.length > 3 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowAllEvidence(!showAllEvidence); }}
                                    className="w-full py-1 text-[9px] text-slate-500 hover:text-slate-300 uppercase tracking-widest border border-white/5 rounded hover:bg-white/5 transition-colors"
                                >
                                    {showAllEvidence ? "Show Less" : `View All (${hits.length})`}
                                </button>
                            )}
                        </div>
                    </TimelineStep>

                    {/* 6. Decision */}
                    <TimelineStep
                        icon={ShieldCheck}
                        label="Decision"
                        value={`${insight.score}%`}
                        status={insight.type === "OBJECTION" ? "alert" : "ok"}
                        expanded={expandedSteps.includes("decision")}
                        onToggle={() => toggle("decision")}
                    >
                        <div className="space-y-2">
                            <div className={`p-2 rounded border ${insight.type === "OBJECTION" ? "bg-red-900/20 border-red-500/30" : "bg-emerald-900/20 border-emerald-500/30"}`}>
                                <div className="text-[9px] uppercase tracking-widest mb-0.5 opacity-70">{insight.type === "OBJECTION" ? "Objection Detected" : "Status"}</div>
                                <div className={`text-xs font-bold ${insight.type === "OBJECTION" ? "text-red-400" : "text-emerald-400"}`}>
                                    {insight.type === "OBJECTION" ? insight.recommendation : "No actionable objection detected."}
                                </div>
                                {insight.type !== "OBJECTION" && (
                                    <div className="text-[9px] text-slate-500 mt-0.5">Confidence low ({insight.score}%). Monitoring...</div>
                                )}
                            </div>

                            {insight.type === "OBJECTION" && (
                                <div>
                                    <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Script</div>
                                    <div className="text-xs font-serif italic text-white bg-white/5 p-2 rounded border-l-2 border-red-500">
                                        "{insight.script}"
                                    </div>
                                </div>
                            )}
                        </div>
                    </TimelineStep>

                </div>
            </div>
        );
    };

    return (
        <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#02040a] text-white font-sans bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">

            {/* Navbar */}
            <header className="h-14 shrink-0 flex justify-between items-center px-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full animate-pulse bg-${CASES[activeCase].color}-500`}></div>
                        <h1 className="text-lg font-bold tracking-widest uppercase text-slate-200 whitespace-nowrap truncate">
                            {CASES[activeCase].title} <span className={`text-${CASES[activeCase].color}-500`}>//</span> Co-Counsel AI
                        </h1>
                    </div>
                    {/* Case Selector */}
                    <div className="relative z-50">
                        <div className="relative">
                            <select
                                value={activeCase}
                                onChange={(e) => {
                                    setActiveCase(e.target.value as any);
                                    setStarted(false);
                                    setTranscriptLines([]);
                                    setHistory([]);
                                }}
                                className="appearance-none bg-slate-900 border border-slate-700 rounded pl-3 pr-8 py-1 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-500 transition-all cursor-pointer focus:outline-none focus:border-blue-500"
                            >
                                {Object.entries(CASES).map(([key, val]) => (
                                    <option key={key} value={key}>{val.title}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                        </div>
                    </div>
                </div>            </header>

            <main className="flex-1 overflow-hidden p-4">
                <div className="grid grid-cols-12 gap-4 h-full">

                    {/* LEFT: Live Transcript (4 cols) */}
                    <section className="col-span-4 h-full bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col relative overflow-hidden">
                        <div className="shrink-0 p-4 border-b border-white/5 flex items-center gap-2">
                            <Mic className="w-3 h-3 text-blue-400" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Court Feed</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth pb-20">
                            {transcriptLines.map((line, i) => (
                                <div key={i} className="animate-fade-in flex gap-3">
                                    <div className={`text-[10px] font-bold mt-0.5 w-6 shrink-0 text-right ${line.s.includes("THE COURT") ? "text-slate-500" : (line.s.includes("MR.") ? "text-blue-400" : "text-yellow-200")}`}>
                                        {line.s.includes("THE COURT") ? "CRT" : (line.s.includes("MR.") ? "Q." : "A.")}
                                    </div>
                                    <div>
                                        <div className={`text-[10px] font-bold mb-0.5 tracking-wider uppercase ${line.s.includes("THE COURT") ? "text-slate-500" : (line.s.includes("MR.") ? "text-blue-400" : "text-yellow-200")}`}>{line.s}</div>
                                        <div className="text-sm text-slate-200 leading-relaxed opacity-90">{line.t}</div>
                                    </div>
                                </div>
                            ))}
                            <div ref={transcriptEndRef} />
                        </div>

                        {/* Footer */}
                        <div className="shrink-0 p-3 border-t border-white/5 bg-black/20 text-center">
                            <span className="text-[9px] text-slate-600 uppercase tracking-widest">Powered by <span className="text-red-500 font-bold">Qdrant Cloud</span></span>
                        </div>

                        {/* Start Button Overlay */}
                        {!started && (
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 backdrop-blur-sm">
                                <button onClick={startTrial} className="group relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-transform active:scale-95">
                                    <span className="relative z-10 flex items-center gap-2"><Gavel className="w-5 h-5" /> COMMENCE TRIAL</span>
                                </button>
                            </div>
                        )}
                    </section>

                    {/* RIGHT: Comparison Lanes (8 cols) */}
                    <section className="col-span-8 h-full flex flex-col gap-3 overflow-hidden">

                        {/* Locked Input Header */}
                        <div className="shrink-0 bg-slate-900/80 border border-white/10 rounded-xl p-2 flex items-center gap-3">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest px-2 border-r border-white/10">Input (Locked)</span>
                            <span className="text-xs text-white italic truncate font-serif opacity-80 flex-1">"{qciState.trace.text}"</span>
                        </div>

                        {/* Lanes Grid */}
                        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
                            {/* QCI Lane */}
                            <div className="bg-slate-900/60 backdrop-blur-md border border-blue-500/20 rounded-2xl p-1 overflow-hidden">
                                <Lane title="QCI (In-Cluster)" state={qciState} hits={qciState.hits} insight={qciState.insight} isLocal={false} />
                            </div>

                            {/* Local Lane */}
                            <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-1 overflow-hidden">
                                <Lane title="Local (Client-Side)" state={localState} hits={localState.hits} insight={localState.insight} isLocal={true} />
                            </div>
                        </div>    {/* Winner Ribbon */}
                        <div className="shrink-0 h-10 bg-gradient-to-r from-blue-900/50 to-slate-900/50 border border-white/10 rounded-xl flex items-center justify-between px-4">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <Trophy className="w-4 h-4 text-yellow-400 shrink-0" />
                                <span className="text-xs font-bold text-white hidden sm:inline">QCI Advantage:</span>
                                <span className="text-xs font-mono text-green-400">Embed {(localState.timings.embed_dense - qciState.timings.embed_dense).toFixed(0)}ms faster</span>
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                Total Savings: <span className="text-white font-bold">{(localState.timings.total - qciState.timings.total).toFixed(0)}ms</span>
                            </div>
                        </div>

                    </section>
                </div>
            </main>
        </div>
    );
}
