/**
 * Cockpit API Route
 *
 * Handles the analysis pipeline for courtroom testimony.
 * Supports multiple embedding modes with graceful fallback.
 */

import {NextResponse} from 'next/server';
import type {
    CaseId,
    EmbeddingMode,
    PipelineTrace,
    PipelineTimings,
    FormattedHit,
    ObjectionType,
    CockpitResponse,
    SearchHit,
} from '@/types';
import {getEmbeddingWithFallback} from '@/lib/embedding-service';
import {searchQdrant} from '@/lib/qdrant';
import {generateBM25Sparse} from '@/lib/localEmbeddings';
import {getObjectionInfo, meetsObjectionThreshold} from '@/lib/objections';

// =============================================================================
// Types
// =============================================================================

interface RequestBody {
    text: string;
    caseId?: CaseId;
}

interface AnalysisResult {
    score: number;
    objection: ObjectionType | null;
    recommendation: string;
    script: string | null;
}

// =============================================================================
// Route Handler
// =============================================================================

/**
 * POST /api/cockpit
 *
 * Analyzes courtroom testimony and returns objection recommendations.
 *
 * Query params:
 * - mode: 'local' | 'jina' | 'qdrant' (default: 'qdrant')
 * - hybrid: 'true' | 'false' (default: 'false')
 *
 * Body:
 * - text: string - The testimony to analyze
 * - caseId: string - The case identifier (default: 'msft')
 */
