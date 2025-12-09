'use client';
import { useState, useEffect, useRef } from 'react';
import {Mic, Gavel, ShieldCheck, ChevronDown, Activity, Database, Zap, Layers, GitMerge, Laptop, Trophy, CloudLightning, RotateCcw, HelpCircle, ChevronLeft, ChevronRight} from 'lucide-react';
import Link from 'next/link';

// Tour step definitions
const TOUR_STEPS = [
    {
        target: 'court-feed',
        title: 'Live Court Transcript',
        description: 'This panel displays the real-time courtroom transcript. Each line of testimony appears here as the trial progresses. Click any line to jump to that moment.',
        position: 'right'
    },
    {
        target: 'left-lane',
        title: 'Qdrant Cloud Inference',
        description: 'This lane shows the AI analysis pipeline using QCI. Embeddings are generated directly on the database cluster, eliminating network hops for faster response times.',
        position: 'left'
    },
    {
        target: 'right-lane',
        title: 'Comparison Lane',
        description: 'This lane runs the same analysis using a different embedding method (Jina Cloud or Local). Compare the timing metrics to see the performance difference.',
        position: 'left'
    },
    {
        target: 'performance-bar',
        title: 'Performance Comparison',
        description: 'See the real-time performance difference between the two approaches. The winner and time saved are displayed here after each analysis.',
        position: 'top'
    },
    {
        target: 'controls',
        title: 'Playback Controls',
        description: 'Control the trial playback here. Press Play to auto-advance through testimony, or use the arrows to step through manually. Press Space to play/pause.',
        position: 'top'
    }
];

