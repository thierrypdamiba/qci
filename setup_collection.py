#!/usr/bin/env python3
"""
Setup script to create the Qdrant collection with sample legal documents
"""
import os
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv('.env.local')

QDRANT_URL = os.getenv('QDRANT_URL')
QDRANT_API_KEY = os.getenv('QDRANT_API_KEY')
JINA_API_KEY = os.getenv('JINA_API_KEY')
COLLECTION_NAME = os.getenv('QDRANT_COLLECTION', 'legal_memory')

# Sample legal documents
SAMPLE_DOCS = [
    {
        "id": 1,
        "text": "The defendant's strategy to eliminate Netscape as a competitor violated antitrust law.",
        "doc_type": "EVIDENCE",
        "case_id": "msft",
        "source": "GX-20 (Internal Memo)"
    },
    {
        "id": 2,
        "text": "The meeting was characterized as a 'visit from the Godfather' by internal communications.",
        "doc_type": "EVIDENCE",
        "case_id": "msft",
        "source": "GX-33 (Meeting Minutes)"
    },
    {
        "id": 3,
        "text": "Browser integration was intended as a feature, not a platform control mechanism.",
        "doc_type": "EVIDENCE",
        "case_id": "msft",
        "source": "GX-41 (Strategy Doc)"
    },
    {
        "id": 4,
        "text": "Mark-to-market accounting was fully disclosed and approved by Arthur Andersen.",
        "doc_type": "EVIDENCE",
        "case_id": "enron",
        "source": "SEC Filing 2000"
    },
    {
        "id": 5,
        "text": "Raptor hedging vehicles were presented as standard risk management tools.",
        "doc_type": "EVIDENCE",
        "case_id": "enron",
        "source": "EX-22 (Board Minutes)"
    },
    {
        "id": 6,
        "text": "Rule 802: Hearsay is not admissible unless it falls under an exception.",
        "doc_type": "RULE",
        "case_id": "general",
        "source": "Federal Rules of Evidence"
    },
    {
        "id": 7,
        "text": "The leather glove had shrunk due to moisture exposure during evidence collection.",
        "doc_type": "EVIDENCE",
        "case_id": "oj",
        "source": "Forensic Report (Dr. Lee)"
    },
    {
        "id": 8,
        "text": "Sample 42 was left in the van overnight, compromising chain of custody.",
        "doc_type": "EVIDENCE",
        "case_id": "oj",
        "source": "Lab Log (Sample 42)"
    },
    {
        "id": 9,
        "text": "Dr. Padian testified that 'abrupt appearance' in the fossil record is a geological term spanning millions of years.",
        "doc_type": "TRANSCRIPT",
        "case_id": "kitzmiller",
        "source": "Trial Transcript (Day 6)"
    },
    {
        "id": 10,
        "text": "Of Pandas and People is a creationist text with intelligent design terminology.",
        "doc_type": "EVIDENCE",
        "case_id": "kitzmiller",
        "source": "Expert Report (Forrest)"
    }
]


def get_embedding(text: str) -> list:
    """Get embedding from Jina API"""
    response = requests.post(
        'https://api.jina.ai/v1/embeddings',
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {JINA_API_KEY}'
        },
        json={
            'input': [text],
            'model': 'jina-embeddings-v2-base-en'
        }
    )
    response.raise_for_status()
    return response.json()['data'][0]['embedding']


def main():
    print(f"Connecting to Qdrant at {QDRANT_URL}")
    client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

    # Check if collection exists
    collections = client.get_collections().collections
    collection_exists = any(c.name == COLLECTION_NAME for c in collections)

    if collection_exists:
        print(f"Collection '{COLLECTION_NAME}' already exists. Deleting it...")
        client.delete_collection(COLLECTION_NAME)

    # Create collection
    print(f"Creating collection '{COLLECTION_NAME}'...")
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=768, distance=Distance.COSINE)
    )

    # Add documents
    print(f"Adding {len(SAMPLE_DOCS)} sample documents...")
    points = []

    for doc in SAMPLE_DOCS:
        print(f"  Embedding: {doc['text'][:50]}...")
        embedding = get_embedding(doc['text'])

        points.append(PointStruct(
            id=doc['id'],
            vector=embedding,
            payload={
                'text': doc['text'],
                'doc_type': doc['doc_type'],
                'case_id': doc['case_id'],
                'source': doc['source']
            }
        ))

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )

    print(f"\n✓ Setup complete!")
    print(f"  Collection: {COLLECTION_NAME}")
    print(f"  Documents: {len(SAMPLE_DOCS)}")
    print(f"  Vector size: 768")
    print(f"  Distance: Cosine")
    print(f"\nYou can now run the demo!")


if __name__ == "__main__":
    main()
