/**
 * Scale Test Seed Script
 * Tests Qdrant performance at various collection sizes: 1k, 5k, 10k, 25k vectors
 * Preserves original 35 demo documents for demo functionality
 */

const { QdrantClient } = require('@qdrant/js-client-rest');
const fs = require('fs');

// Read env file
const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && !key.startsWith('#')) env[key.trim()] = val.join('=').trim();
});

const JINA_API_KEY = env.JINA_API_KEY;
const COLLECTION_NAME = 'legal_memory';

const client = new QdrantClient({
  url: env.QDRANT_URL,
  apiKey: env.QDRANT_API_KEY,
});

// Configuration
const TARGET_SIZE = parseInt(process.argv[2]) || 5000; // Default 5k, can pass as arg
const BATCH_SIZE = 50; // Jina batch size (max is ~100)
const PRESERVE_DEMO_DOCS = true;

// Legal document templates - more variety for realistic distribution
const CASES = ['msft', 'enron', 'kitzmiller'];

const TEMPLATES = {
  msft: {
    phrases: [
      'browser market dominance', 'operating system monopoly', 'OEM licensing restrictions',
      'Internet Explorer integration', 'Netscape market share', 'Windows bundling strategy',
      'application barrier to entry', 'middleware threat', 'platform control strategy',
      'per-processor licensing', 'boot sequence control', 'API documentation access',
      'Java runtime restriction', 'browser choice screen', 'cross-platform compatibility'
    ],
    witnesses: ['Bill Gates', 'Jim Allchin', 'Paul Maritz', 'Steve Ballmer', 'Brad Chase', 'John Soyring', 'Cameron Myhrvold'],
    exhibits: ['Gates memo', 'Strategy document', 'OEM contract', 'Internal email', 'Board presentation', 'Market analysis'],
  },
  enron: {
    phrases: [
      'mark-to-market accounting', 'special purpose entity structure', 'Raptor hedge transactions',
      'California energy trading', 'off-balance sheet debt', 'related party disclosure',
      'Arthur Andersen audit', 'stock compensation timing', 'LJM partnership conflicts',
      'Chewco transaction', 'merchant investment gains', 'trading floor recordings',
      'wholesale power contracts', 'capacity reservation fees', 'broadband bandwidth trading'
    ],
    witnesses: ['Jeffrey Skilling', 'Andrew Fastow', 'Ken Lay', 'Richard Causey', 'Ben Glisan', 'Sherron Watkins', 'Cliff Baxter'],
    exhibits: ['Raptor documents', 'Trading logs', 'Audit working papers', 'Board minutes', 'SEC filings', 'Email chain'],
  },
  kitzmiller: {
    phrases: [
      'intelligent design curriculum', 'evolution theory teaching', 'Of Pandas and People textbook',
      'bacterial flagellum complexity', 'irreducible complexity claim', 'establishment clause violation',
      'scientific peer review', 'creation science history', 'school board religious purpose',
      'Dover school policy', 'disclaimer requirement', 'alternative theory presentation',
      'scientific methodology', 'supernatural explanation', 'academic freedom argument'
    ],
    witnesses: ['Michael Behe', 'Kevin Padian', 'Barbara Forrest', 'Kenneth Miller', 'Alan Bonsell', 'William Buckingham', 'Scott Minnich'],
    exhibits: ['Pandas manuscript', 'Board meeting minutes', 'Curriculum standards', 'Expert report', 'Textbook analysis', 'Policy statement'],
  }
};

const DOC_TYPES = ['TRANSCRIPT', 'EVIDENCE', 'DEPOSITION', 'MOTION', 'BRIEF', 'RULING', 'MEMO', 'EMAIL'];
const OBJECTIONS = ['HEARSAY', 'LACK OF FOUNDATION', 'ARGUMENTATIVE', 'SPECULATION', 'ASSUMES FACTS', 'MISCHARACTERIZATION', 'VAGUE', 'LEADING', 'PREJUDICIAL', null, null, null];