const CASES = {
    msft: {
        title: "US v. Microsoft",
        color: "blue",
        script: [
            { s: "JUDGE JACKSON", t: "Mr. Boies, you may continue your cross-examination." },
            { s: "MR. BOIES (GOV)", t: "Mr. Gates, you claim Microsoft welcomes competition." },
            { s: "BILL GATES", t: "That is correct. We innovate for customers." },
            { s: "MR. BOIES (GOV)", t: "Did you ever have a strategy to eliminate competitors in the browser market?" },
            { s: "BILL GATES", t: "I... I don't recall using that specific language in any meeting." },
            { s: "MR. BOIES (GOV)", t: "Let me show you Exhibit 334. Do you recognize this email?" },
            { s: "BILL GATES", t: "I write thousands of emails. I cannot recall each one." },
            { s: "MR. BOIES (GOV)", t: "It says 'We need to cut off Netscape's air supply.' Did you write this?" },
            { s: "BILL GATES", t: "I would need to see the full context of that communication." },
            { s: "MR. BOIES (GOV)", t: "Did you refer to the June 1995 meeting with Netscape as a 'visit from the Godfather'?" },
            { s: "BILL GATES", t: "I did not attend that meeting personally." },
            { s: "MR. BOIES (GOV)", t: "But you were briefed on its purpose, were you not?" },
            { s: "BILL GATES", t: "I receive many briefings. That was years ago." },
            { s: "MR. BOIES (GOV)", t: "Did Microsoft offer to divide the browser market with Netscape?" },
            { s: "BILL GATES", t: "That would be illegal, so no." },
            { s: "MR. BOIES (GOV)", t: "Exhibit 347. Your VP of platforms wrote you must control the browser to control the platform. Agree?" },
            { s: "BILL GATES", t: "The browser is part of the operating system. Integration benefits users." },
            { s: "MR. BOIES (GOV)", t: "Why did Microsoft threaten to cancel Apple's Mac Office license?" },
            { s: "BILL GATES", t: "I am not aware of any such threat being made." },
            { s: "MR. BOIES (GOV)", t: "Let me show you Exhibit 358. An email to Steve Jobs dated August 1997." },
            { s: "BILL GATES", t: "We had many business discussions with Apple about licensing." },
            { s: "MR. BOIES (GOV)", t: "It says: 'Make IE default or we cancel Mac Office.' How do you explain this?" },
            { s: "BILL GATES", t: "I would characterize that as a negotiating position, not a threat." },
            { s: "MR. BOIES (GOV)", t: "Did Apple make Internet Explorer the default browser shortly after?" },
            { s: "BILL GATES", t: "Apple made its own business decisions." },
            { s: "JUDGE JACKSON", t: "Mr. Gates, please answer the question directly." },
            { s: "BILL GATES", t: "Yes, I believe they did change the default browser." },
            { s: "MR. BOIES (GOV)", t: "Did you instruct employees to make Windows incompatible with Java?" },
            { s: "BILL GATES", t: "We developed our own implementation of Java that worked better on Windows." },
            { s: "MR. BOIES (GOV)", t: "Sun Microsystems says you deliberately broke Java compatibility. True?" },
            { s: "BILL GATES", t: "Sun is a competitor. They have their own agenda." },
            { s: "MR. BOIES (GOV)", t: "No further questions at this time, Your Honor." },
            { s: "JUDGE JACKSON", t: "We'll take a fifteen minute recess." }
        ]
    },
    enron: {
        title: "US v. Skilling (Enron)",
        color: "emerald",
        script: [
            { s: "THE COURT", t: "Mr. Berkowitz, you may proceed with the cross-examination." },
            { s: "MR. BERKOWITZ", t: "Mr. Skilling, let's discuss Enron's accounting practices." },
            { s: "JEFF SKILLING", t: "Our accounting was aggressive but fully compliant with GAAP." },
            { s: "MR. BERKOWITZ", t: "Did you use mark-to-market accounting to book future profits immediately?" },
            { s: "JEFF SKILLING", t: "It is the industry standard for energy trading companies." },
            { s: "MR. BERKOWITZ", t: "You booked ten years of projected profits on the first day of a contract?" },
            { s: "JEFF SKILLING", t: "When you have a long-term contract, that is how mark-to-market works." },
            { s: "MR. BERKOWITZ", t: "And if those profits never materialized, what happened?" },
            { s: "JEFF SKILLING", t: "Adjustments would be made in subsequent quarters." },
            { s: "MR. BERKOWITZ", t: "Tell us about the Raptor vehicles. Were they designed to hide debt from shareholders?" },
            { s: "JEFF SKILLING", t: "They were legitimate hedging instruments approved by our auditors." },
            { s: "MR. BERKOWITZ", t: "Arthur Andersen approved them, and they were later convicted of obstruction." },
            { s: "MR. PETROCELLI (DEF)", t: "Objection. That conviction was overturned by the Supreme Court." },
            { s: "THE COURT", t: "Sustained. The jury will disregard the reference to Arthur Andersen's conviction." },
            { s: "MR. BERKOWITZ", t: "Mr. Skilling, the Raptors were capitalized entirely with Enron stock, correct?" },
            { s: "JEFF SKILLING", t: "That was one component of the structure." },
            { s: "MR. BERKOWITZ", t: "So when Enron stock fell, the hedges became worthless?" },
            { s: "JEFF SKILLING", t: "In hindsight, the structures had weaknesses." },
            { s: "MR. BERKOWITZ", t: "Did Enron traders manipulate the California energy market?" },
            { s: "JEFF SKILLING", t: "The market was flawed. We simply traded within its rules." },
            { s: "MR. BERKOWITZ", t: "Trading strategies called Death Star, Fat Boy, Get Shorty - those sound legitimate?" },
            { s: "JEFF SKILLING", t: "Traders give colorful names. I was not involved in day-to-day trading." },
            { s: "MR. BERKOWITZ", t: "Did you sell $60 million in Enron stock while telling employees to buy?" },
            { s: "JEFF SKILLING", t: "I sold stock for personal diversification, as is common for executives." },
            { s: "MR. BERKOWITZ", t: "In the months before bankruptcy, while the stock was collapsing?" },
            { s: "JEFF SKILLING", t: "I had no knowledge of any impending problems at that time." },
            { s: "MR. BERKOWITZ", t: "You resigned suddenly in August 2001. Why?" },
            { s: "JEFF SKILLING", t: "Personal reasons. Family matters required my attention." },
            { s: "MR. BERKOWITZ", t: "Three months before the largest bankruptcy in American history?" },
            { s: "JEFF SKILLING", t: "I could not have predicted what would happen." },
            { s: "MR. BERKOWITZ", t: "Mr. Fastow testified you knew about the hidden losses. Is he lying?" },
            { s: "JEFF SKILLING", t: "Andrew has every incentive to implicate others to reduce his sentence." },
            { s: "MR. BERKOWITZ", t: "He received ten years in prison. You call that an incentive?" },
            { s: "JEFF SKILLING", t: "It could have been much worse without his cooperation deal." },
            { s: "MR. BERKOWITZ", t: "No further questions." }
        ]
    },
    kitzmiller: {
        title: "Kitzmiller v. Dover",
        color: "purple",
        script: [
            { s: "THE COURT", t: "Mr. Rothschild, you may begin your cross-examination." },
            { s: "MR. ROTHSCHILD", t: "Dr. Behe, you testified that intelligent design is a scientific theory." },
            { s: "MICHAEL BEHE", t: "Yes, it makes claims that can be tested." },
            { s: "MR. ROTHSCHILD", t: "Has intelligent design been published in peer-reviewed scientific journals?" },
            { s: "MICHAEL BEHE", t: "The scientific establishment is hostile to new ideas." },
            { s: "MR. ROTHSCHILD", t: "Please answer the question. Has it been published in peer-reviewed journals?" },
            { s: "MICHAEL BEHE", t: "Not in the traditional sense, no." },
            { s: "MR. ROTHSCHILD", t: "You claim the bacterial flagellum is irreducibly complex." },
            { s: "MICHAEL BEHE", t: "Yes. All forty parts must be present for it to function." },
            { s: "MR. ROTHSCHILD", t: "Are you aware of the Type III secretion system?" },
            { s: "MICHAEL BEHE", t: "I am aware of it." },
            { s: "MR. ROTHSCHILD", t: "It uses ten proteins from the flagellum and has a different function." },
            { s: "MICHAEL BEHE", t: "That does not explain how the flagellum itself evolved." },
            { s: "MR. ROTHSCHILD", t: "Let's look at your book 'Darwin's Black Box.' You define science broadly." },
            { s: "MICHAEL BEHE", t: "Science should follow the evidence wherever it leads." },
            { s: "MR. ROTHSCHILD", t: "Under your definition, would astrology qualify as science?" },
            { s: "MICHAEL BEHE", t: "I think it would, yes." },
            { s: "MR. ROTHSCHILD", t: "Let's turn to 'Of Pandas and People.' Look at page 99." },
            { s: "MR. MUISE (DEF)", t: "Objection, Dr. Behe didn't write that book." },
            { s: "THE COURT", t: "He testified as an expert supporting its use. Overruled." },
            { s: "MR. ROTHSCHILD", t: "It says: 'Intelligent design means life began abruptly through an intelligent agency.'" },
            { s: "MICHAEL BEHE", t: "That is one formulation of the concept." },
            { s: "MR. ROTHSCHILD", t: "In earlier drafts, the word 'creationism' was used instead of 'intelligent design.'" },
            { s: "MICHAEL BEHE", t: "I was not involved in writing those drafts." },
            { s: "MR. ROTHSCHILD", t: "They even misspelled it as 'cdesign proponentsists' when doing find-and-replace." },
            { s: "THE COURT", t: "I note that for the record." },
            { s: "MR. ROTHSCHILD", t: "Dr. Behe, can intelligent design make any testable predictions?" },
            { s: "MICHAEL BEHE", t: "It predicts we will find complex systems that cannot be explained by Darwinism." },
            { s: "MR. ROTHSCHILD", t: "How would you test that? What experiment could disprove intelligent design?" },
            { s: "MICHAEL BEHE", t: "If we found a detailed, testable pathway for complex systems." },
            { s: "MR. ROTHSCHILD", t: "In ten years since your book, has no such pathway been found?" },
            { s: "MICHAEL BEHE", t: "None that I find convincing." },
            { s: "MR. ROTHSCHILD", t: "You've set the bar so high that nothing would convince you, haven't you?" },
            { s: "MICHAEL BEHE", t: "I'm simply asking for rigorous scientific evidence." },
            { s: "MR. ROTHSCHILD", t: "No further questions, Your Honor." },
            { s: "THE COURT", t: "Thank you. We'll adjourn until tomorrow morning at nine." }
        ]
    }
};

