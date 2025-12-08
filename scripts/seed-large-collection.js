/**
 * Large Scale Seed Script
 * Generates 500+ legal documents to test search performance at scale
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

// Templates for generating synthetic legal documents
const CASE_IDS = ['msft', 'enron', 'kitzmiller', 'universal'];

const OBJECTION_TYPES = [
  'HEARSAY', 'LACK OF FOUNDATION', 'ARGUMENTATIVE', 'SPECULATION',
  'ASSUMES FACTS', 'MISCHARACTERIZATION', 'VAGUE', 'IMPROPER OPINION',
  'PREJUDICIAL', 'LEADING'
];

const DOC_TYPES = ['RULE', 'EVIDENCE', 'TRANSCRIPT', 'MOTION', 'BRIEF', 'DEPOSITION'];

// Legal phrase templates for generating realistic documents
const LEGAL_TEMPLATES = {
  msft: {
    subjects: ['browser market', 'operating system', 'OEM contracts', 'Internet Explorer', 'Netscape', 'Windows integration', 'market share', 'bundling strategy', 'competitive practices', 'application barrier'],
    actions: ['monopolized', 'leveraged', 'integrated', 'bundled', 'restricted', 'excluded', 'tied', 'conditioned', 'foreclosed', 'dominated'],
    context: ['antitrust violation', 'market power', 'barriers to entry', 'network effects', 'platform control', 'exclusionary conduct', 'tying arrangement', 'predatory pricing']
  },
  enron: {
    subjects: ['mark-to-market accounting', 'special purpose entities', 'Raptor structures', 'trading profits', 'off-balance-sheet debt', 'California energy', 'financial statements', 'audit opinions', 'stock price', 'insider trading'],
    actions: ['concealed', 'manipulated', 'inflated', 'misrepresented', 'structured', 'deferred', 'accelerated', 'hedged', 'disclosed', 'certified'],
    context: ['securities fraud', 'accounting fraud', 'GAAP compliance', 'fiduciary duty', 'material misstatement', 'investor deception', 'wire fraud', 'obstruction']
  },
  kitzmiller: {
    subjects: ['intelligent design', 'evolution', 'curriculum standards', 'Of Pandas and People', 'bacterial flagellum', 'irreducible complexity', 'scientific theory', 'religious belief', 'establishment clause', 'school board'],
    actions: ['promoted', 'endorsed', 'taught', 'required', 'established', 'advocated', 'presented', 'distinguished', 'defined', 'characterized'],
    context: ['First Amendment', 'separation of church and state', 'scientific method', 'peer review', 'creationism', 'religious purpose', 'secular purpose', 'endorsement test']
  }
};

const WITNESS_NAMES = {
  msft: ['Bill Gates', 'Jim Allchin', 'Paul Maritz', 'Steve Ballmer', 'David Cole', 'Brad Chase', 'John Soyring'],
  enron: ['Jeffrey Skilling', 'Andrew Fastow', 'Ken Lay', 'Richard Causey', 'Ben Glisan', 'Michael Kopper', 'Sherron Watkins'],
  kitzmiller: ['Michael Behe', 'Kevin Padian', 'Barbara Forrest', 'Kenneth Miller', 'Alan Bonsell', 'William Buckingham', 'John Haught']
};

// Generate a synthetic document
function generateDocument(id, caseId) {
  const template = LEGAL_TEMPLATES[caseId] || LEGAL_TEMPLATES.msft;
  const witnesses = WITNESS_NAMES[caseId] || WITNESS_NAMES.msft;

  const docType = DOC_TYPES[Math.floor(Math.random() * DOC_TYPES.length)];
  const subject = template.subjects[Math.floor(Math.random() * template.subjects.length)];
  const action = template.actions[Math.floor(Math.random() * template.actions.length)];
  const context = template.context[Math.floor(Math.random() * template.context.length)];
  const witness = witnesses[Math.floor(Math.random() * witnesses.length)];

  let text, source, objectionType = null;

  switch (docType) {
    case 'TRANSCRIPT':
      const transcriptTemplates = [
        `Q: Did you have knowledge of the ${subject}? A: I was aware of general discussions but not specific details about ${context}.`,
        `${witness} testified: "The ${subject} was handled according to standard industry practices. We ${action} nothing improperly."`,
        `Cross-examination of ${witness}: "Isn't it true that you personally ${action} the ${subject}?" A: "I don't recall specific conversations about that."`,
        `Q: What was your role regarding ${subject}? A: I provided guidance but operational decisions were made by others in the organization.`,
        `${witness}: "At no time did I intend to ${action} anything related to ${subject}. Our actions were consistent with ${context} principles."`,
        `Direct examination: Q: Describe your understanding of ${subject}. A: It was a complex matter involving multiple stakeholders and ${context}.`
      ];
      text = transcriptTemplates[Math.floor(Math.random() * transcriptTemplates.length)];
      source = `Trial Transcript Day ${Math.floor(Math.random() * 50) + 1}`;
      break;

    case 'EVIDENCE':
      const evidenceTemplates = [
        `Internal memo regarding ${subject}: "We need to address the ${context} concerns before proceeding. The current approach may ${action} our market position."`,
        `Email from ${witness} discussing ${subject}: "The strategy to ${action} the ${subject} is proceeding as planned. Quarterly results will reflect these changes."`,
        `Board presentation on ${subject}: Analysis shows that current practices related to ${context} require immediate attention.`,
        `Financial analysis of ${subject}: Projected impact on ${context} indicates potential exposure of $${Math.floor(Math.random() * 500) + 50} million.`,
        `Document showing ${witness}'s involvement in ${subject}: "Please ensure all communications about ${context} go through proper channels."`,
        `Strategic planning document: "To ${action} effectively in the ${subject} area, we must consider ${context} implications."`
      ];
      text = evidenceTemplates[Math.floor(Math.random() * evidenceTemplates.length)];
      source = `GX-${Math.floor(Math.random() * 500) + 100}`;
      break;

    case 'DEPOSITION':
      const depositionTemplates = [
        `${witness} deposition: Q: Were you aware of efforts to ${action} the ${subject}? A: I may have heard discussions but I cannot recall specifics.`,
        `Q: Did anyone discuss ${context} concerns with you? A: There were general conversations about compliance but nothing alarming.`,
        `${witness}: "I believed our handling of ${subject} was appropriate given the ${context} at the time."`,
        `Q: Looking at this document about ${subject}, does this refresh your recollection? A: I don't specifically recall this document.`
      ];
      text = depositionTemplates[Math.floor(Math.random() * depositionTemplates.length)];
      source = `${witness} Deposition`;
      objectionType = Math.random() > 0.7 ? OBJECTION_TYPES[Math.floor(Math.random() * OBJECTION_TYPES.length)] : null;
      break;

    case 'MOTION':
      const motionTemplates = [
        `Motion to exclude testimony regarding ${subject}: The witness lacks personal knowledge of ${context} and cannot testify to matters outside their direct observation.`,
        `Motion in limine: Evidence of ${subject} should be excluded as unduly prejudicial. The ${context} claims are inflammatory and lack foundation.`,
        `Defense motion regarding ${subject}: Questions about ${context} assume facts not in evidence and improperly characterize prior testimony.`,
        `Motion to strike: Witness testimony that defendants ${action} the ${subject} is speculation without proper foundation.`
      ];
      text = motionTemplates[Math.floor(Math.random() * motionTemplates.length)];
      source = `Motion #${Math.floor(Math.random() * 200) + 1}`;
      objectionType = OBJECTION_TYPES[Math.floor(Math.random() * OBJECTION_TYPES.length)];
      break;

    case 'BRIEF':
      const briefTemplates = [
        `Plaintiff's brief on ${subject}: The evidence demonstrates that defendant ${action} the ${subject} in violation of ${context} principles.`,
        `Defense brief: Allegations regarding ${subject} fail to establish the required elements of ${context}. The conduct was lawful competition.`,
        `Reply brief: Defendant's characterization of ${subject} ignores documentary evidence showing clear intent to ${action} market position.`,
        `Amicus brief on ${subject}: The court should consider how ruling on ${context} will affect industry-wide practices.`
      ];
      text = briefTemplates[Math.floor(Math.random() * briefTemplates.length)];
      source = `Legal Brief - ${subject.substring(0, 20)}`;
      break;

    default: // RULE
      const ruleTemplates = [
        `Regarding ${subject}: When testimony relates to ${context}, proper foundation must be established before the witness may testify.`,
        `Objection regarding ${subject}: Counsel's question assumes ${context} facts not established by prior testimony or exhibits.`,
        `Ruling on ${subject} evidence: The court finds the testimony regarding ${context} to be properly before the jury.`,
        `Standard for ${context}: Questions that call for speculation about ${subject} are improper and subject to objection.`
      ];
      text = ruleTemplates[Math.floor(Math.random() * ruleTemplates.length)];
      source = `Court Ruling - ${caseId.toUpperCase()}`;
      objectionType = OBJECTION_TYPES[Math.floor(Math.random() * OBJECTION_TYPES.length)];
  }

  return {
    text,
    doc_type: docType,
    case_id: caseId,
    source,
    objection_type: objectionType,
    keywords: `${subject} ${action} ${context}`.toLowerCase()
  };
}

async function embedBatch(texts) {
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
    throw new Error(`Jina API error: ${error}`);
  }

  const data = await response.json();
  return data.data.map(d => d.embedding);
}

async function seed() {
  const TARGET_DOCS = 500;
  const BATCH_SIZE = 20; // Jina supports batch embedding

  console.log(`\n${'='.repeat(60)}`);
  console.log('LARGE SCALE SEED: Generating', TARGET_DOCS, 'documents');
  console.log('='.repeat(60));

  // First, read existing documents from original seed script
  const originalDocs = require('./seed-legal-data.js');

  // Generate synthetic documents
  console.log('\nGenerating synthetic legal documents...');
  const allDocs = [];

  // Distribute across cases: 40% msft, 30% enron, 30% kitzmiller
  const caseDistribution = [
    ...Array(Math.floor(TARGET_DOCS * 0.4)).fill('msft'),
    ...Array(Math.floor(TARGET_DOCS * 0.3)).fill('enron'),
    ...Array(Math.floor(TARGET_DOCS * 0.3)).fill('kitzmiller'),
  ];

  for (let i = 0; i < TARGET_DOCS; i++) {
    const caseId = caseDistribution[i] || 'msft';
    allDocs.push(generateDocument(i + 100, caseId));
  }

  console.log(`Generated ${allDocs.length} documents`);

  // Check/recreate collection
  try {
    const info = await client.getCollection(COLLECTION_NAME);
    console.log(`\nExisting collection has ${info.points_count} points`);
    console.log('Adding new documents to existing collection...');
  } catch (e) {
    console.log('Creating new collection...');
    await client.createCollection(COLLECTION_NAME, {
      vectors: { size: 768, distance: 'Cosine' },
    });
    await client.createPayloadIndex(COLLECTION_NAME, { field_name: 'case_id', field_schema: 'keyword' });
    await client.createPayloadIndex(COLLECTION_NAME, { field_name: 'doc_type', field_schema: 'keyword' });
  }

  // Get current max ID
  let startId;
  try {
    const scrollResult = await client.scroll(COLLECTION_NAME, { limit: 1, order_by: { key: 'id' } });
    startId = scrollResult.points.length > 0 ? Math.max(...scrollResult.points.map(p => p.id)) + 1 : 1;
  } catch (e) {
    startId = 100; // Start at 100 for synthetic docs
  }

  // Embed and upsert in batches
  console.log(`\nEmbedding and upserting ${allDocs.length} documents in batches of ${BATCH_SIZE}...`);

  let totalUpserted = 0;
  const embedTimes = [];
  const searchTimes = [];

  for (let i = 0; i < allDocs.length; i += BATCH_SIZE) {
    const batch = allDocs.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(allDocs.length / BATCH_SIZE);

    process.stdout.write(`  Batch ${batchNum}/${totalBatches}...`);

    try {
      const embedStart = Date.now();
      const embeddings = await embedBatch(batch.map(d => d.text));
      const embedTime = Date.now() - embedStart;
      embedTimes.push(embedTime);

      const points = batch.map((doc, idx) => ({
        id: startId + i + idx,
        vector: embeddings[idx],
        payload: {
          text: doc.text,
          doc_type: doc.doc_type,
          case_id: doc.case_id,
          source: doc.source,
          objection_type: doc.objection_type,
          keywords: doc.keywords,
        }
      }));

      const upsertStart = Date.now();
      await client.upsert(COLLECTION_NAME, { wait: true, points });
      const upsertTime = Date.now() - upsertStart;

      totalUpserted += batch.length;
      console.log(` embed=${embedTime}ms, upsert=${upsertTime}ms`);

      // Rate limiting
      await new Promise(r => setTimeout(r, 100));
    } catch (e) {
      console.log(` FAILED: ${e.message}`);
    }
  }

  // Verify final count
  const finalInfo = await client.getCollection(COLLECTION_NAME);
  console.log(`\n${'='.repeat(60)}`);
  console.log('COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total documents in collection: ${finalInfo.points_count}`);
  console.log(`Average embed time (batch ${BATCH_SIZE}): ${Math.round(embedTimes.reduce((a,b) => a+b, 0) / embedTimes.length)}ms`);

  // Run benchmark searches
  console.log('\n--- Benchmark Searches ---');
  const testQueries = [
    'Did you have a strategy to eliminate Netscape?',
    'What was the purpose of the Raptor structures?',
    'Is intelligent design a scientific theory?'
  ];

  for (const query of testQueries) {
    const embedStart = Date.now();
    const [embedding] = await embedBatch([query]);
    const embedTime = Date.now() - embedStart;

    const searchStart = Date.now();
    const results = await client.search(COLLECTION_NAME, {
      vector: embedding,
      limit: 10,
      with_payload: true
    });
    const searchTime = Date.now() - searchStart;

    console.log(`\nQuery: "${query.substring(0, 40)}..."`);
    console.log(`  Embed: ${embedTime}ms, Search: ${searchTime}ms, Results: ${results.length}`);
    console.log(`  Top hit: [${results[0]?.score.toFixed(3)}] ${results[0]?.payload.text.substring(0, 60)}...`);
  }
}

seed().catch(console.error);
