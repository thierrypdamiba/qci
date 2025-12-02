import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') || 'local';
    const body = await req.json();

    const start = Date.now();

    // --- SIMULATION LOGIC ---

    // LANE 1: LOCAL (CPU Bound)
    if (mode === 'local') {
        // Force CPU blocking to demonstrate "Heavy Client"
        // Simulate ~800ms of CPU work
        const end = Date.now() + 800;
        while (Date.now() < end) { Math.random(); }
    }

    // LANE 2: API (Network Bound)
    else if (mode === 'api') {
        // Simulate Network Lag (~500ms)
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // LANE 3: QDRANT CLOUD (Optimized)
    else if (mode === 'qdrant') {
        // Fast Server-side inference (~60ms)
        await new Promise(resolve => setTimeout(resolve, 60));
    }

    const duration = Date.now() - start;

    return NextResponse.json({
        mode: mode === 'local' ? "Local (CPU)" : (mode === 'api' ? "Jina API (Network)" : "Qdrant Cloud"),
        ms: duration,
        winner: mode === 'qdrant'
    });
}
