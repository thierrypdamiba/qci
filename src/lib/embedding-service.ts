/**
 * Unified Embedding Service
 *
 * Provides a single interface for all embedding modes with graceful fallback.
 * Handles local, Jina Cloud, and Qdrant Cloud Inference modes.
 */

import type {EmbeddingResult, EmbeddingMode} from '@/types';
import {embedWithHuggingFace} from './huggingface';
import {
    embedLocally,
    getSimulatedLocalEmbedding,
    isLocalEmbeddingAvailable,
} from './localEmbeddings';
import {EmbeddingError} from './errors';

/**
 * Extended embedding result with metadata.
 */
export interface EmbeddingServiceResult extends EmbeddingResult {
    mode: EmbeddingMode;
    simulated: boolean;
}

/**
 * Simulated latency values for fallback (ms).
 */
const SIMULATED_LATENCY: Record<EmbeddingMode, number> = {
    local: 180,
    jina: 120,
    qdrant: 45,
};

/**
 * Gets an embedding using the specified mode.
 * Throws on failure - use getEmbeddingWithFallback for graceful degradation.
 *
 * @param text - Text to embed
 * @param mode - Embedding mode to use
 * @returns Embedding result
 * @throws EmbeddingError on failure
 */
export async function getEmbedding(
    text: string,
    mode: EmbeddingMode,
): Promise<EmbeddingServiceResult> {
    let result: EmbeddingResult;

    switch (mode) {
        case 'local':
            result = await embedLocally(text);
            break;
        case 'jina':
        case 'qdrant':
            result = await embedWithHuggingFace(text);
            break;
        default:
            throw new EmbeddingError(`Unknown embedding mode: ${mode}`, mode);
    }

    return {
        ...result,
        mode,
        simulated: false,
    };
}

/**
 * Gets an embedding with graceful fallback to simulation.
 * Never throws - always returns a result (real or simulated).
 *
 * @param text - Text to embed
 * @param mode - Embedding mode to use
 * @returns Embedding result (real or simulated)
 */
export async function getEmbeddingWithFallback(
    text: string,
    mode: EmbeddingMode,
): Promise<EmbeddingServiceResult> {
    try {
        return await getEmbedding(text, mode);
    } catch (error) {
        console.warn(`Embedding failed for mode ${mode}, using simulation:`, error);
        return await getSimulatedEmbedding(text, mode);
    }
}

/**
 * Gets a simulated embedding for the specified mode.
 *
 * @param text - Text to embed
 * @param mode - Mode to simulate
 * @returns Simulated embedding result
 */
export async function getSimulatedEmbedding(
    text: string,
    mode: EmbeddingMode,
): Promise<EmbeddingServiceResult> {
    const latency = SIMULATED_LATENCY[mode];

    let result: EmbeddingResult;

    switch (mode) {
        case 'local':
            result = await getSimulatedLocalEmbedding(text, latency);
            break;
        case 'jina':
        case 'qdrant':
        default:
            // Simulate HuggingFace embedding (384-dim)
            await new Promise((r) => setTimeout(r, latency));
            const hash = text.split('').reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
            const embedding = new Array(384).fill(0).map((_, i) => Math.cos((hash + i * 17) | 0) * 0.5);
            result = {embedding, timing_ms: latency, model: 'all-MiniLM-L6-v2', dimension: 384};
            break;
    }

    return {
        ...result,
        mode,
        simulated: true,
    };
}

/**
 * Checks if a specific embedding mode is available.
 *
 * @param mode - Mode to check
 * @returns True if the mode is available
 */
export async function isEmbeddingModeAvailable(mode: EmbeddingMode): Promise<boolean> {
    switch (mode) {
        case 'local':
            return await isLocalEmbeddingAvailable();
        case 'jina':
        case 'qdrant':
            // Using HuggingFace API
            return Boolean(process.env.HF_API_KEY);
        default:
            return false;
    }
}

/**
 * Gets all available embedding modes.
 *
 * @returns Array of available modes
 */
export async function getAvailableModes(): Promise<EmbeddingMode[]> {
    const modes: EmbeddingMode[] = ['local', 'jina', 'qdrant'];
    const availability = await Promise.all(
        modes.map(async (mode) => ({
            mode,
            available: await isEmbeddingModeAvailable(mode),
        })),
    );

    return availability.filter((m) => m.available).map((m) => m.mode);
}

/**
 * Batch embedding with concurrency control.
 *
 * @param texts - Array of texts to embed
 * @param mode - Embedding mode to use
 * @param concurrency - Maximum concurrent requests
 * @returns Array of embedding results
 */
export async function batchEmbed(
    texts: string[],
    mode: EmbeddingMode,
    concurrency: number = 5,
): Promise<EmbeddingServiceResult[]> {
    const results: EmbeddingServiceResult[] = [];

    for (let i = 0; i < texts.length; i += concurrency) {
        const batch = texts.slice(i, i + concurrency);
        const batchResults = await Promise.all(
            batch.map((text) => getEmbeddingWithFallback(text, mode)),
        );
        results.push(...batchResults);
    }

    return results;
}

/**
 * Compares embedding performance across modes.
 *
 * @param text - Text to embed
 * @param modes - Modes to compare
 * @returns Comparison results
 */
export async function compareEmbeddingModes(
    text: string,
    modes: EmbeddingMode[] = ['local', 'jina', 'qdrant'],
): Promise<Record<EmbeddingMode, EmbeddingServiceResult>> {
    const results = await Promise.all(
        modes.map(async (mode) => {
            const result = await getEmbeddingWithFallback(text, mode);
            return {mode, result};
        }),
    );

    return Object.fromEntries(
        results.map(({mode, result}) => [mode, result]),
    ) as Record<EmbeddingMode, EmbeddingServiceResult>;
}
