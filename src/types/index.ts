/**
 * QCI Demo Type Definitions
 *
 * This module contains all TypeScript interfaces and types used throughout
 * the QCI demo application. Following Qdrant SDK conventions.
 */

// =============================================================================
// Objection Types
// =============================================================================

/**
 * Legal objection types supported by the system.
 */
export type ObjectionType =
    | 'HEARSAY'
    | 'LACK OF FOUNDATION'
    | 'ARGUMENTATIVE'
    | 'SPECULATION'
    | 'ASSUMES FACTS'
    | 'MISCHARACTERIZATION'
    | 'VAGUE'
    | 'IMPROPER OPINION'
    | 'PREJUDICIAL'
    | 'LEADING';

/**
 * Document types in the legal memory collection.
 */
export type DocumentType = 'RULE' | 'EVIDENCE' | 'TRANSCRIPT' | 'MOTION' | 'BRIEF' | 'DEPOSITION';

/**
 * Embedding execution modes.
 */
export type EmbeddingMode = 'local' | 'jina' | 'qdrant';

/**
 * Case identifiers for demo trials.
 */
export type CaseId = 'msft' | 'enron' | 'kitzmiller';

// =============================================================================
// Embedding Types
// =============================================================================

/**
 * Result from embedding generation.
 */
export interface EmbeddingResult {
    embedding: number[];
    timing_ms: number;
    model: string;
    dimension: number;
}

/**
 * Sparse embedding result (BM25).
 */
export interface SparseEmbeddingResult {
    indices: number[];
    values: number[];
    timing_ms: number;
    model: string;
}

// =============================================================================
// Document & Search Types
// =============================================================================

/**
 * Payload structure for documents in Qdrant collection.
 */
export interface DocumentPayload {
    text: string;
    doc_type: DocumentType;
    case_id: string;
    source: string;
    objection_type: ObjectionType | null;
    keywords?: string;
}

/**
 * Search hit from Qdrant.
 */
export interface SearchHit {
    id: string | number;
    score: number;
    payload: DocumentPayload;
}

/**
 * Formatted search hit for UI display.
 */
export interface FormattedHit {
    id: string | number;
    score: number;
    title: string;
    snippet: string;
    fused_rank: number;
    payload: {
        doc_type: DocumentType;
        case_id: string;
        objection_type: ObjectionType | null;
    };
}

// =============================================================================
// Pipeline Trace Types
// =============================================================================

/**
 * Trigger information for pipeline.
 */
export interface PipelineTrigger {
    type?: string;
    label: string;
    action: 'PROCEED' | 'IGNORE';
}

/**
 * Route plan for search.
 */
export interface PipelineRoute {
    plan: string;
    details: string;
}

/**
 * Query configuration.
 */
export interface PipelineQuery {
    text: string;
    filters: string;
}

/**
 * Dense embedding info.
 */
export interface DenseEmbedInfo {
    model: string;
    ms: number;
    dim: number;
}

/**
 * Sparse embedding info.
 */
export interface SparseEmbedInfo {
    model: string;
    ms: number;
}

/**
 * Search configuration.
 */
export interface SearchConfig {
    dense_k: number;
    sparse_k: number;
    retrieved: number;
    ms?: number;
}

/**
 * Fusion configuration.
 */
export interface FusionConfig {
    method: string;
    top_k: number | string;
    results?: number;
    ms?: number;
}

/**
 * Pipeline decision state.
 */
export type PipelineDecision = 'WAITING...' | 'ANALYZING...' | 'ACTIONABLE' | 'NO_ACTION' | 'ERROR';

/**
 * Full pipeline trace for debugging and display.
 */
export interface PipelineTrace {
    trigger: PipelineTrigger;
    route?: PipelineRoute;
    query?: PipelineQuery;
    decision: PipelineDecision;
    text?: string;
    collection?: string;
    filters?: string;
    dense: DenseEmbedInfo;
    sparse: SparseEmbedInfo;
    hybrid?: {dense_k: number; sparse_k: number};
    search?: SearchConfig;
    fusion: FusionConfig;
    latency_e2e: number;
}

/**
 * Pipeline timing breakdown.
 */