export async function POST(req: Request): Promise<NextResponse<CockpitResponse>> {
    const {searchParams} = new URL(req.url);
    const mode = (searchParams.get('mode') || 'qdrant') as EmbeddingMode;
    const hybridMode = searchParams.get('hybrid') === 'true';

    const body: RequestBody = await req.json();
    const text = body.text || '';
    const caseId = body.caseId || 'msft';

    const start = Date.now();

    // Initialize trace and timings
    const trace = initializeTrace(text, caseId, hybridMode);
    const timings = initializeTimings();

    // --- 1. GATE / TRIGGER ---
    const isQuestion = text.trim().endsWith('?');
    updateTrigger(trace, text, isQuestion);

    // Skip processing if ignored
    if (trace.trigger.action === 'IGNORE') {
        return createIgnoredResponse(trace, timings, start);
    }

    // --- 2. PROCESS PIPELINE ---
    try {
        // Preprocess timing
        const preprocessStart = performance.now();
        timings.preprocess = Math.round(performance.now() - preprocessStart);

        // --- 3. EMBED ---
        const embedResult = await getEmbeddingWithFallback(text, mode);
        timings.embed_dense = embedResult.timing_ms;
        trace.dense = {
            model: embedResult.model,
            ms: embedResult.timing_ms,
            dim: embedResult.dimension,
        };

        // Sparse embedding for hybrid mode
        if (hybridMode) {
            const sparseResult = await generateBM25Sparse(text);
            timings.embed_sparse = sparseResult.timing_ms;
            trace.sparse = {model: 'bm25-qdrant', ms: sparseResult.timing_ms};
        }

        // --- 4. SEARCH ---
        const filter = {
            should: [
                {key: 'case_id', match: {value: caseId}},
                {key: 'case_id', match: {value: 'universal'}},
            ],
        };

        const searchResult = await searchQdrant(embedResult.embedding, 10, filter);
        timings.search = searchResult.timing_ms;
        trace.search = {
            dense_k: 10,
            sparse_k: 0,
            retrieved: searchResult.results.length,
            ms: searchResult.timing_ms,
        };

        // --- 5. ANALYZE RESULTS ---
        const fusionStart = performance.now();
        const analysis = analyzeResults(searchResult.results);
        timings.fusion = Math.round(performance.now() - fusionStart);

        trace.decision = analysis.objection ? 'ACTIONABLE' : 'NO_ACTION';
        trace.fusion = {method: 'Semantic + Rules', top_k: 5, ms: timings.fusion};

        // Calculate total timing
        timings.total = timings.preprocess + timings.embed_dense + timings.embed_sparse + timings.search + timings.fusion;
        trace.latency_e2e = timings.total;

        // Format hits for response
        const hits = formatHits(searchResult.results);

        return NextResponse.json({
            latency: Date.now() - start,
            score: analysis.score,
            objection: analysis.objection,
            recommendation: analysis.recommendation,
            script: analysis.script,
            hits,
            trace,
            timings,
        });
    } catch (error) {
        console.error('Search pipeline error:', error);
        trace.decision = 'ERROR';

        return NextResponse.json({
            latency: Date.now() - start,
            score: 0,
            objection: null,
            recommendation: 'Error in analysis pipeline',
            script: null,
            hits: [],
            trace,
            timings,
        });
    }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Initializes the pipeline trace.
 */
function initializeTrace(text: string, caseId: string, hybridMode: boolean): PipelineTrace {
    return {
        trigger: {label: 'Awaiting testimony...', action: 'PROCEED'},
        route: {plan: 'rules + case_memory', details: `case=${caseId}, phase=cross`},
        query: {text, filters: `case_id=${caseId}, phase=cross`},
        decision: 'ANALYZING...',
        dense: {model: 'jina-embeddings-v2-base-en', ms: 0, dim: 768},
        sparse: {model: hybridMode ? 'bm25' : '---', ms: 0},
        search: {dense_k: 10, sparse_k: 0, retrieved: 0},
        fusion: {method: hybridMode ? 'RRF' : 'Semantic', top_k: 5},
        latency_e2e: 0,
    };
}

/**
 * Initializes timing tracking.
 */
function initializeTimings(): PipelineTimings {
    return {
        preprocess: 0,
        embed_dense: 0,
        embed_sparse: 0,
        search: 0,
        fusion: 0,
        total: 0,
    };
}

/**
 * Updates trigger based on input analysis.
 */
function updateTrigger(trace: PipelineTrace, text: string, isQuestion: boolean): void {
    if (text.length < 15) {
        trace.trigger = {
            type: 'HOUSEKEEPING',
            label: 'Too short (housekeeping)',
            action: 'IGNORE',
        };
    } else {
        trace.trigger = {
            type: isQuestion ? 'CROSS_QUESTION' : 'TESTIMONY',
            label: isQuestion ? 'Cross-exam question' : 'New testimony',
            action: 'PROCEED',
        };
    }
}

/**
 * Creates response for ignored input.
 */
function createIgnoredResponse(
    trace: PipelineTrace,
    timings: PipelineTimings,
    start: number,
): NextResponse<CockpitResponse> {
    trace.decision = 'NO_ACTION';
    timings.total = Date.now() - start;
    trace.latency_e2e = timings.total;

    return NextResponse.json({
        latency: timings.total,
        score: 0,
        objection: null,
        recommendation: 'Monitoring',
        script: null,
        hits: [],
        trace,
        timings,
    });
}

/**
 * Analyzes search results for objection recommendations.
 */
function analyzeResults(results: SearchHit[]): AnalysisResult {
    // Find the best matching document with an objection type
    // Priority: RULE docs first, then any doc with objection_type
    let bestObjectionHit: SearchHit | null = null;
    let bestObjectionScore = 0;

    for (const hit of results) {
        const payload = hit.payload;

        // Skip documents without objection type
        if (!payload.objection_type) continue;

        // RULE documents get priority - always use if found
        if (payload.doc_type === 'RULE' && hit.score > bestObjectionScore) {
            bestObjectionHit = hit;
            bestObjectionScore = hit.score;
        }
        // For non-RULE docs, only use if we haven't found a RULE doc yet
        else if (
            !bestObjectionHit ||
            (bestObjectionHit.payload.doc_type !== 'RULE' && hit.score > bestObjectionScore)
        ) {
            bestObjectionHit = hit;
            bestObjectionScore = hit.score;
        }
    }

    // Determine if we should recommend an objection
    if (bestObjectionHit && meetsObjectionThreshold(bestObjectionScore)) {
        const objectionType = bestObjectionHit.payload.objection_type;
        if (objectionType) {
            const objInfo = getObjectionInfo(objectionType);

            return {
                score: Math.round(bestObjectionScore * 100),
                objection: objectionType,
                recommendation: objInfo.recommendation,
                script: objInfo.script,
            };
        }
    }

    // No strong objection match
    return {
        score: results.length > 0 ? Math.round(results[0].score * 40) : 0,
        objection: null,
        recommendation: 'No objection recommended. Testimony may proceed.',
        script: null,
    };
}

/**
 * Formats search hits for response.
 */
function formatHits(results: SearchHit[]): FormattedHit[] {
    return results.slice(0, 5).map((hit, i) => ({
        id: hit.id,
        score: hit.score,
        title: hit.payload.source || 'Unknown',
        snippet: hit.payload.text || '',
        fused_rank: i + 1,
        payload: {
            doc_type: hit.payload.doc_type || 'TRANSCRIPT',
            case_id: hit.payload.case_id || 'unknown',
            objection_type: hit.payload.objection_type,
        },
    }));
}
