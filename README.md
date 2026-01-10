# Qdrant Cloud Inference Demo

An interactive demonstration comparing **Qdrant Cloud Inference** with traditional embedding approaches for a legal AI co-counsel system.

## Overview

This demo simulates a real-time legal assistant that analyzes courtroom testimony and provides instant objections based on legal precedent. It compares three different embedding execution environments using the **same model** (`sentence-transformers/all-MiniLM-L6-v2`):

1. **Local (FastEmbed)** - Embeddings generated locally via Python FastEmbed server
2. **External API (HuggingFace)** - Embeddings via HuggingFace Inference API
3. **Qdrant Cloud Inference (QCI)** - Embeddings generated in-cluster for minimal latency

## Key Features

- **Real-time comparison** of embedding latencies across three execution environments
- **Fair benchmarking** - same model across all modes
- **Interactive courtroom simulations** - Microsoft, Enron, and Kitzmiller trials
- **Live metrics** - See embedding time, search time, and total E2E latency

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.8+
- Qdrant Cloud account ([sign up free](https://cloud.qdrant.io))
- HuggingFace API key (optional, helps with rate limits)

### Setup

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**

Copy `.env.example` to `.env.local` and add your credentials:

```bash
QDRANT_URL=https://your-cluster.qdrant.io:6333
QDRANT_API_KEY=your-qdrant-api-key
HF_API_KEY=your-huggingface-api-key
QDRANT_COLLECTION=legal_memory
FASTEMBED_URL=http://localhost:8001
```

3. **Start the FastEmbed server** (in a separate terminal)

```bash
./start_fastembed.sh
```

*Note: First run will download the model (~500MB)*

4. **Start the web app**

```bash
npm run dev
```

5. **Open the demo**

Navigate to [http://localhost:3000](http://localhost:3000)

## How It Works

### Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   LOCAL     │     │  EXTERNAL    │     │   QDRANT    │
│  FastEmbed  │     │  API (HF)    │     │  CLOUD INF  │
│  (Server)   │     │              │     │ (In-Cluster)│
└──────┬──────┘     └──────┬───────┘     └──────┬──────┘
       │                   │                    │
       └───────────────────┼────────────────────┘
                           │
                    ┌──────▼───────┐
                    │    Qdrant    │
                    │   Database   │
                    └──────────────┘
```

- **Local**: Embedding happens on your machine (Python process), then search in Qdrant
- **External API**: Embedding via HuggingFace API (network call), then search in Qdrant
- **QCI**: Embedding **inside** Qdrant cluster (zero network hops)

### Performance Comparison

Qdrant Cloud Inference eliminates network latency by running embeddings in-cluster:

- **Local**: CPU-bound, ~200-300ms embedding time
- **External API**: API call overhead, ~50-100ms embedding time
- **QCI**: Optimized in-cluster, ~8-20ms embedding time

## Features

### Multiple Trials

Choose from 4 famous court cases:
- US v. Microsoft (antitrust)
- US v. Skilling (Enron)
- People v. Simpson (O.J.)
- Kitzmiller v. Dover (intelligent design)

### Exclusive Mode Selection

Cannot compare the same mode against itself - modes are automatically switched to ensure meaningful comparisons.

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main UI and demo logic
│   │   └── api/
│   │       └── cockpit/
│   │           └── route.ts       # API handler for all three modes
│   └── lib/
│       ├── localEmbeddings.ts    # FastEmbed client
│       └── qdrant.ts             # Qdrant client + Jina API
├── fastembed_server.py           # Local embedding server
├── start_fastembed.sh            # FastEmbed startup script
└── requirements.txt              # Python dependencies
```

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

**FastEmbed server not running**

```bash
./start_fastembed.sh
```

**Jina API errors**

- Verify `JINA_API_KEY` in `.env.local`
- Check API usage limits

**Qdrant connection errors**

- Verify `QDRANT_URL` and `QDRANT_API_KEY`
- Ensure collection `legal_memory` exists

## License

MIT

## Built With

- [Next.js 16](https://nextjs.org/) - React framework
- [Qdrant](https://qdrant.tech/) - Vector database
- [FastEmbed](https://github.com/qdrant/fastembed) - Local embeddings
- [Jina AI](https://jina.ai/) - Embedding API
- [Tailwind CSS](https://tailwindcss.com/) - Styling
