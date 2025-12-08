/**
 * QCI Demo Custom Error Classes
 *
 * Following Qdrant SDK error handling patterns with proper prototype chains.
 */

/**
 * Base error class for QCI Demo application.
 * Ensures proper prototype chain for instanceof checks.
 */
export class QCIError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/**
 * Error during embedding generation.
 */
export class EmbeddingError extends QCIError {
    public readonly mode: string;
    public readonly statusCode?: number;

    constructor(message: string, mode: string, statusCode?: number) {
        super(message);
        this.mode = mode;
        this.statusCode = statusCode;
    }

    static forJinaApiError(statusCode: number, body: string): EmbeddingError {
        return new EmbeddingError(
            `Jina API error (${statusCode}): ${body}`,
            'jina',
            statusCode,
        );
    }

    static forLocalServerError(message: string): EmbeddingError {
        return new EmbeddingError(
            `Local embedding server error: ${message}`,
            'local',
        );
    }

    static forQdrantInferenceError(message: string): EmbeddingError {
        return new EmbeddingError(
            `Qdrant Cloud Inference error: ${message}`,
            'qdrant',
        );
    }
}

/**
 * Error during vector search.
 */
export class SearchError extends QCIError {
    public readonly collection?: string;

    constructor(message: string, collection?: string) {
        super(message);
        this.collection = collection;
    }

    static forCollectionNotFound(collection: string): SearchError {
        return new SearchError(
            `Collection '${collection}' not found`,
            collection,
        );
    }

    static forConnectionError(url: string): SearchError {
        return new SearchError(
            `Failed to connect to Qdrant at ${url}`,
        );
    }
}

/**
 * Error in application configuration.
 */
export class ConfigurationError extends QCIError {
    public readonly missingKey?: string;

    constructor(message: string, missingKey?: string) {
        super(message);
        this.missingKey = missingKey;
    }

    static forMissingEnvVar(key: string): ConfigurationError {
        return new ConfigurationError(
            `Missing required environment variable: ${key}. Please add it to .env.local`,
            key,
        );
    }

    static forInvalidUrl(key: string, value: string): ConfigurationError {
        return new ConfigurationError(
            `Invalid URL for ${key}: ${value}`,
            key,
        );
    }
}

/**
 * Error when a service is unavailable.
 */
export class ServiceUnavailableError extends QCIError {
    public readonly serviceName: string;
    public readonly willSimulate: boolean;

    constructor(serviceName: string, willSimulate: boolean = false) {
        const message = willSimulate
            ? `${serviceName} unavailable, using simulated response`
            : `${serviceName} is unavailable`;
        super(message);
        this.serviceName = serviceName;
        this.willSimulate = willSimulate;
    }
}

/**
 * Error during pipeline execution.
 */
export class PipelineError extends QCIError {
    public readonly stage: string;
    public readonly cause?: Error;

    constructor(message: string, stage: string, cause?: Error) {
        super(message);
        this.stage = stage;
        this.cause = cause;
    }

    static forEmbeddingStage(cause: Error): PipelineError {
        return new PipelineError(
            `Pipeline failed at embedding stage: ${cause.message}`,
            'embedding',
            cause,
        );
    }

    static forSearchStage(cause: Error): PipelineError {
        return new PipelineError(
            `Pipeline failed at search stage: ${cause.message}`,
            'search',
            cause,
        );
    }

    static forFusionStage(cause: Error): PipelineError {
        return new PipelineError(
            `Pipeline failed at fusion stage: ${cause.message}`,
            'fusion',
            cause,
        );
    }
}
