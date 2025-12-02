import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') || 'local';
    const body = await req.json();
    const text = body.text || "";
    const use_hybrid = body.use_hybrid || false;

    const start = Date.now();
    let payloadSize = 0;

    // --- SIMULATION LOGIC ---

    // LANE 1: LOCAL (CPU Bound)
    if (mode === 'local') {
        // Measure: Loading model + Encoding time
        // Simulate CPU work
        const end = Date.now() + 800;
        while (Date.now() < end) { Math.random(); }

        // Simulated payload: Vector (1024 dims * 4 bytes)
        payloadSize = 1024 * 4;
    }

    // LANE 2: API (Network Bound)
    else if (mode === 'api') {
        // Hop 1 + Hop 2
        // Simulate Network Lag (~500ms)
        await new Promise(resolve => setTimeout(resolve, 500));

        // Payload: Vector dragged over wire
        payloadSize = 1024 * 4;
    }

    // LANE 3: QDRANT (The Hero)
    else if (mode === 'qdrant') {
        // Payload: Just the text string
        payloadSize = Buffer.byteLength(text, 'utf8');

        if (use_hybrid) {
            // FEATURE: Universal Query API (Dense + Sparse in 1 hit)
            // Slightly slower than pure dense due to fusion overhead, but still fast
            await new Promise(resolve => setTimeout(resolve, 80));
        } else {
            // Standard Dense Inference
            // Fast Server-side inference (~60ms)
            await new Promise(resolve => setTimeout(resolve, 60));
        }
    }

    let duration = Date.now() - start;

    // Simulate Binary Quantization speedup
    // In a real app with BQ enabled, this happens naturally.
    // We simulate a 30% speedup for Qdrant mode if it took "too long" (e.g. not instant)
    // But here we just apply it to the base duration for effect if it's Qdrant
    if (mode === 'qdrant' && duration > 40) {
        duration = Math.floor(duration * 0.7); // BQ is typically 30-40% faster
    }

    // Mock Result
    const result = "We are going to cut off their air supply. Everything they are selling, we are going to give away for free.";

    return NextResponse.json({
        latency: duration,
        bandwidth: `${payloadSize} bytes`,
        result: result,
        mode: mode
    });
}
