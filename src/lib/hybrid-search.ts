/**
 * Hybrid Search Configuration
 *
 * Based on patterns from qdrant-hybrid-pipeline:
 * - Dense embeddings for semantic understanding
 * - Sparse embeddings (BM25) for lexical precision
 * - Configurable fusion strategies
 *
 * @see https://github.com/brian-ogrady/qdrant-hybrid-pipeline
 */

// =============================================================================
// Configuration Types
// =============================================================================

/**
 * Distance metrics supported by Qdrant.
 */
export type DistanceMetric = 'Cosine' | 'Dot' | 'Euclid';

/**
 * Vector parameters for embedding configuration.
 */
export interface VectorParams {
    size: number;
    distance: DistanceMetric;
    on_disk?: boolean;
}

/**
 * Embedding model configuration.
 */
export interface EmbeddingModelConfig {
    name: string;
    vectorParams: VectorParams;
}

/**
 * Sparse vector configuration for BM25.
 */
export interface SparseVectorConfig {
    modifier?: 'idf';
}

/**
 * Multi-tenancy partition configuration.
 */
export interface PartitionConfig {
    fieldName: string;
    indexed: boolean;
}

/**
 * Full hybrid pipeline configuration.
 */
export interface HybridPipelineConfig {
    /**
     * Dense embedding model configuration.
     */
    denseModel: EmbeddingModelConfig;

    /**
     * Sparse vector configuration (BM25).
     */
    sparseConfig?: SparseVectorConfig;

    /**
     * Multi-tenancy partition configuration.
     */
    partitionConfig?: PartitionConfig;

    /**
     * Enable multi-tenant mode.
     */
    multiTenant?: boolean;

    /**
     * Replication factor for high availability (default: 1, recommended: 2+).
     */
    replicationFactor?: number;

    /**
     * Number of shards for scalability (default: 1, recommended: 3+).
     */
    shardNumber?: number;
}

// =============================================================================
// Default Configurations
// =============================================================================

/**
 * Default configuration for the legal demo.
 */
export const DEFAULT_HYBRID_CONFIG: HybridPipelineConfig = {
    denseModel: {
        name: 'jina-embeddings-v2-base-en',
        vectorParams: {
            size: 768,
            distance: 'Cosine',
        },
    },
    sparseConfig: {
        modifier: 'idf',
    },
    partitionConfig: {
        fieldName: 'case_id',
        indexed: true,
    },
    multiTenant: true,
    replicationFactor: 1,
    shardNumber: 1,
};

/**
 * Production-recommended configuration.
 */
export const PRODUCTION_HYBRID_CONFIG: HybridPipelineConfig = {
    ...DEFAULT_HYBRID_CONFIG,
    replicationFactor: 2,
    shardNumber: 3,
};

// =============================================================================
// Fusion Strategies
// =============================================================================

/**
 * Fusion method for combining search results.
 */
export type FusionMethod = 'rrf' | 'dbsf' | 'weighted';

/**
 * Reciprocal Rank Fusion parameters.
 */
export interface RRFParams {
    k?: number; // Default: 60
}

/**
 * Weighted fusion parameters.
 */
export interface WeightedFusionParams {
    denseWeight: number;
    sparseWeight: number;
}

/**
 * Fusion configuration.
 */
export interface FusionConfig {
    method: FusionMethod;
    params?: RRFParams | WeightedFusionParams;
}

/**
 * Default RRF fusion configuration.
 */
export const DEFAULT_FUSION_CONFIG: FusionConfig = {
    method: 'rrf',
    params: {k: 60},
};

// =============================================================================
// Search Request Types
// =============================================================================

/**
 * Hybrid search request parameters.
 */
export interface HybridSearchRequest {
    /**
     * Query text to search.
     */
    query: string;

    /**
     * Maximum results to return.
     */
    limit?: number;

    /**
     * Partition filter for multi-tenancy.
     */
    partitionFilter?: string;

    /**
     * Fusion configuration.
     */
    fusion?: FusionConfig;

    /**
     * Whether to include payload in results.
     */
    withPayload?: boolean;

    /**
     * Score threshold (0-1).
     */
    scoreThreshold?: number;
}

/**
 * Hybrid search result.
 */
export interface HybridSearchResult<T = unknown> {
    id: string | number;
    score: number;
    payload?: T;
    denseScore?: number;
    sparseScore?: number;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Creates a partition filter for case-based queries.
 */
export function createCaseFilter(caseId: string): Record<string, unknown> {
    return {
        should: [
            {key: 'case_id', match: {value: caseId}},
            {key: 'case_id', match: {value: 'universal'}},
        ],
    };
}

/**
 * Validates hybrid pipeline configuration.
 */
export function validateConfig(config: HybridPipelineConfig): string[] {
    const errors: string[] = [];

    if (!config.denseModel?.name) {
        errors.push('Dense model name is required');
    }

    if (!config.denseModel?.vectorParams?.size) {
        errors.push('Vector size is required');
    }

    if (config.multiTenant && !config.partitionConfig?.fieldName) {
        errors.push('Partition field name required for multi-tenant mode');
    }

    return errors;
}

/**
 * Gets recommended configuration based on environment.
 */
export function getRecommendedConfig(isProduction: boolean): HybridPipelineConfig {
    return isProduction ? PRODUCTION_HYBRID_CONFIG : DEFAULT_HYBRID_CONFIG;
}
