/**
 * Race API Route
 *
 * Runs a latency "drag race" between embedding modes.
 * Tries real services first, falls back to simulation if unavailable.
 */

import {NextResponse} from 'next/server';
import type {EmbeddingMode, RaceResponse} from '@/types';
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
 * Display names for modes.
 */
const MODE_DISPLAY_NAMES: Record<EmbeddingMode | 'api', string> = {
    local: 'Local (CPU)',
    api: 'Jina API (Network)',
    jina: 'Jina API (Network)',
    qdrant: 'Qdrant Cloud',
};

/**
 * Default test text for racing.
 */
const DEFAULT_TEST_TEXT = 'Did you have a strategy to eliminate competitors?';

// =============================================================================
// Route Handler
// =============================================================================

interface RequestBody {
    text?: string;
}

/**
 * POST /api/race
 *
 * Runs an embedding race for the specified mode.
 *
 * Query params:
 * - mode: 'local' | 'api' | 'jina' | 'qdrant' (default: 'local')
 *
 * Body:
 * - text: string - Text to embed (default: sample question)
 */
export async function POST(req: Request): Promise<NextResponse<RaceResponse>> {
    const {searchParams} = new URL(req.url);
    const modeParam = searchParams.get('mode') || 'local';
    const body: RequestBody = await req.json();
    const text = body.text || DEFAULT_TEST_TEXT;

    // Map 'api' mode to 'jina' for internal processing
    const mode: EmbeddingMode = modeParam === 'api' ? 'jina' : modeParam as EmbeddingMode;

    const start = Date.now();

    try {
        // Try real embedding service first
        const result = await getEmbeddingWithFallback(text, mode);

        const duration = result.timing_ms;

        return NextResponse.json({
            mode: MODE_DISPLAY_NAMES[modeParam as keyof typeof MODE_DISPLAY_NAMES] || mode,
            ms: duration,
            winner: mode === 'qdrant',
            simulated: result.simulated,
        });
    } catch (error) {
        // Fall back to pure simulation
        console.warn(`Race fallback for mode ${mode}:`, error);

        const simulatedLatency = SIMULATED_LATENCY[modeParam as keyof typeof SIMULATED_LATENCY] || 200;

        // Simulate the delay
        await simulateDelay(simulatedLatency, mode);

        const duration = Date.now() - start;

        return NextResponse.json({
            mode: MODE_DISPLAY_NAMES[modeParam as keyof typeof MODE_DISPLAY_NAMES] || mode,
            ms: duration,
            winner: mode === 'qdrant',
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
