# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QCI (Qdrant Cloud Inference) Demo - A Next.js 16 application demonstrating real-time embedding performance comparisons for a legal AI co-counsel system. The app analyzes courtroom testimony and suggests objections based on legal precedent stored in Qdrant.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
npm start        # Start production server
```

### Seeding the database

```bash
node scripts/seed-legal-data.js      # Seed legal documents for demo cases
node scripts/seed-scale-test.js      # Seed large collection for scale testing
```

## Architecture

### Embedding Modes

The app compares three embedding execution environments using the same model (`sentence-transformers/all-MiniLM-L6-v2`, 384 dims):

1. **Local (FastEmbed)** - Python server at `FASTEMBED_URL` (default: localhost:8001)
2. **External API (HuggingFace)** - API call to HuggingFace Inference API
3. **QCI (Qdrant Cloud Inference)** - In-cluster embedding, zero network hops

### Key Directories

```
src/
├── app/                  # Next.js App Router pages
│   ├── api/             # API routes
│   │   ├── cockpit/     # Main analysis pipeline
│   │   ├── benchmark/   # Performance benchmarking
│   │   └── race/        # Latency comparison
│   ├── page.tsx         # Main Co-Counsel demo
│   ├── compare/         # Why QCI comparison page
│   ├── benchmark/       # Benchmark visualization
│   └── race/            # Drag race demo
├── components/          # React components
│   └── demo/            # Demo-specific components
├── data/                # Static data (cases, tour steps)
├── hooks/               # Custom React hooks
├── lib/                 # Core libraries
│   ├── qdrant.ts        # Qdrant client & search functions
│   ├── localEmbeddings.ts # FastEmbed client
│   ├── embedding-service.ts # Unified embedding service
│   ├── errors.ts        # Custom error classes
│   ├── config.ts        # Configuration management
│   └── objections.ts    # Legal objection mappings
└── types/               # TypeScript type definitions
    └── index.ts         # All shared types
```

### Data Flow

```
User Input → /api/cockpit?mode={local|jina|qdrant}
           → getEmbeddingWithFallback(text, mode)
           → searchQdrant(embedding, filter)
           → analyzeResults() for objection patterns
           → Return trace + hits + recommendation
```

### Graceful Fallback

All embedding services implement graceful fallback:
- Real service is tried first
- If unavailable, simulated response is returned
- `simulated: boolean` flag indicates fallback was used

## Type System

All types are defined in `src/types/index.ts`:

- `EmbeddingMode` - 'local' | 'jina' | 'qdrant'
- `CaseId` - 'msft' | 'enron' | 'kitzmiller'
- `ObjectionType` - Legal objection types
- `EmbeddingResult` - Embedding with timing
- `PipelineTrace` - Full trace for debugging
- `LaneState` - UI state for comparison lanes
- `CockpitResponse` - API response type

## Error Handling

Custom error classes in `src/lib/errors.ts`:
- `QCIError` - Base error class
- `EmbeddingError` - Embedding generation failures
- `SearchError` - Vector search failures
- `ConfigurationError` - Missing environment variables
- `ServiceUnavailableError` - Service not available

## Environment Variables

Required in `.env.local`:
```
QDRANT_URL=         # Qdrant Cloud cluster URL
QDRANT_API_KEY=     # Qdrant API key
HF_API_KEY=         # HuggingFace API key (optional, helps with rate limits)
```

Optional:
```
QDRANT_COLLECTION=legal_memory   # Collection name
FASTEMBED_URL=http://localhost:8001  # Local embedding server
```

## Coding Conventions

Following Qdrant SDK patterns:
- **4-space indentation**
- **Single quotes** for strings
- **120 character line width**
- **No spaces in object brackets**: `{foo: bar}`
- **Trailing commas** everywhere
- **JSDoc** on public functions
- **Custom error classes** with factory methods
- **Explicit TypeScript interfaces** for all data

## Case Data

Three demo cases with legal documents:
- `msft` - Microsoft antitrust (US v. Microsoft)
- `enron` - Skilling fraud (US v. Skilling)
- `kitzmiller` - Intelligent design (Kitzmiller v. Dover)

Universal rules apply to all cases.

## Qdrant Collection Schema

Collection `legal_memory` with 384-dim vectors (Cosine distance) using all-MiniLM-L6-v2. Payload fields:
- `text` - Document content
- `doc_type` - RULE, EVIDENCE, or TRANSCRIPT
- `case_id` - Case identifier or "universal"
- `source` - Document source reference
- `objection_type` - Type of legal objection (nullable)

Indexed fields: `case_id`, `doc_type`, `objection_type`

## Local Development with Docker

```bash
docker-compose up -d     # Start Qdrant + FastEmbed
docker-compose down      # Stop services
```

Services:
- Qdrant: http://localhost:6333
- FastEmbed: http://localhost:8001
