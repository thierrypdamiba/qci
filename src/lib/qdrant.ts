import { QdrantClient } from '@qdrant/js-client-rest';

const QDRANT_URL = process.env.QDRANT_URL || '';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '';
const JINA_API_KEY = process.env.JINA_API_KEY || '';
const COLLECTION_NAME = process.env.QDRANT_COLLECTION || 'legal_memory';

let client: QdrantClient | null = null;

export function getQdrantClient(): QdrantClient {
  if (!client) {
    if (!QDRANT_URL || !QDRANT_API_KEY) {
      throw new Error('Qdrant credentials not configured. Please set QDRANT_URL and QDRANT_API_KEY in .env.local');
    }

    client = new QdrantClient({
      url: QDRANT_URL,
      apiKey: QDRANT_API_KEY,
    });
  }
  return client;
}

export interface EmbedWithTimingResult {
  embedding: number[];
  timingMs: number;
  model: string;
  dimension: number;
}

export async function embedWithQdrantCloudInference(
  text: string,
  model: string = 'jina-embeddings-v2-base-en'
): Promise<EmbedWithTimingResult> {
  if (!JINA_API_KEY) {
    throw new Error('Jina API key not configured. Please set JINA_API_KEY in .env.local');
  }

  const startTime = performance.now();

  const response = await fetch('https://api.jina.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JINA_API_KEY}`,
    },
    body: JSON.stringify({
      input: [text],
      model: model,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Jina API error response:', errorBody);
    throw new Error(`Jina API error: ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  const endTime = performance.now();

  return {
    embedding: data.data[0].embedding,
    timingMs: Math.round(endTime - startTime),
    model: model,
    dimension: data.data[0].embedding.length,
  };
}

export async function searchQdrant(
  embedding: number[],
  limit: number = 30,
  filter?: any
): Promise<{ results: any[]; timingMs: number }> {
  const client = getQdrantClient();
  const startTime = performance.now();

  const searchResult = await client.search(COLLECTION_NAME, {
    vector: embedding,
    limit,
    with_payload: true,
    filter,
  });

  const endTime = performance.now();

  return {
    results: searchResult,
    timingMs: Math.round(endTime - startTime),
  };
}

export { COLLECTION_NAME, JINA_API_KEY };