export default function Cockpit() {
    const [activeCase, setActiveCase] = useState<keyof typeof CASES>('msft');
    const [currentStep, setCurrentStep] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);

    // Check if running in production (Vercel sets this)
    const isProduction = process.env.NODE_ENV === 'production';

    // Mode selection for comparison (local not available in production)
    const [leftMode, setLeftMode] = useState<'local' | 'jina' | 'qdrant'>('qdrant');
    const [rightMode, setRightMode] = useState<'local' | 'jina' | 'qdrant'>('jina');
    const [hybridMode, setHybridMode] = useState(false);
    const [showHybridModal, setShowHybridModal] = useState(false);

    // Ensure modes are exclusive
    const handleLeftModeChange = (newMode: 'local' | 'jina' | 'qdrant') => {
        setLeftMode(newMode);
        if (newMode === rightMode) {
            // If selecting the same mode as right, switch right to a different mode
            const modes: ('local' | 'jina' | 'qdrant')[] = ['local', 'jina', 'qdrant'];
            const availableMode = modes.find(m => m !== newMode);
            if (availableMode) setRightMode(availableMode);
        }
    };

    const handleRightModeChange = (newMode: 'local' | 'jina' | 'qdrant') => {
        setRightMode(newMode);
        if (newMode === leftMode) {
            // If selecting the same mode as left, switch left to a different mode
            const modes: ('local' | 'jina' | 'qdrant')[] = ['local', 'jina', 'qdrant'];
            const availableMode = modes.find(m => m !== newMode);
            if (availableMode) setLeftMode(availableMode);
        }
    };

    const [transcriptLines, setTranscriptLines] = useState<any[]>([]);

    // Dual Lane State - Updated model to jina v3
    const [qciState, setQciState] = useState({
        trace: {
            trigger: { label: "Awaiting testimony...", action: "PROCEED" },
            decision: "WAITING...",
            text: "...",
            collection: "---",
            filters: "---",
            dense: { ms: 0, model: "jina v3", dim: 0 },
            sparse: { ms: 0, model: "---" },
            hybrid: { dense_k: 0, sparse_k: 0 },
            fusion: { method: "---", results: 0, top_k: "---" },
            latency_e2e: 0
        },
        insight: { type: "INFO", recommendation: "Stand by", score: 0, script: "---", glow: '' },
        hits: [] as any[],
        timings: { preprocess: 0, embed_dense: 0, embed_sparse: 0, search: 0, fusion: 0, total: 0 }
    });

    const [localState, setLocalState] = useState({
        trace: {
            trigger: { label: "Awaiting testimony...", action: "PROCEED" },
            decision: "WAITING...",
            text: "...",
            collection: "---",
            filters: "---",
            dense: { ms: 0, model: "jina v3", dim: 0 },
            sparse: { ms: 0, model: "---" },
            hybrid: { dense_k: 0, sparse_k: 0 },
            fusion: { method: "---", results: 0, top_k: "---" },
            latency_e2e: 0
        },
        insight: { type: "INFO", recommendation: "Stand by", score: 0, script: "---", glow: '' },
        hits: [] as any[],
        timings: { preprocess: 0, embed_dense: 0, embed_sparse: 0, search: 0, fusion: 0, total: 0 }
    });

    // History State
    const [history, setHistory] = useState<any[]>([]);

    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const historyEndRef = useRef<HTMLDivElement>(null);

    // Auto-Play Logic
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isPlaying && currentStep < CASES[activeCase].script.length - 1) {
            timer = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 4000);
        } else if (currentStep >= CASES[activeCase].script.length - 1) {
            setIsPlaying(false);
        }
        return () => clearTimeout(timer);
    }, [isPlaying, currentStep, activeCase]);

    // Step Change Effect (The "Engine")
    useEffect(() => {
        if (currentStep >= 0 && currentStep < CASES[activeCase].script.length) {
            const script = CASES[activeCase].script;
            const line = script[currentStep];

            // Update Transcript
            setTranscriptLines(script.slice(0, currentStep + 1));

            // Trigger Pipeline
            performSearch(line.t);
        }
    }, [currentStep, activeCase]);

    // Controls
    const togglePlay = () => setIsPlaying(!isPlaying);
    const nextStep = () => {
        if (currentStep < CASES[activeCase].script.length - 1) {
            setCurrentStep(prev => prev + 1);
            setIsPlaying(false); // Pause on manual interaction
        }
    };
    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            setIsPlaying(false);
        }
    };
    const resetTrial = () => {
        setIsPlaying(false);
        setCurrentStep(-1);
        setTranscriptLines([]);
        setHistory([]);

        // Reset both lanes completely
        const resetTrace = {
            trigger: { label: "Awaiting testimony...", action: "PROCEED" },
            decision: "WAITING...",
            text: "...",
            collection: "---",
            filters: "---",
            dense: { ms: 0, model: "jina v3", dim: 0 },
            sparse: { ms: 0, model: "---" },
            hybrid: { dense_k: 0, sparse_k: 0 },
            fusion: { method: "---", results: 0, top_k: "---" },
            latency_e2e: 0
        };
        const resetInsight = { type: "INFO", recommendation: "Stand by", score: 0, script: "---", glow: '' };
        const resetTimings = { preprocess: 0, embed_dense: 0, embed_sparse: 0, search: 0, fusion: 0, total: 0 };

        setQciState({ trace: resetTrace, insight: resetInsight, hits: [], timings: resetTimings });
        setLocalState({ trace: resetTrace, insight: resetInsight, hits: [], timings: resetTimings });
    };
    const replayStep = () => {
        if (currentStep >= 0) {
            const line = CASES[activeCase].script[currentStep];
            performSearch(line.t);
        }
    };

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [transcriptLines]);

    useEffect(() => {
        historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    const [showModal, setShowModal] = useState(false);
    const [tourStep, setTourStep] = useState<number | null>(null);
    const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

    // Check LocalStorage for Modal - also start tour for first-time visitors
    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisited');
        if (!hasVisited) {
            setShowModal(true);
            localStorage.setItem('hasVisited', 'true');
        }
    }, []);

    // Update highlight rect when tour step changes or window resizes
    useEffect(() => {
        const updateRect = () => {
            if (tourStep !== null && tourStep < TOUR_STEPS.length) {
                const target = document.querySelector(`[data-tour="${TOUR_STEPS[tourStep].target}"]`);
                if (target) {
                    setHighlightRect(target.getBoundingClientRect());
                }
            } else {
                setHighlightRect(null);
            }
        };

        updateRect();

        // Update on resize
        window.addEventListener('resize', updateRect);
        return () => window.removeEventListener('resize', updateRect);
    }, [tourStep]);

    // Start tour after modal closes (for first-time visitors)
    const startTour = () => {
        setShowModal(false);
        setTourStep(0);
    };

    const nextTourStep = () => {
        if (tourStep !== null && tourStep < TOUR_STEPS.length - 1) {
            setTourStep(tourStep + 1);
        } else {
            setTourStep(null);
        }
    };

    const prevTourStep = () => {
        if (tourStep !== null && tourStep > 0) {
            setTourStep(tourStep - 1);
        }
    };

    const skipTour = () => {
        setTourStep(null);
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input (though we don't have many)
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'KeyN':
                    e.preventDefault();
                    nextStep();
                    break;
                case 'KeyR':
                    e.preventDefault();
                    replayStep();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, currentStep, activeCase]);

    const performSearch = async (query: string) => {
        // 1. SET SCANNING STATE
        setQciState(prev => ({ ...prev, trace: { ...prev.trace, decision: "ANALYZING...", text: query } }));
        setLocalState(prev => ({ ...prev, trace: { ...prev.trace, decision: "ANALYZING...", text: query } }));

        try {
            // 2. CONCURRENT REQUESTS
            const [leftRes, rightRes] = await Promise.all([
                fetch(`/api/cockpit?mode=${leftMode}&hybrid=${hybridMode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: query, caseId: activeCase }) }),
                fetch(`/api/cockpit?mode=${rightMode}&hybrid=${hybridMode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: query, caseId: activeCase }) })
            ]);

            const qciData = await leftRes.json();
            const localData = await rightRes.json();

            // 3. UPDATE STATES
            const updateLane = (data: any, setState: any) => {
                const isActionable = data.trace.decision === "ACTIONABLE";
                setState((_prev: any) => ({
                    trace: {
                        ...data.trace,
                        text: query,
                        dense: { ...data.trace.dense, model: "jina v3" }
                    },
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
                    className={`flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-white/5 transition-colors ${expanded ? 'bg-white/5' : ''}`}
                >
                    <div className="flex items-center gap-2">
                        <Icon className={`w-3 h-3 ${statusColors[status as keyof typeof statusColors] || statusColors.default}`} />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {subValue && <span className="text-[11px] text-slate-500 hidden sm:inline">{subValue}</span>}
                        <span className={`text-xs font-mono ${value === "---" ? "text-slate-600" : "text-slate-200 animate-fade-in"}`}>{value}</span>
                        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </div>
                </div>
                {expanded && (
                    <div className="px-2 py-1.5 border-t border-white/5 bg-black/20 animate-fade-in">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    // Lane Component
    const Lane = ({ title, state, hits, insight, mode, opponentState }: any) => {
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
        const isQci = mode === 'qdrant';
        const isJina = mode === 'jina';

        const modeLabels = {
            qdrant: { name: 'QCI', icon: CloudLightning, color: 'blue' },
            jina: { name: 'Jina Cloud', icon: CloudLightning, color: 'purple' },
            local: { name: 'Local', icon: Laptop, color: 'slate' }
        };
        const modeInfo = modeLabels[mode as keyof typeof modeLabels] || modeLabels.local;

        // Trigger Logic
        const trigger = state.trace.trigger || { label: "Processing...", action: "PROCEED" };
        const isIgnored = trigger.action === "IGNORE";

        return (
            <div className={`flex flex-col h-full gap-2 overflow-hidden ${isIgnored ? 'opacity-50 grayscale' : ''} transition-all duration-500`}>
                {/* Sticky Header */}
                <div className={`shrink-0 px-2 py-1 rounded-xl border flex justify-between items-center ${
                    isQci ? 'bg-blue-900/20 border-blue-500/30' :
                    (isJina ? 'bg-purple-900/20 border-purple-500/30' : 'bg-slate-800/40 border-slate-700/50')
                }`}>
                    <div className="flex items-center gap-2">
                        <modeInfo.icon className={`w-5 h-5 ${
                            isQci ? 'text-blue-400' :
                            (isJina ? 'text-purple-400' : 'text-slate-400')
                        }`} />
                        <span className={`text-xs font-bold uppercase tracking-widest ${
                            isQci ? 'text-blue-300' :
                            (isJina ? 'text-purple-300' : 'text-slate-300')
                        }`}>{title}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <span className="text-[11px] text-slate-500 uppercase tracking-wider">Embed</span>
                                <span className={`text-xs font-mono font-bold ${state.timings.embed_dense > 0 ? (isQci ? 'text-green-400' : 'text-slate-300') : 'text-slate-600'}`}>
                                    {state.timings.embed_dense > 0 ? `${state.timings.embed_dense}ms` : "---"}
                                </span>
                            </div>
                            <div className="w-px h-6 bg-white/10"></div>
                            <div className="flex flex-col items-end">
                                <span className="text-[11px] text-slate-500 uppercase tracking-wider">Total E2E</span>
                                <span className={`text-lg font-mono font-bold ${state.timings.total > 0 ? (state.timings.total < 100 ? 'text-green-400' : 'text-white') : 'text-slate-600'}`}>
                                    {state.timings.total > 0 ? `${state.timings.total}ms` : "---"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 scroll-thin pb-32">

                    {/* 1. Trigger & Gate */}
                    <TimelineStep
                        icon={Activity}
                        label="Trigger"
                        value={trigger.label}
                        status={isIgnored ? "default" : "ok"}
                        expanded={expandedSteps.includes("trigger")}
                        onToggle={() => toggle("trigger")}
                    >
                        {!isIgnored && (
                            <div className="p-1 bg-slate-800/50 rounded border border-white/5">
                                <div className="text-[11px] text-slate-500 uppercase mb-0.5">Route Plan</div>
                                <div className="text-xs font-mono text-blue-300">
                                    {state.trace.route ? (
                                        <>{state.trace.route.plan} <span className="text-slate-500">({state.trace.route.details})</span></>
                                    ) : (
                                        <span className="text-slate-600">rules + case_memory <span className="text-slate-700">(phase=cross)</span></span>
                                    )}
                                </div>
                            </div>
                        )}
                    </TimelineStep>

                    {/* 2. Query Built */}
                    {!isIgnored && (
                        <TimelineStep
                            icon={Zap}
                            label="Query Built"
                            value={state.timings.preprocess > 0 ? `${state.timings.preprocess}ms` : "---"}
                            status="default"
                            expanded={expandedSteps.includes("query")}
                            onToggle={() => toggle("query")}
                        >
                            <div className="space-y-0.5">
                                <div className="text-[11px] text-slate-500 uppercase">Query Used</div>
                                <div className={`text-xs font-mono truncate ${state.trace.query ? 'text-white' : 'text-slate-600'}`}>
                                    {state.trace.query?.text || '...'}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-0.5">
                                    {state.trace.query ? (
                                        state.trace.query.filters.split(',').map((f: string, i: number) => (
                                            <span key={i} className="text-[8px] bg-blue-900/30 text-blue-300 px-1 rounded border border-blue-500/20">{f.trim()}</span>
                                        ))
                                    ) : (
                                        <>
                                            <span className="text-[8px] bg-slate-800/30 text-slate-600 px-1 rounded border border-slate-700/20">case_id=msft</span>
                                            <span className="text-[8px] bg-slate-800/30 text-slate-600 px-1 rounded border border-slate-700/20">phase=cross</span>
                                            <span className="text-[8px] bg-slate-800/30 text-slate-600 px-1 rounded border border-slate-700/20">speaker_role=witness</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </TimelineStep>
                    )}

                    {/* 3. Embed */}
                    {!isIgnored && (
                        <TimelineStep
                            icon={modeInfo.icon}
                            label={isQci ? "Embed (In-Cluster)" : (isJina ? "Embed (Jina API)" : "Embed (Client)")}
                            value={state.timings.embed_dense > 0 ? `${state.timings.embed_dense + state.timings.embed_sparse}ms` : "---"}
                            status={isQci ? "fast" : (isJina ? "ok" : "slow")}
                            expanded={expandedSteps.includes("embed")}
                            onToggle={() => toggle("embed")}
                        >
                            <div className="space-y-0.5 text-xs font-mono">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Dense ({state.trace.dense.model})</span>
                                    <span className={state.timings.embed_dense > 0 ? "text-slate-300" : "text-slate-600"}>
                                        {state.timings.embed_dense > 0 ? `${state.timings.embed_dense}ms` : "---"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Sparse ({state.trace.sparse.model})</span>
                                    <span className={state.timings.embed_sparse > 0 ? "text-slate-300" : "text-slate-600"}>
                                        {state.timings.embed_sparse > 0 ? `${state.timings.embed_sparse}ms` : "---"}
                                    </span>
                                </div>
                                {opponentState && state.timings.embed_dense > 0 && opponentState.timings.embed_dense > 0 && (
                                    <div className={`mt-0.5 pt-0.5 border-t border-white/5 flex justify-between ${
                                        (state.timings.embed_dense + state.timings.embed_sparse) < (opponentState.timings.embed_dense + opponentState.timings.embed_sparse)
                                        ? 'text-green-400'
                                        : 'text-red-400'
                                    }`}>
                                        <span>ΔEmbed</span>
                                        <span>
                                            {(state.timings.embed_dense + state.timings.embed_sparse) < (opponentState.timings.embed_dense + opponentState.timings.embed_sparse)
                                                ? `-${Math.abs((state.timings.embed_dense + state.timings.embed_sparse) - (opponentState.timings.embed_dense + opponentState.timings.embed_sparse))}ms`
                                                : `+${Math.abs((state.timings.embed_dense + state.timings.embed_sparse) - (opponentState.timings.embed_dense + opponentState.timings.embed_sparse))}ms`
                                            }
                                        </span>
                                    </div>
                                )}
                            </div>
                        </TimelineStep>
                    )}

                    {/* 4. Search */}
                    {!isIgnored && (
                        <TimelineStep
                            icon={Database}
                            label="Search (Qdrant)"
                            value={state.timings.search > 0 ? `${state.timings.search}ms` : "---"}
                            status="default"
                            expanded={expandedSteps.includes("search")}
                            onToggle={() => toggle("search")}
                        >
                            <div className="flex justify-between p-1 bg-slate-800/30 rounded border border-white/5">
                                <span className="text-xs font-mono text-slate-300">
                                    dense k={state.trace.search?.dense_k || 10}{state.trace.search?.sparse_k ? ` • sparse k=${state.trace.search.sparse_k}` : ''} • retrieved {state.trace.search?.retrieved || 10}
                                </span>
                            </div>
                        </TimelineStep>
                    )}

                    {/* 5. Fusion (Evidence) */}
                    {!isIgnored && (
                        <TimelineStep
                            icon={GitMerge}
                            label={`Results (${state.trace.fusion.method || 'Semantic'})`}
                            value={state.timings.fusion > 0 ? `${state.timings.fusion}ms` : "---"}
                            status="default"
                            subValue={`Top ${state.trace.fusion.top_k}`}
                            expanded={expandedSteps.includes("fusion")}
                            onToggle={() => toggle("fusion")}
                        >
                            <div className="space-y-1">
                                <div className="space-y-1">
                                    {hits.length > 0 ? (
                                        (showAllEvidence ? hits : hits.slice(0, 3)).map((hit: any, i: number) => (
                                            <div key={i} className="bg-black/40 p-1 rounded border border-white/5 hover:border-blue-500/30 transition-colors group">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                        <span className={`text-[8px] px-1 rounded uppercase shrink-0 ${hit.payload?.doc_type === 'RULE' ? 'bg-purple-900/50 text-purple-300' : (hit.payload?.doc_type === 'EVIDENCE' ? 'bg-amber-900/50 text-amber-300' : 'bg-slate-800/50 text-slate-300')}`}>
                                                            {hit.payload?.doc_type || "TRANSCRIPT"}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-blue-300 truncate flex-1">{hit.title}</span>
                                                    </div>
                                                    <span className="text-[11px] text-green-400 font-mono ml-1.5">#{hit.fused_rank}</span>
                                                </div>
                                                <div className="text-[11px] text-slate-400 line-clamp-2 font-serif" dangerouslySetInnerHTML={{ __html: hit.snippet }}></div>
                                            </div>
                                        ))
                                    ) : (
                                        /* Placeholder evidence cards */
                                        [1, 2].map((i) => (
                                            <div key={i} className="bg-black/40 p-1 rounded border border-white/5 opacity-40">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                        <span className="text-[8px] px-1 rounded uppercase shrink-0 bg-slate-800/50 text-slate-500">
                                                            {i === 1 ? 'TRANSCRIPT' : 'RULE'}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-slate-500 truncate flex-1">
                                                            {i === 1 ? 'Transcript Search' : 'Relevant Precedent'}
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] text-slate-600 font-mono ml-1.5">#{i}</span>
                                                </div>
                                                <div className="text-[11px] text-slate-600 line-clamp-2 font-serif">
                                                    {i === 1 ? 'Searching for context on: "..."' : 'No immediate conflicts found.'}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {hits.length > 3 && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowAllEvidence(!showAllEvidence); }}
                                        className="w-full py-0.5 text-[11px] text-slate-500 hover:text-slate-300 uppercase tracking-widest border border-white/5 rounded hover:bg-white/5 transition-colors"
                                    >
                                        {showAllEvidence ? "Show Less" : `View All (${hits.length})`}
                                    </button>
                                )}
                            </div>
                        </TimelineStep>
                    )}

                    {/* 6. Decision */}
                    {!isIgnored && (
                        <TimelineStep
                            icon={ShieldCheck}
                            label="Decision"
                            value={
                                state.trace.decision === "ACTIONABLE" ? `${insight.score}%` :
                                    (state.trace.decision === "NO_ACTION" ? "Clean" : "---")
                            }
                            status={
                                state.trace.decision === "ACTIONABLE" ? "alert" :
                                    (state.trace.decision === "NO_ACTION" ? "ok" : "default")
                            }
                            expanded={expandedSteps.includes("decision")}
                            onToggle={() => toggle("decision")}
                        >
                            <div className="space-y-1.5">
                                <div className={`p-1.5 rounded border ${state.trace.decision === "ACTIONABLE" ? "bg-red-900/20 border-red-500/30" :
                                    (state.trace.decision === "NO_ACTION" ? "bg-emerald-900/20 border-emerald-500/30" : "bg-slate-800/30 border-white/5")
                                    }`}>
                                    <div className="text-[11px] uppercase tracking-widest mb-0.5 opacity-70">
                                        {state.trace.decision === "ACTIONABLE" ? "Action" : "Status"}
                                    </div>
                                    <div className={`text-xs font-bold whitespace-normal break-words ${state.trace.decision === "ACTIONABLE" ? "text-red-400" :
                                        (state.trace.decision === "NO_ACTION" ? "text-emerald-400" : "text-slate-500")
                                        }`}>
                                        {state.trace.decision === "ACTIONABLE" ? insight.recommendation :
                                            (state.trace.decision === "NO_ACTION" ? "No objection detected." : "---")}
                                    </div>
                                </div>

                                {insight.type === "OBJECTION" && (
                                    <>
                                        <div>
                                            <div className="text-[11px] text-slate-500 uppercase tracking-widest mb-0.5">Script</div>
                                            <div className="text-xs font-serif italic text-white bg-white/5 p-1.5 rounded border-l-2 border-red-500 whitespace-normal break-words">
                                                "{insight.script}"
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[11px] text-slate-500 uppercase tracking-widest mb-0.5">Based On</div>
                                            <div className="flex gap-1.5">
                                                {hits.slice(0, 2).map((hit: any, i: number) => (
                                                    <span key={i} className="text-[11px] text-blue-400 bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-500/30">
                                                        #{hit.fused_rank} {hit.payload?.doc_type}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </TimelineStep>
                    )}

                </div>
            </div>
        );
    };





    return (
        <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#02040a] text-white font-sans bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">

            {/* Navbar */}
            {/* Navbar */}
            <header className="h-16 shrink-0 flex justify-between items-center px-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-sm relative z-50">

                {/* LEFT: Brand & Case */}
                <div className="flex items-center gap-4 shrink-0">
                    <div className={`w-1.5 h-8 rounded-full bg-${CASES[activeCase].color}-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]`}></div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold tracking-tight text-white leading-none">
                            {CASES[activeCase].title}
                        </h1>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mt-1">
                            Co-Counsel AI
                        </span>
                    </div>
                </div>

                {/* CENTER: Controls & Mode */}
                <div className="flex items-center justify-center gap-3 flex-1 min-w-0">

                    {/* Case Selector */}
                    <div className="flex items-center bg-slate-800/50 rounded-lg border border-white/5 p-1 pr-3 gap-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-2">Case</span>
                        <div className="relative">
                            <select
                                value={activeCase}
                                onChange={(e) => {
                                    setActiveCase(e.target.value as any);
                                    setCurrentStep(-1);
                                    setIsPlaying(false);
                                }}
                                className="appearance-none bg-transparent text-xs font-bold text-slate-200 hover:text-white transition-colors cursor-pointer focus:outline-none pr-4 py-1"
                            >
                                {Object.entries(CASES).map(([key, val]) => (
                                    <option key={key} value={key}>{val.title}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                        </div>
                    </div>

                    {/* Hybrid Mode Toggle */}
                    <div className="flex items-center bg-slate-800/50 rounded-lg border border-white/10 px-3 py-1.5 gap-2">
                        <input
                            type="checkbox"
                            checked={hybridMode}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setShowHybridModal(true);
                                }
                                setHybridMode(e.target.checked);
                            }}
                            className="w-3 h-3 rounded border-slate-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer whitespace-nowrap" onClick={() => setHybridMode(!hybridMode)}>
                            Try Hybrid Search
                        </span>
                    </div>

                    {/* Mode Selectors */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-blue-900/20 rounded-lg border border-blue-500/30 p-1 pr-3 gap-2">
                            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider pl-2">Left</span>
                            <select
                                value={leftMode}
                                onChange={(e) => handleLeftModeChange(e.target.value as any)}
                                className="appearance-none bg-transparent text-xs font-bold text-blue-300 hover:text-white transition-colors cursor-pointer focus:outline-none pr-4 py-1"
                            >
                                <option value="qdrant">QCI</option>
                                <option value="jina">Jina Cloud</option>
                                {!isProduction && <option value="local">Local</option>}
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                        </div>
                        <span className="text-slate-600 text-xs">vs</span>
                        <div className="flex items-center bg-slate-800/50 rounded-lg border border-white/10 p-1 pr-3 gap-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-2">Right</span>
                            <select
                                value={rightMode}
                                onChange={(e) => handleRightModeChange(e.target.value as any)}
                                className="appearance-none bg-transparent text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer focus:outline-none pr-4 py-1"
                            >
                                <option value="qdrant">QCI</option>
                                <option value="jina">Jina Cloud</option>
                                {!isProduction && <option value="local">Local</option>}
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                        </div>
                    </div>

                </div>

                {/* RIGHT: Actions & Badge */}
                <div className="flex items-center justify-end gap-3 shrink-0">

                    {/* Why QCI Link */}
                    <Link
                        href="/compare"
                        className="group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
                    >
                        <span>Why QCI?</span>
                        <span className="text-xs text-amber-400/60 group-hover:text-amber-300/80 transition-colors">Learn more →</span>
                    </Link>

                    {/* How it works button */}
                    <button
                        onClick={() => setTourStep(0)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs font-medium"
                    >
                        <HelpCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">How it works</span>
                    </button>

                    {/* Primary CTA */}
                    <button
                        onClick={togglePlay}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${isPlaying
                            ? 'bg-slate-800 text-red-400 border border-red-500/30 hover:bg-slate-700'
                            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]'
                            }`}
                    >
                        {isPlaying ? (
                            <>
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                Auto: ON
                            </>
                        ) : (
                            <>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                Run Auto
                            </>
                        )}
                    </button>

                </div>
            </header>

            <main className="flex-1 overflow-hidden pt-4 px-4 pb-4">
                <div className="grid grid-cols-12 gap-4 h-full">

                    {/* LEFT: Live Transcript (4 cols) */}
                    <section data-tour="court-feed" className="col-span-4 h-full bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col relative overflow-hidden">
                        <div className="shrink-0 p-4 border-b border-white/5 flex items-center gap-2">
                            <Mic className="w-3 h-3 text-blue-400" />
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Court Feed</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth pb-20">
                            {transcriptLines.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                                    <Gavel className="w-12 h-12 opacity-20" />
                                    <div className="text-xs uppercase tracking-widest">Ready to Commence</div>
                                </div>
                            )}
                            {transcriptLines.map((line, i) => {
                                const isActive = i === currentStep;
                                return (
                                    <div
                                        key={i}
                                        onClick={() => {
                                            setCurrentStep(i);
                                            setIsPlaying(false);
                                        }}
                                        className={`animate-fade-in flex gap-3 p-2 rounded-lg transition-colors cursor-pointer hover:bg-white/5 ${isActive ? 'bg-blue-900/20 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border border-transparent'}`}
                                    >
                                        <div className={`text-xs font-bold mt-0.5 w-6 shrink-0 text-right ${line.s.includes("THE COURT") ? "text-slate-500" : (line.s.includes("MR.") ? "text-blue-400" : "text-yellow-200")}`}>
                                            {line.s.includes("THE COURT") ? "CRT" : (line.s.includes("MR.") ? "Q." : "A.")}
                                        </div>
                                        <div>
                                            <div className={`text-xs font-bold mb-0.5 tracking-wider uppercase ${line.s.includes("THE COURT") ? "text-slate-500" : (line.s.includes("MR.") ? "text-blue-400" : "text-yellow-200")}`}>{line.s}</div>
                                            <div className={`text-sm leading-relaxed ${isActive ? 'text-white font-medium' : 'text-slate-300 opacity-80'}`}>{line.t}</div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={transcriptEndRef} />
                        </div>

                        {/* Controls Footer */}
                        <div data-tour="controls" className="shrink-0 p-4 border-t border-white/5 bg-black/40 backdrop-blur-md">
                            {/* Progress Bar */}
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-[11px] font-mono text-slate-500 w-8 text-right">{(currentStep + 1).toString().padStart(2, '0')}</span>
                                <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-300 ease-out"
                                        style={{ width: `${((currentStep + 1) / CASES[activeCase].script.length) * 100}%` }}
                                    />
                                </div>
                                <span className="text-[11px] font-mono text-slate-500 w-8">{CASES[activeCase].script.length.toString().padStart(2, '0')}</span>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={resetTrial}
                                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                    title="Reset"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={prevStep}
                                        disabled={currentStep <= 0}
                                        className="p-2 rounded-full hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={togglePlay}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-slate-800 text-red-400 border border-red-500/30' : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 shadow-lg shadow-blue-500/20'}`}
                                    >
                                        {isPlaying ? (
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        )}
                                    </button>

                                    <button
                                        onClick={nextStep}
                                        disabled={currentStep >= CASES[activeCase].script.length - 1}
                                        className="p-2 rounded-full hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                                        </svg>
                                    </button>
                                </div>

                                <button
                                    onClick={replayStep}
                                    disabled={currentStep < 0}
                                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Replay Last Turn"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* RIGHT: Comparison Lanes (8 cols) */}
                    <section className="col-span-8 h-full flex flex-col gap-3 overflow-hidden">



                        {/* Lanes Grid */}
                        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
                            {/* Left Lane */}
                            <div data-tour="left-lane" className={`bg-slate-900/60 backdrop-blur-md border rounded-2xl p-1 overflow-hidden ${leftMode === 'qdrant' ? 'border-blue-500/20' : (leftMode === 'jina' ? 'border-purple-500/20' : 'border-white/10')}`}>
                                <Lane title={leftMode === 'qdrant' ? "QDRANT CLOUD INFERENCE" : (leftMode === 'jina' ? "JINA CLOUD API" : "LOCAL CLIENT EMBEDDING")} state={qciState} hits={qciState.hits} insight={qciState.insight} mode={leftMode} opponentState={localState} />
                            </div>

                            {/* Right Lane */}
                            <div data-tour="right-lane" className={`bg-slate-900/60 backdrop-blur-md border rounded-2xl p-1 overflow-hidden ${rightMode === 'qdrant' ? 'border-blue-500/20' : (rightMode === 'jina' ? 'border-purple-500/20' : 'border-white/10')}`}>
                                <Lane title={rightMode === 'qdrant' ? "QDRANT CLOUD INFERENCE" : (rightMode === 'jina' ? "JINA CLOUD API" : "LOCAL CLIENT EMBEDDING")} state={localState} hits={localState.hits} insight={localState.insight} mode={rightMode} opponentState={qciState} />
                            </div>
                        </div>

                        {/* Winner Ribbon */}
                        <div data-tour="performance-bar" className="shrink-0 h-12 bg-gradient-to-r from-blue-900/50 to-slate-900/50 border border-white/10 rounded-xl flex items-center justify-start gap-6 px-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>

                            {/* Left: Title */}
                            <div className="relative flex items-center gap-3 shrink-0">
                                <Trophy className="w-4 h-4 text-yellow-400" />
                                <span className="text-xs font-bold text-white uppercase tracking-widest truncate max-w-[320px]">
                                    {qciState.timings.total > 0 && localState.timings.total > 0
                                        ? (qciState.timings.total < localState.timings.total
                                            ? `${leftMode === 'qdrant' ? 'QCI' : (leftMode === 'jina' ? 'Jina' : 'Local')} Wins`
                                            : `${rightMode === 'qdrant' ? 'QCI' : (rightMode === 'jina' ? 'Jina' : 'Local')} Wins`)
                                        : 'Performance Comparison'
                                    }
                                </span>
                            </div>

                            {/* Middle: Metrics */}
                            <div className="relative flex items-center gap-3">
                                {/* Chip 1: Total Savings */}
                                <div className="flex items-baseline gap-2 bg-slate-800/80 border border-green-500/30 rounded-lg px-3 py-1.5 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Total Saved</span>
                                    <span className="text-sm font-mono font-bold text-green-400">
                                        {(localState.timings.total > 0 && qciState.timings.total > 0)
                                            ? `${Math.abs(localState.timings.total - qciState.timings.total).toFixed(0)}ms`
                                            : "---"}
                                    </span>
                                </div>

                                {/* Chip 2: Embedding Savings */}
                                <div className="flex items-baseline gap-2 bg-slate-800/80 border border-blue-500/30 rounded-lg px-3 py-1.5 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Embed Saved</span>
                                    <span className="text-sm font-mono font-bold text-blue-400">
                                        {(localState.timings.embed_dense > 0 && qciState.timings.embed_dense > 0)
                                            ? `${Math.abs((localState.timings.embed_dense + localState.timings.embed_sparse) - (qciState.timings.embed_dense + qciState.timings.embed_sparse)).toFixed(0)}ms`
                                            : "---"}
                                    </span>
                                </div>
                            </div>

                            {/* Right: Qualifier */}
                            <div className="ml-auto text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                                {leftMode === 'qdrant' ? 'QCI' : (leftMode === 'jina' ? 'Jina' : 'Local')} vs {rightMode === 'qdrant' ? 'QCI' : (rightMode === 'jina' ? 'Jina' : 'Local')}
                            </div>
                        </div>

                    </section>
                </div>
            </main>

            {/* Hybrid Search Info Modal */}
            {showHybridModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <Layers className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Hybrid Search Mode</h2>
                            </div>

                            <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6 mb-6">
                                <p className="text-slate-300 leading-relaxed mb-4">
                                    <strong className="text-white">Note:</strong> BM25 sparse vectors are computed the same way across all modes for consistency.
                                </p>
                                <p className="text-slate-300 leading-relaxed">
                                    Qdrant Cloud Inference supports hybrid search natively, but to keep comparisons with Jina Cloud fair,
                                    we only vary <strong className="text-purple-300">where dense embeddings are generated</strong> (QCI vs client).
                                    Retrieval behavior remains the same across all modes.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowHybridModal(false)}
                                    className="flex-1 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-widest transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 hover:scale-[1.02]"
                                >
                                    Got it
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Welcome Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col md:flex-row">

                        {/* Left: The Context */}
                        <div className="p-8 md:w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                        <Gavel className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">AI Co-Counsel</h2>
                                </div>
                                <p className="text-slate-400 leading-relaxed mb-6">
                                    You are observing a real-time legal assistant analyzing a courtroom transcript.
                                    To be effective, it must <strong>listen, research, and advise</strong> in the blink of an eye.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></div>
                                        <span className="text-sm text-slate-300"><strong className="text-white">The Challenge:</strong> Traditional RAG pipelines are too slow. Moving data between the database and the embedding model creates network latency.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0"></div>
                                        <span className="text-sm text-slate-300"><strong className="text-white">The Goal:</strong> Provide instant, grounded objections the moment the witness finishes speaking.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Right: The Solution */}
                        <div className="p-8 md:w-1/2 bg-slate-900 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <CloudLightning className="w-6 h-6 text-blue-400" />
                                    <h3 className="text-xl font-bold text-white">Powered by Qdrant Cloud Inference</h3>
                                </div>

                                <p className="text-slate-400 leading-relaxed mb-8">
                                    We are comparing two architectures side-by-side:
                                </p>

                                <div className="space-y-4 mb-8">
                                    <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 flex items-center gap-4">
                                        <Laptop className="w-5 h-5 text-slate-500" />
                                        <div>
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Client-Side (Standard)</div>
                                            <div className="text-sm text-slate-300">Embeddings run on the application server.</div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-blue-900/10 border border-blue-500/30 flex items-center gap-4 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
                                        <CloudLightning className="w-5 h-5 text-blue-400 relative z-10" />
                                        <div className="relative z-10">
                                            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Qdrant Cloud Inference</div>
                                            <div className="text-sm text-white">Embeddings run <strong>on the database cluster</strong>. Zero network hops.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold uppercase tracking-widest transition-all"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={startTour}
                                    className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:scale-[1.02]"
                                >
                                    Take a Tour
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Tour Overlay */}
            {tourStep !== null && highlightRect && (
                <div className="fixed inset-0 z-[200] pointer-events-none">
                    {/* Dimmed background with cutout */}
                    <div className="absolute inset-0 pointer-events-auto">
                        <svg className="w-full h-full">
                            <defs>
                                <mask id="tour-mask">
                                    <rect x="0" y="0" width="100%" height="100%" fill="white" />
                                    <rect
                                        x={highlightRect.left - 8}
                                        y={highlightRect.top - 8}
                                        width={highlightRect.width + 16}
                                        height={highlightRect.height + 16}
                                        rx="16"
                                        fill="black"
                                    />
                                </mask>
                            </defs>
                            <rect
                                x="0"
                                y="0"
                                width="100%"
                                height="100%"
                                fill="rgba(0,0,0,0.85)"
                                mask="url(#tour-mask)"
                            />
                        </svg>
                    </div>

                    {/* Highlight border */}
                    <div
                        className="absolute border-2 border-blue-500 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300"
                        style={{
                            left: highlightRect.left - 8,
                            top: highlightRect.top - 8,
                            width: highlightRect.width + 16,
                            height: highlightRect.height + 16,
                        }}
                    />

                    {/* Tooltip */}
                    <div
                        className="absolute pointer-events-auto animate-fade-in"
                        style={{
                            left: (() => {
                                const pos = TOUR_STEPS[tourStep].position;
                                const tooltipWidth = 320;
                                const padding = 16;

                                if (pos === 'right') {
                                    // Check if it fits on right, otherwise put on left
                                    const rightPos = highlightRect.right + 24;
                                    if (rightPos + tooltipWidth > window.innerWidth - padding) {
                                        return Math.max(padding, highlightRect.left - tooltipWidth - 24);
                                    }
                                    return rightPos;
                                } else if (pos === 'left') {
                                    // Check if it fits on left, otherwise put on right
                                    const leftPos = highlightRect.left - tooltipWidth - 24;
                                    if (leftPos < padding) {
                                        return highlightRect.right + 24;
                                    }
                                    return leftPos;
                                } else {
                                    // Center horizontally, but keep within bounds
                                    const centerPos = highlightRect.left + (highlightRect.width / 2) - (tooltipWidth / 2);
                                    return Math.max(padding, Math.min(centerPos, window.innerWidth - tooltipWidth - padding));
                                }
                            })(),
                            top: (() => {
                                const pos = TOUR_STEPS[tourStep].position;
                                const tooltipHeight = 220;
                                const padding = 16;

                                if (pos === 'top') {
                                    // Place above, but check if it fits
                                    const topPos = highlightRect.top - tooltipHeight - 16;
                                    if (topPos < padding) {
                                        return highlightRect.bottom + 16;
                                    }
                                    return topPos;
                                } else {
                                    // Align with top of element, but keep within bounds
                                    const alignedTop = highlightRect.top;
                                    return Math.max(padding, Math.min(alignedTop, window.innerHeight - tooltipHeight - padding));
                                }
                            })(),
                            width: 320,
                        }}
                    >
                        <div className="bg-slate-900 border border-blue-500/30 rounded-xl shadow-2xl overflow-hidden">
                            <div className="p-4">
                                {/* Step indicator */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {TOUR_STEPS.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-2 h-2 rounded-full transition-colors ${i === tourStep ? 'bg-blue-500' : 'bg-slate-700'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-slate-500">{tourStep + 1} of {TOUR_STEPS.length}</span>
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-bold text-white mb-2">{TOUR_STEPS[tourStep].title}</h3>

                                {/* Description */}
                                <p className="text-sm text-slate-400 leading-relaxed mb-4">{TOUR_STEPS[tourStep].description}</p>

                                {/* Navigation */}
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={skipTour}
                                        className="text-xs text-slate-500 hover:text-white transition-colors"
                                    >
                                        Skip tour
                                    </button>
                                    <div className="flex items-center gap-2">
                                        {tourStep > 0 && (
                                            <button
                                                onClick={prevTourStep}
                                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={nextTourStep}
                                            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
                                        >
                                            {tourStep < TOUR_STEPS.length - 1 ? (
                                                <>
                                                    Next
                                                    <ChevronRight className="w-4 h-4" />
                                                </>
                                            ) : (
                                                'Get Started'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
