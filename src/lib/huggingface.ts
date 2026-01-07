/**
 * Hugging Face Inference API Module
 *
 * Uses HF's hosted inference for all-MiniLM-L6-v2 embeddings.
 * This provides an external API path to compare fairly with QCI native.
 */

import type {EmbeddingResult} from '@/types';
import {EmbeddingError} from './errors';

const HF_API_URL = 'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction';
const HF_API_KEY = (process.env.HF_API_KEY || '').trim();

/**
 * Generates embeddings using Hugging Face Inference API.
 * Uses all-MiniLM-L6-v2 (384 dims) - same as QCI native.
 *
 * @param text - Text to embed
 * @returns Embedding result with timing
 */
export async function embedWithHuggingFace(text: string): Promise<EmbeddingResult> {
    const startTime = performance.now();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // HF API works without key for small models, but key helps with rate limits
    if (HF_API_KEY) {
        headers['Authorization'] = `Bearer ${HF_API_KEY}`;
    }

    try {
        const response = await fetch(HF_API_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                inputs: text,
                options: {
                    wait_for_model: true,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new EmbeddingError(
                `HuggingFace API error: ${response.status} - ${errorText}`,
                'huggingface',
            );
        }

        const data = await response.json();
        const endTime = performance.now();

        // HF returns array of token embeddings, we need to mean pool
        let embedding: number[];
        if (Array.isArray(data) && Array.isArray(data[0])) {
            // Mean pooling across token dimension
            const numTokens = data.length;
            const dim = data[0].length;
            embedding = new Array(dim).fill(0);
            for (let i = 0; i < numTokens; i++) {
                for (let j = 0; j < dim; j++) {
                    embedding[j] += data[i][j] / numTokens;
                }
            }
        } else if (Array.isArray(data)) {
            embedding = data;
        } else {
            throw new EmbeddingError('Unexpected HuggingFace response format', 'huggingface');
        }

        return {
            embedding,
            timing_ms: Math.round(endTime - startTime),
            model: 'all-MiniLM-L6-v2',
            dimension: 384,
        };
    } catch (error) {
        if (error instanceof EmbeddingError) {
            throw error;
        }
        throw new EmbeddingError(
            `HuggingFace API failed: ${error instanceof Error ? error.message : 'Unknown'}`,
            'huggingface',
        );
    }
}

/**
 * Checks if HuggingFace API is available.
 */
export async function isHuggingFaceAvailable(): Promise<boolean> {
    try {
        const headers: Record<string, string> = {'Content-Type': 'application/json'};
        if (HF_API_KEY) {
            headers['Authorization'] = `Bearer ${HF_API_KEY}`;
        }
        const response = await fetch(HF_API_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify({inputs: 'test'}),
        });
        return response.ok;
    } catch {
        return false;
    }
}