// Generate realistic document text
function generateDoc(id) {
  const caseId = CASES[id % CASES.length];
  const t = TEMPLATES[caseId];
  const docType = DOC_TYPES[Math.floor(Math.random() * DOC_TYPES.length)];
  const phrase1 = t.phrases[Math.floor(Math.random() * t.phrases.length)];
  const phrase2 = t.phrases[Math.floor(Math.random() * t.phrases.length)];
  const witness = t.witnesses[Math.floor(Math.random() * t.witnesses.length)];
  const exhibit = t.exhibits[Math.floor(Math.random() * t.exhibits.length)];
  const objection = OBJECTIONS[Math.floor(Math.random() * OBJECTIONS.length)];

  const templates = [
    `Regarding ${phrase1}: ${witness} testified that the ${phrase2} was handled according to standard procedures and legal requirements.`,
    `Internal ${exhibit} dated ${2000 + (id % 10)}: Discussion of ${phrase1} indicates awareness of ${phrase2} implications at executive level.`,
    `Q: Did you have knowledge of ${phrase1}? A: I was generally aware of discussions about ${phrase2} but not specific operational details.`,
    `The court finds that testimony regarding ${phrase1} is admissible. The ${phrase2} evidence meets the threshold for relevance.`,
    `Motion to exclude evidence of ${phrase1}: The ${phrase2} claims are unduly prejudicial and lack proper foundation.`,
    `${witness} deposition: When asked about ${phrase1}, witness stated they could not recall specific conversations about ${phrase2}.`,
    `${exhibit} analysis shows correlation between ${phrase1} strategy and market effects on ${phrase2} competitors.`,
    `Defense brief argues ${phrase1} was lawful competition. Evidence of ${phrase2} does not establish required elements.`,
    `Email from ${witness}: "We need to address ${phrase1} concerns before the quarterly review. The ${phrase2} situation requires attention."`,
    `Board minutes: ${witness} presented analysis of ${phrase1}. Discussion focused on ${phrase2} implications for shareholders.`
  ];

  const text = templates[Math.floor(Math.random() * templates.length)];
  const source = `${docType}-${caseId.toUpperCase()}-${String(id).padStart(5, '0')}`;

  return {
    text,
    doc_type: docType,
    case_id: caseId,
    source,
    objection_type: objection,
    keywords: `${phrase1} ${phrase2} ${witness}`.toLowerCase()
  };
}

