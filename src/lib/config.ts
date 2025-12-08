/**
 * QCI Demo Configuration Module
 *
 * Centralized configuration with validation.
 * Environment variables are validated at startup.
 */

import {ConfigurationError} from './errors';

/**
 * Qdrant Cloud configuration.
 */
export interface QdrantConfig {
    url: string;
    apiKey: string;
    collection: string;
}

/**
 * Jina AI configuration.
 */
export interface JinaConfig {
    apiKey: string;
    model: string;
}

/**
 * FastEmbed local server configuration.
 */
export interface FastEmbedConfig {
    url: string;
    enabled: boolean;
}

/**
 * Full application configuration.
 */
export interface AppConfig {
    qdrant: QdrantConfig;
    jina: JinaConfig;
    fastEmbed: FastEmbedConfig;
    isProduction: boolean;
}

/**
 * Cached configuration instance.
 */
let cachedConfig: AppConfig | null = null;

/**
 * Gets a required environment variable or throws.
 */
function getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw ConfigurationError.forMissingEnvVar(key);
    }
    return value;
}

/**
 * Gets an optional environment variable with a default value.
 */
function getOptionalEnv(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
}

/**
 * Validates a URL format.
 */
function validateUrl(key: string, value: string): void {
    try {
        new URL(value);
    } catch {
        throw ConfigurationError.forInvalidUrl(key, value);
    }
}

/**
 * Gets the application configuration.
 * Validates all required environment variables.
 *
 * @returns The validated application configuration
 * @throws ConfigurationError if required variables are missing
 */
export function getConfig(): AppConfig {
    if (cachedConfig) {
        return cachedConfig;
    }

    // Required variables
    const qdrantUrl = getRequiredEnv('QDRANT_URL');
    const qdrantApiKey = getRequiredEnv('QDRANT_API_KEY');
    const jinaApiKey = getRequiredEnv('JINA_API_KEY');

    // Optional variables with defaults
    const qdrantCollection = getOptionalEnv('QDRANT_COLLECTION', 'legal_memory');
    const fastEmbedUrl = getOptionalEnv('FASTEMBED_URL', 'http://localhost:8001');
    const jinaModel = getOptionalEnv('JINA_MODEL', 'jina-embeddings-v2-base-en');

    // Validate URLs
    validateUrl('QDRANT_URL', qdrantUrl);
    if (fastEmbedUrl !== 'http://localhost:8001') {
        validateUrl('FASTEMBED_URL', fastEmbedUrl);
    }

    cachedConfig = {
        qdrant: {
            url: qdrantUrl,
            apiKey: qdrantApiKey,
            collection: qdrantCollection,
        },
        jina: {
            apiKey: jinaApiKey,
            model: jinaModel,
        },
        fastEmbed: {
            url: fastEmbedUrl,
            enabled: process.env.NODE_ENV !== 'production',
        },
        isProduction: process.env.NODE_ENV === 'production',
    };

    return cachedConfig;
}

/**
 * Safely gets configuration without throwing.
 * Returns null if configuration is invalid.
 */
export function getConfigSafe(): AppConfig | null {
    try {
        return getConfig();
    } catch {
        return null;
    }
}

/**
 * Checks if a specific service is configured.
 */
export function isServiceConfigured(service: 'qdrant' | 'jina' | 'fastEmbed'): boolean {
    try {
        const config = getConfig();
        switch (service) {
            case 'qdrant':
                return Boolean(config.qdrant.url && config.qdrant.apiKey);
            case 'jina':
                return Boolean(config.jina.apiKey);
            case 'fastEmbed':
                return config.fastEmbed.enabled;
            default:
                return false;
        }
    } catch {
        return false;
    }
}

/**
 * Checks if running in production environment.
 */
export function isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
}

/**
 * Gets the default embedding model name.
 */
export function getDefaultModel(): string {
    return getOptionalEnv('JINA_MODEL', 'jina-embeddings-v2-base-en');
}

/**
 * Model dimension mapping.
 */
export const MODEL_DIMENSIONS: Record<string, number> = {
    'jina-embeddings-v2-base-en': 768,
    'jina-embeddings-v3': 1024,
    'all-MiniLM-L6-v2': 384,
};

/**
 * Gets the dimension for a model.
 */
export function getModelDimension(model: string): number {
    return MODEL_DIMENSIONS[model] || 768;
}
