/**
 * Benchmark API Route
 *
 * Tests REAL end-to-end search performance across different modes.
 * Queries the triviaqa_wiki_large collection (4800 Wikipedia articles).
 */

import {NextResponse} from 'next/server';
import type {BenchmarkResponse} from '@/types';
import {searchWithJinaEmbed, searchWithQCI, searchWithQCINative, getQdrantClient, NATIVE_COLLECTION} from '@/lib/qdrant';
import {embedLocally, isLocalEmbeddingAvailable} from '@/lib/localEmbeddings';
import {embedWithHuggingFace} from '@/lib/huggingface';

// =============================================================================
// Constants
// =============================================================================

/**
 * Wikipedia collection for benchmarking.
 */
const BENCHMARK_COLLECTION = 'triviaqa_wiki_large';

/**
 * Sample Wikipedia queries for benchmarking.
 */
const SAMPLE_QUERIES = [
    'What is the speed of light?',
    'Who invented the telephone?',
    'When did World War 2 end?',
    'What is photosynthesis?',
    'Who wrote Romeo and Juliet?',
];

/**
 * Payload sizes for bandwidth display (bytes).
 */
const PAYLOAD_SIZES = {
    local: 768 * 4,    // Vector: 768 dims * 4 bytes (Jina)
    api: 768 * 4,      // Jina API
    jina: 768 * 4,     // Jina API
    qdrant: 50,        // Just text query, ~50 bytes
    native: 50,        // QCI native - text only
    hf: 384 * 4,       // Vector: 384 dims * 4 bytes (all-MiniLM-L6-v2)
};

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
 * Runs a REAL end-to-end search benchmark for the specified mode.
 * Queries the Wikipedia collection with actual embedding + search.
 *
 * Query params:
 * - mode: 'local' | 'api' | 'qdrant' (default: 'local')
 *
 * Body:
 * - text: string - Query text (default: random sample query)
 * - use_hybrid: boolean - Whether to use hybrid mode (default: false)
 */
export async function POST(req: Request): Promise<NextResponse<BenchmarkResponse>> {
    const {searchParams} = new URL(req.url);
    const modeParam = searchParams.get('mode') || 'local';
    const body: RequestBody = await req.json();

    // Use provided text or random sample query
    const text = body.text || SAMPLE_QUERIES[Math.floor(Math.random() * SAMPLE_QUERIES.length)];

    try {
        let latency: number;
        let simulated = false;
        let resultText = '';

        if (modeParam === 'qdrant') {
            // Real QCI: Single API call, embedding happens server-side
            const result = await searchWithQCI(text, BENCHMARK_COLLECTION, 3);
            latency = result.timing_ms;
            // Handle both 'text' and 'content' payload fields
            const payload = result.results[0]?.payload;
            resultText = (payload as {text?: string})?.text?.slice(0, 100)
                || (payload as {content?: string})?.content?.slice(0, 100)
                || 'No results';

        } else if (modeParam === 'api' || modeParam === 'jina') {
            // Real Jina: Embed via Jina API, then search Qdrant
            const result = await searchWithJinaEmbed(text, BENCHMARK_COLLECTION, 3);
            latency = result.timing_ms;
            // Handle both 'text' and 'content' payload fields
            const payload = result.results[0]?.payload;
            resultText = (payload as {text?: string})?.text?.slice(0, 100)
                || (payload as {content?: string})?.content?.slice(0, 100)
                || 'No results';

        } else if (modeParam === 'local') {
            // Local: Embed locally, then search Qdrant
            const available = await isLocalEmbeddingAvailable();
            if (available) {
                const startTime = performance.now();
                const embedResult = await embedLocally(text);
                const client = getQdrantClient();
                const searchResult = await client.search(BENCHMARK_COLLECTION, {
                    vector: embedResult.embedding,
                    limit: 3,
                    with_payload: true,
                });
                latency = Math.round(performance.now() - startTime);
                const localPayload = searchResult[0]?.payload as {text?: string; content?: string} | undefined;
                resultText = localPayload?.text?.slice(0, 100) || localPayload?.content?.slice(0, 100) || 'No results';
            } else {
                // Fallback: simulate local latency
                simulated = true;
                await new Promise(resolve => setTimeout(resolve, 800));
                latency = 800;
                resultText = 'Local embedding unavailable - simulated';
            }

        } else if (modeParam === 'native') {
            // QCI Native: all-MiniLM-L6-v2 in-cluster, zero external calls
            try {
                const result = await searchWithQCINative(text, 3);
                latency = result.timing_ms;
                const payload = result.results[0]?.payload;
                resultText = (payload as {title?: string; content?: string})?.title
                    || (payload as {content?: string})?.content?.slice(0, 100)
                    || 'No results';
            } catch (error) {
                simulated = true;
                latency = 0;
                resultText = `Error: ${error instanceof Error ? error.message : 'QCI native failed'}`;
            }

        } else if (modeParam === 'hf') {
            // HuggingFace API + Qdrant: Fair comparison with same model as QCI native
            try {
                const startTime = performance.now();
                const embedResult = await embedWithHuggingFace(text);
                const client = getQdrantClient();
                const searchResult = await client.search(NATIVE_COLLECTION, {
                    vector: embedResult.embedding,
                    limit: 3,
                    with_payload: true,
                });
                latency = Math.round(performance.now() - startTime);
                const payload = searchResult[0]?.payload as {title?: string; content?: string} | undefined;
                resultText = payload?.title || payload?.content?.slice(0, 100) || 'No results';
            } catch (error) {
                simulated = true;
                latency = 0;
                resultText = `Error: ${error instanceof Error ? error.message : 'HF API failed'}`;
            }

        } else {
            throw new Error(`Unknown mode: ${modeParam}`);
        }

        const payloadSize = PAYLOAD_SIZES[modeParam as keyof typeof PAYLOAD_SIZES] || 0;

        return NextResponse.json({
            latency,
            bandwidth: `${payloadSize} bytes`,
            result: resultText,
            mode: modeParam as 'local' | 'jina' | 'qdrant',
            simulated,
        });

    } catch (error) {
        console.error(`Benchmark error for mode ${modeParam}:`, error);

        return NextResponse.json({
            latency: 0,
            bandwidth: '0 bytes',
            result: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            mode: modeParam as 'local' | 'jina' | 'qdrant',
            simulated: true,
        });
    }
}