// Batch embed with Jina
async function embedBatch(texts, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://api.jina.ai/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JINA_API_KEY}`,
        },
        body: JSON.stringify({
          input: texts,
          model: 'jina-embeddings-v2-base-en',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        if (response.status === 429) {
          console.log(`  Rate limited, waiting 5s... (attempt ${attempt})`);
          await new Promise(r => setTimeout(r, 5000));
          continue;
        }
        throw new Error(`Jina API error ${response.status}: ${error}`);
      }

      const data = await response.json();
      return data.data.map(d => d.embedding);
    } catch (e) {
      if (attempt === retries) throw e;
      console.log(`  Retrying... (${e.message})`);
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

// Run benchmark search
async function benchmark(label) {
  const queries = [
    { text: 'Did you have a strategy to eliminate competitors?', case: 'msft' },
    { text: 'How did the Raptor structures work?', case: 'enron' },
    { text: 'Is intelligent design science?', case: 'kitzmiller' }
  ];

  console.log(`\n--- Benchmark: ${label} ---`);

  for (const q of queries) {
    const embedStart = Date.now();
    const [embedding] = await embedBatch([q.text]);
    const embedTime = Date.now() - embedStart;

    const searchStart = Date.now();
    const results = await client.search(COLLECTION_NAME, {
      vector: embedding,
      limit: 10,
      filter: {
        should: [
          { key: 'case_id', match: { value: q.case } },
          { key: 'case_id', match: { value: 'universal' } }
        ]
      },
      with_payload: true
    });
    const searchTime = Date.now() - searchStart;

    console.log(`  ${q.case}: embed=${embedTime}ms, search=${searchTime}ms, top_score=${results[0]?.score.toFixed(3) || 'N/A'}`);
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log(`SCALE TEST: Target ${TARGET_SIZE.toLocaleString()} vectors`);
  console.log('='.repeat(60));

  // Check current state
  let currentCount = 0;
  try {
    const info = await client.getCollection(COLLECTION_NAME);
    currentCount = info.points_count;
    console.log(`\nCurrent collection: ${currentCount} points`);
    console.log(`Status: ${info.status}, Indexed: ${info.indexed_vectors_count}`);
  } catch (e) {
    console.log('Collection does not exist, will create');
  }

  // Baseline benchmark
  if (currentCount > 0) {
    await benchmark(`Baseline (${currentCount} points)`);
  }

  // Calculate how many to add
  const toAdd = Math.max(0, TARGET_SIZE - currentCount);
  if (toAdd === 0) {
    console.log('\nTarget already reached!');
    return;
  }

  console.log(`\nAdding ${toAdd.toLocaleString()} documents in batches of ${BATCH_SIZE}...`);
  const startId = currentCount + 1000; // Start after demo docs

  const stats = {
    batches: 0,
    embedMs: [],
    upsertMs: [],
    errors: 0
  };

  const totalBatches = Math.ceil(toAdd / BATCH_SIZE);
  const checkpoints = [1000, 5000, 10000, 25000].filter(n => n > currentCount && n <= TARGET_SIZE);

  for (let i = 0; i < toAdd; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const batch = [];

    for (let j = 0; j < BATCH_SIZE && (i + j) < toAdd; j++) {
      batch.push(generateDoc(startId + i + j));
    }

    process.stdout.write(`\r  Batch ${batchNum}/${totalBatches} (${(currentCount + i + batch.length).toLocaleString()} total)...`);

    try {
      const embedStart = Date.now();
      const embeddings = await embedBatch(batch.map(d => d.text));
      stats.embedMs.push(Date.now() - embedStart);

      const points = batch.map((doc, idx) => ({
        id: startId + i + idx,
        vector: embeddings[idx],
        payload: doc
      }));

      const upsertStart = Date.now();
      await client.upsert(COLLECTION_NAME, { wait: true, points });
      stats.upsertMs.push(Date.now() - upsertStart);
      stats.batches++;

      // Checkpoint benchmark
      const newTotal = currentCount + i + batch.length;
      if (checkpoints.includes(newTotal)) {
        console.log('');
        await benchmark(`${newTotal.toLocaleString()} points`);
      }

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 50));
    } catch (e) {
      stats.errors++;
      console.log(`\n  Error: ${e.message}`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Final stats
  const finalInfo = await client.getCollection(COLLECTION_NAME);
  console.log('\n\n' + '='.repeat(60));
  console.log('COMPLETE');
  console.log('='.repeat(60));
  console.log(`Final collection size: ${finalInfo.points_count.toLocaleString()} points`);
  console.log(`Indexed vectors: ${finalInfo.indexed_vectors_count.toLocaleString()}`);
  console.log(`Batches processed: ${stats.batches}, Errors: ${stats.errors}`);
  console.log(`Avg embed time: ${Math.round(stats.embedMs.reduce((a,b) => a+b, 0) / stats.embedMs.length)}ms`);
  console.log(`Avg upsert time: ${Math.round(stats.upsertMs.reduce((a,b) => a+b, 0) / stats.upsertMs.length)}ms`);

  // Final benchmark
  await benchmark(`Final (${finalInfo.points_count.toLocaleString()} points)`);
}

main().catch(e => {
  console.error('\nFatal error:', e.message);
  process.exit(1);
});
