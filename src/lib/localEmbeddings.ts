/**
 * Local Embeddings Module
 *
 * Handles embeddings using the FastEmbed server for local/development use.
 * Provides graceful fallback when server is unavailable.
 */

import type {EmbeddingResult} from '@/types';
import {EmbeddingError} from './errors';
import {getConfig} from './config';

/**
 * Default FastEmbed server URL.
 */
const DEFAULT_FASTEMBED_URL = 'http://localhost:8001';

/**
 * Default model for local embeddings.
 */
const DEFAULT_LOCAL_MODEL = 'jinaai/jina-embeddings-v2-base-en';

/**
 * Timeout for FastEmbed requests (ms).
 */
const REQUEST_TIMEOUT = 10000;

/**
 * Gets the FastEmbed server URL.
 */
function getFastEmbedUrl(): string {
    try {
        const config = getConfig();
        return config.fastEmbed.url;
    } catch {
        return process.env.FASTEMBED_URL || DEFAULT_FASTEMBED_URL;
    }
}

/**
 * Generates embeddings using the local FastEmbed server.
 *
 * @param text - The text to embed
 * @param model - The model to use (defaults to jina-embeddings-v2-base-en)
 * @returns Embedding result with timing information
 * @throws EmbeddingError if the server is unavailable or returns an error
 */
export async function embedLocally(
    text: string,
    model: string = DEFAULT_LOCAL_MODEL,
): Promise<EmbeddingResult> {
    const url = getFastEmbedUrl();
    const startTime = performance.now();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        const response = await fetch(`${url}/embed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                model,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorBody = await response.text().catch(() => 'Unknown error');
            throw EmbeddingError.forLocalServerError(
                `Server returned ${response.status}: ${errorBody}`,
            );
        }

        const data = await response.json();

        return {
            embedding: data.embedding,
            timing_ms: data.timingMs || Math.round(performance.now() - startTime),
            model: data.model || model,
            dimension: data.dimension || data.embedding?.length || 768,
        };
    } catch (error) {
        if (error instanceof EmbeddingError) {
            throw error;
        }

        // Handle network errors
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw EmbeddingError.forLocalServerError('Request timed out');
            }
            throw EmbeddingError.forLocalServerError(error.message);
        }

        throw EmbeddingError.forLocalServerError('Unknown error');
    }
}

/**
 * Checks if the FastEmbed server is available.
 *
 * @returns True if the server is reachable
 */
export async function isLocalEmbeddingAvailable(): Promise<boolean> {
    const url = getFastEmbedUrl();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(`${url}/health`, {
            method: 'GET',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Generates simulated embedding for fallback.
 * Returns a deterministic embedding based on text hash.
 *
 * @param text - The text to embed
 * @param simulatedLatency - Simulated latency in ms
 * @returns Simulated embedding result
 */
export async function getSimulatedLocalEmbedding(
    text: string,
    simulatedLatency: number = 180,
): Promise<EmbeddingResult> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, simulatedLatency));

    // Generate deterministic embedding from text hash
    const hash = text.split('').reduce((acc, char) => {
        return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
    }, 0);

    const embedding = new Array(768).fill(0).map((_, i) => {
        const seed = (hash + i * 31) | 0;
        return Math.sin(seed) * 0.5;
    });

    return {
        embedding,
        timing_ms: simulatedLatency,
        model: DEFAULT_LOCAL_MODEL,
        dimension: 768,
    };
}

/**
 * Attempts local embedding with graceful fallback to simulation.
 *
 * @param text - The text to embed
 * @returns Embedding result (real or simulated)
 */
export async function embedLocallyWithFallback(text: string): Promise<EmbeddingResult & {simulated: boolean}> {
    try {
        const result = await embedLocally(text);
        return {...result, simulated: false};
    } catch (error) {
        console.warn('Local embedding unavailable, using simulation:', error);
        const result = await getSimulatedLocalEmbedding(text);
        return {...result, simulated: true};
    }
}
