"""
FastEmbed API Server for Local Embeddings
Runs jinaai/jina-embeddings-v2-base-en locally using FastEmbed
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastembed import TextEmbedding
import time
from typing import List

app = FastAPI(title="FastEmbed Local Embedding Server")

# Enable CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the embedding model (lazy load on first request)
embedding_model = None

def get_model():
    global embedding_model
    if embedding_model is None:
        print("Loading FastEmbed model: jinaai/jina-embeddings-v2-base-en...")
        embedding_model = TextEmbedding(model_name="jinaai/jina-embeddings-v2-base-en")
        print("Model loaded successfully!")
    return embedding_model

class EmbedRequest(BaseModel):
    text: str
    model: str = "jinaai/jina-embeddings-v2-base-en"

class EmbedResponse(BaseModel):
    embedding: List[float]
    timingMs: int
    model: str
    dimension: int

@app.get("/")
def root():
    return {
        "service": "FastEmbed Local Embedding Server",
        "model": "jinaai/jina-embeddings-v2-base-en",
        "status": "ready"
    }

@app.post("/embed", response_model=EmbedResponse)
def embed_text(request: EmbedRequest):
    try:
        start_time = time.time()

        model = get_model()

        # Generate embedding
        embeddings = list(model.embed([request.text]))
        embedding = embeddings[0].tolist()

        end_time = time.time()
        timing_ms = int((end_time - start_time) * 1000)

        return EmbedResponse(
            embedding=embedding,
            timingMs=timing_ms,
            model=request.model,
            dimension=len(embedding)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("Starting FastEmbed server on http://localhost:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)