export interface PipelineTimings {
    preprocess: number;
    embed_dense: number;
    embed_sparse: number;
    search: number;
    fusion: number;
    total: number;
}

// =============================================================================
// UI State Types
// =============================================================================

/**
 * Insight/recommendation state.
 */
export interface InsightState {
    type: 'INFO' | 'OBJECTION';
    recommendation: string;
    score: number;
    script: string;
    glow: string;
}

/**
 * Lane state for comparison UI.
 */
export interface LaneState {
    trace: PipelineTrace;
    insight: InsightState;
    hits: FormattedHit[];
    timings: PipelineTimings;
}

/**
 * History entry for objection log.
 */
export interface HistoryEntry {
    title: string;
    text: string;
    timestamp: string;
}

// =============================================================================
// Case Data Types
// =============================================================================

/**
 * Single transcript line.
 */
export interface TranscriptLine {
    s: string;  // speaker
    t: string;  // text
}

/**
 * Case script data.
 */
export interface CaseScript {
    title: string;
    color: string;
    script: TranscriptLine[];
}

/**
 * All cases mapping.
 */
export type CasesMap = Record<CaseId, CaseScript>;

// =============================================================================
// Tour Types
// =============================================================================

/**
 * Tour step position.
 */
export type TourPosition = 'left' | 'right' | 'top' | 'bottom';

/**
 * Tour step definition.
 */
export interface TourStep {
    target: string;
    title: string;
    description: string;
    position: TourPosition;
}

// =============================================================================
// API Types
// =============================================================================

/**
 * Cockpit API request body.
 */
export interface CockpitRequest {
    text: string;
    caseId?: CaseId;
}

/**
 * Cockpit API response.
 */
export interface CockpitResponse {
    latency: number;
    score: number;
    objection: ObjectionType | null;
    recommendation: string;
    script: string | null;
    hits: FormattedHit[];
    trace: PipelineTrace;
    timings: PipelineTimings;
}

/**
 * Benchmark API response.
 */
export interface BenchmarkResponse {
    latency: number;
    bandwidth: string;
    result: string;
    mode: EmbeddingMode;
    simulated?: boolean;
}

/**
 * Race API response.
 */
export interface RaceResponse {
    mode: string;
    ms: number;
    winner: boolean;
    simulated?: boolean;
}

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for Lane component.
 */
export interface LaneProps {
    title: string;
    state: LaneState;
    hits: FormattedHit[];
    insight: InsightState;
    mode: EmbeddingMode;
    opponentState?: LaneState;
}

/**
 * Props for TimelineStep component.
 */
export interface TimelineStepProps {
    icon: React.ComponentType<{className?: string}>;
    label: string;
    value: string;
    status?: 'default' | 'ok' | 'warn' | 'alert' | 'fast' | 'slow';
    expanded: boolean;
    onToggle: () => void;
    children?: React.ReactNode;
    subValue?: string;
}

/**
 * Props for CourtFeed component.
 */
export interface CourtFeedProps {
    lines: TranscriptLine[];
    currentStep: number;
    onLineClick: (index: number) => void;
    isPlaying: boolean;
    onTogglePlay: () => void;
    onPrevStep: () => void;
    onNextStep: () => void;
    onReset: () => void;
    onReplay: () => void;
    totalSteps: number;
}

/**
 * Mode selector configuration.
 */
export interface ModeConfig {
    name: string;
    icon: React.ComponentType<{className?: string}>;
    color: string;
}

/**
 * Mode labels mapping.
 */
export type ModeLabels = Record<EmbeddingMode, ModeConfig>;

// =============================================================================
// Hybrid Search Types (from qdrant-hybrid-pipeline patterns)
// =============================================================================

/**
 * Distance metrics supported by Qdrant.
 */
export type DistanceMetric = 'Cosine' | 'Dot' | 'Euclid';

/**
 * Fusion method for combining dense and sparse results.
 */
export type FusionMethod = 'rrf' | 'dbsf' | 'weighted';

/**
 * Vector configuration for collection setup.
 */
export interface VectorConfig {
    size: number;
    distance: DistanceMetric;
    on_disk?: boolean;
}

/**
 * Partition configuration for multi-tenancy.
 */
export interface PartitionConfig {
    field_name: string;
    indexed: boolean;
}
