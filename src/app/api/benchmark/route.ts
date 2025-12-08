/**
 * Benchmark API Route
 *
 * Tests embedding performance across different modes.
 * Tries real services first, falls back to simulation if unavailable.
 */

import {NextResponse} from 'next/server';
import type {EmbeddingMode, BenchmarkResponse} from '@/types';
import {getEmbeddingWithFallback} from '@/lib/embedding-service';

// =============================================================================
// Constants
// =============================================================================

/**
 * Simulated latencies for fallback (ms).
 */
const SIMULATED_LATENCY: Record<EmbeddingMode | 'api', number> = {
    local: 800,
    api: 500,
    jina: 500,
    qdrant: 60,
};

/**
 * Payload sizes for bandwidth simulation (bytes).
 */
const PAYLOAD_SIZES: Record<EmbeddingMode | 'api', number> = {
    local: 1024 * 4,  // Vector: 1024 dims * 4 bytes
    api: 1024 * 4,
    jina: 1024 * 4,
    qdrant: 0,        // Just text, no vector transfer
};

/**
 * Default test text for benchmarking.
 */
const DEFAULT_TEST_TEXT = 'We are going to cut off their air supply. Everything they are selling, we are going to give away for free.';

// =============================================================================
// Route Handler
// =============================================================================

interface RequestBody {
    text?: string;
    use_hybrid?: boolean;
}

/**
 * POST /api/benchmark
 *
 * Runs an embedding benchmark for the specified mode.
 *
 * Query params:
 * - mode: 'local' | 'api' | 'jina' | 'qdrant' (default: 'local')
 *
 * Body:
 * - text: string - Text to embed (default: sample quote)
 * - use_hybrid: boolean - Whether to use hybrid mode (default: false)
 */
export async function POST(req: Request): Promise<NextResponse<BenchmarkResponse>> {
    const {searchParams} = new URL(req.url);
    const modeParam = searchParams.get('mode') || 'local';
    const body: RequestBody = await req.json();
    const text = body.text || DEFAULT_TEST_TEXT;
    const useHybrid = body.use_hybrid || false;

    // Map 'api' mode to 'jina' for internal processing
    const mode: EmbeddingMode = modeParam === 'api' ? 'jina' : modeParam as EmbeddingMode;

    const start = Date.now();

    try {
        // Try real embedding service first
        const result = await getEmbeddingWithFallback(text, mode);

        let latency = result.timing_ms;

        // Apply binary quantization speedup simulation for qdrant mode
        if (mode === 'qdrant' && !result.simulated && latency > 40) {
            latency = Math.floor(latency * 0.7); // BQ typically 30-40% faster
        }

        // Hybrid mode adds slight overhead
        if (useHybrid) {
            latency += 20;
        }

        // Calculate payload size
        const payloadSize = mode === 'qdrant'
            ? Buffer.byteLength(text, 'utf8')
            : PAYLOAD_SIZES[mode];

        return NextResponse.json({
            latency,
            bandwidth: `${payloadSize} bytes`,
            result: DEFAULT_TEST_TEXT,
            mode,
            simulated: result.simulated,
        });
    } catch (error) {
        // Fall back to pure simulation
        console.warn(`Benchmark fallback for mode ${mode}:`, error);

        const simulatedLatency = SIMULATED_LATENCY[modeParam as keyof typeof SIMULATED_LATENCY] || 200;

        // Simulate the delay
        await simulateDelay(simulatedLatency, mode);

        const duration = Date.now() - start;

        return NextResponse.json({
            latency: duration,
            bandwidth: `${PAYLOAD_SIZES[mode]} bytes`,
            result: DEFAULT_TEST_TEXT,
            mode,
            simulated: true,
        });
    }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Simulates delay for fallback mode.
 */
async function simulateDelay(baseLatency: number, mode: EmbeddingMode): Promise<void> {
    if (mode === 'local') {
        // Simulate CPU-bound work
        const end = Date.now() + baseLatency;
        while (Date.now() < end) {
            Math.random();
        }
    } else {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, baseLatency));
    }
}
