import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') || 'st_mini';

    const start = Date.now();

    // --- SIMULATION LOGIC ---

    // 1. ST LOCAL (MiniLM) - Heavy-ish CPU
    if (mode === 'st_mini') {
        const end = Date.now() + 150;
        while (Date.now() < end) { Math.random(); } // Burn CPU
    }

    // 2. FASTEMBED LOCAL (MiniLM) - Optimized CPU
    else if (mode === 'fe_mini') {
        const end = Date.now() + 100;
        while (Date.now() < end) { Math.random(); } // Burn CPU (less)
    }

    // 3. QDRANT CLOUD (MiniLM) - Instant
    else if (mode === 'cloud_mini') {
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    // 4. FASTEMBED LOCAL (Jina v3) - Heavy RAM/CPU
    else if (mode === 'local_jina') {
        const end = Date.now() + 800;
        while (Date.now() < end) { Math.random(); } // Burn CPU (LOTS)
    }

    // 5. JINA API (Double Hop) - Network Lag
    else if (mode === 'api_jina') {
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 6. QDRANT CLOUD (Jina v3) - The Holy Grail
    else if (mode === 'cloud_jina') {
        await new Promise(resolve => setTimeout(resolve, 60));
    }

    // --- MOCK RESULTS ---
    // The query is always "strategy to kill netscape" for this demo
    const result = {
        text: "We are going to cut off their air supply. Everything they are selling, we are going to give away for free.",
        witness: "Paul Maritz"
    };

    const latency = Date.now() - start;

    // Determine metadata based on mode
    let modeLabel = "Unknown";
    let dim = "---";

    if (mode.includes('mini')) {
        dim = "384d";
        if (mode === 'st_mini') modeLabel = "Local ST (MiniLM)";
        if (mode === 'fe_mini') modeLabel = "Local FastEmbed (MiniLM)";
        if (mode === 'cloud_mini') modeLabel = "Qdrant Cloud (MiniLM)";
    } else {
        dim = "1024d";
        if (mode === 'local_jina') modeLabel = "Local FastEmbed (Jina v3)";
        if (mode === 'api_jina') modeLabel = "Jina API (Double Hop)";
        if (mode === 'cloud_jina') modeLabel = "Qdrant Cloud (Jina v3)";
    }

    return NextResponse.json({
        ...result,
        latency,
        mode: modeLabel,
        dim
    });
}
