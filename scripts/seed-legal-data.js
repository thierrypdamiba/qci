/**
 * Seed script for legal_memory collection
 * Creates comprehensive legal data for the Co-Counsel AI demo
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

// Comprehensive legal data for all 3 cases
const LEGAL_DATA = [
  // ============================================
  // FEDERAL RULES OF EVIDENCE (Universal)
  // ============================================
  {
    text: "Rule 602 - Lack of Personal Knowledge: A witness may testify to a matter only if evidence is introduced sufficient to support a finding that the witness has personal knowledge of the matter.",
    doc_type: "RULE",
    case_id: "universal",
    source: "Federal Rules of Evidence 602",
    objection_type: "LACK OF FOUNDATION",
    keywords: "personal knowledge foundation witness testimony"
  },
  {
    text: "Rule 802 - The Rule Against Hearsay: Hearsay is not admissible unless provided by federal statute, the Rules of Evidence, or Supreme Court rules. Hearsay is a statement the declarant does not make while testifying at trial, offered to prove the truth of the matter asserted.",
    doc_type: "RULE",
    case_id: "universal",
    source: "Federal Rules of Evidence 802",
    objection_type: "HEARSAY",
    keywords: "hearsay out of court statement truth declarant"
  },
  {
    text: "Rule 611(a) - Mode and Order of Examining Witnesses: The court should exercise reasonable control over questioning to make procedures effective for determining truth, avoid wasting time, and protect witnesses from harassment or undue embarrassment.",
    doc_type: "RULE",
    case_id: "universal",
    source: "Federal Rules of Evidence 611",
    objection_type: "ARGUMENTATIVE",
    keywords: "argumentative badgering harassment witness protection"
  },
  {
    text: "Rule 701 - Opinion Testimony by Lay Witnesses: If a witness is not testifying as an expert, testimony in the form of an opinion is limited to one that is rationally based on the witness's perception and helpful to understanding testimony or determining a fact in issue.",
    doc_type: "RULE",
    case_id: "universal",
    source: "Federal Rules of Evidence 701",
    objection_type: "IMPROPER OPINION",
    keywords: "lay witness opinion expert testimony speculation"
  },
  {
    text: "Rule 403 - Excluding Relevant Evidence for Prejudice: The court may exclude relevant evidence if its probative value is substantially outweighed by unfair prejudice, confusing the issues, misleading the jury, undue delay, or needlessly presenting cumulative evidence.",
    doc_type: "RULE",
    case_id: "universal",
    source: "Federal Rules of Evidence 403",
    objection_type: "PREJUDICIAL",
    keywords: "prejudice probative value misleading jury confusion"
  },
  {
    text: "Mischaracterization Objection: Counsel may not misstate or distort prior testimony when questioning a witness. Questions must accurately reflect what was previously testified to.",
    doc_type: "RULE",
    case_id: "universal",
    source: "Trial Practice Standards",
    objection_type: "MISCHARACTERIZATION",
    keywords: "mischaracterize misstates testimony distort prior"
  },
  {
    text: "Speculation Objection: Witnesses cannot speculate or guess about matters not within their personal knowledge. Questions that call for speculation are improper.",
    doc_type: "RULE",
    case_id: "universal",
    source: "Trial Practice Standards",
    objection_type: "SPECULATION",
    keywords: "speculation guess assume facts not in evidence"
  },
  {
    text: "Assumes Facts Not in Evidence: An objection when counsel's question presupposes the existence of a fact that has not been established through testimony or exhibits.",
    doc_type: "RULE",
    case_id: "universal",
    source: "Trial Practice Standards",
    objection_type: "ASSUMES FACTS",
    keywords: "assumes facts evidence presupposes established"
  },
  {
    text: "Vague and Ambiguous: Questions must be clear enough for the witness to understand what is being asked. Overly vague or ambiguous questions are objectionable.",
    doc_type: "RULE",
    case_id: "universal",
    source: "Trial Practice Standards",
    objection_type: "VAGUE",
    keywords: "vague ambiguous unclear confusing question"
  },
  {
    text: "Leading Questions: On direct examination, leading questions that suggest the answer are generally not allowed. Exception: Cross-examination where leading is permitted.",
    doc_type: "RULE",
    case_id: "universal",
    source: "Federal Rules of Evidence 611(c)",
    objection_type: "LEADING",
    keywords: "leading question suggest answer direct examination"
  },

  // ============================================
  // US v. MICROSOFT (1998) - Antitrust Case
  // ============================================
  {
    text: "Microsoft internal memo from 1995: 'We need to cut off Netscape's air supply. The browser war is a war for the platform. If we lose, we lose everything.'",
    doc_type: "EVIDENCE",
    case_id: "msft",
    source: "GX-20 (Internal Strategy Memo)",
    objection_type: null,
    keywords: "netscape air supply browser war platform monopoly kill"
  },
  {
    text: "Gates email to executives: 'Winning the browser war is critical. We must leverage Windows to ensure IE wins. OEMs who bundle Netscape will face consequences.'",
    doc_type: "EVIDENCE",
    case_id: "msft",
    source: "GX-21 (Gates Email)",
    objection_type: null,
    keywords: "browser war windows IE OEM netscape leverage consequences"
  },
  {
    text: "Gates deposition excerpt: Q: Did Microsoft have a strategy to kill Netscape? A: No. We competed vigorously on the merits. I don't recall specific discussions about eliminating them.",
    doc_type: "TRANSCRIPT",
    case_id: "msft",
    source: "Gates Deposition Day 3",
    objection_type: null,
    keywords: "kill netscape strategy eliminate compete gates deposition"
  },
  {
    text: "Email describing Netscape meeting from Marc Andreessen: 'Microsoft made it clear - work with us or we will crush you. It felt like a visit from the Godfather.'",
    doc_type: "EVIDENCE",
    case_id: "msft",
    source: "GX-33 (Andreessen Email)",
    objection_type: "HEARSAY",
    keywords: "godfather meeting crush netscape threat microsoft andreessen"
  },
  {
    text: "Internal strategy document: 'We must own the browser to own the platform. Deep Windows integration is the weapon. Netscape cannot compete with a free, integrated browser.'",
    doc_type: "EVIDENCE",
    case_id: "msft",
    source: "GX-41 (Strategy Doc)",
    objection_type: null,
    keywords: "browser platform control integrate windows weapon netscape"
  },
  {
    text: "Testimony from Jim Allchin: 'The browser is a feature of the operating system, not a separate product. Integration benefits users with seamless web access.'",
    doc_type: "TRANSCRIPT",
    case_id: "msft",
    source: "Trial Transcript Day 15",
    objection_type: null,
    keywords: "browser operating system integration feature allchin"
  },
  {
    text: "Microsoft defense: The 'Godfather' characterization is hearsay from a biased competitor. No Microsoft employee made such threats. This is inflammatory rhetoric.",
    doc_type: "EVIDENCE",
    case_id: "msft",
    source: "Defense Motion",
    objection_type: null,
    keywords: "godfather hearsay objection defense inflammatory"
  },
  {
    text: "OEM licensing agreements required Windows licensees to feature Internet Explorer prominently and prohibited removing the IE icon from the desktop.",
    doc_type: "EVIDENCE",
    case_id: "msft",
    source: "GX-55 (License Agreement)",
    objection_type: null,
    keywords: "OEM license agreement internet explorer desktop icon"
  },

  // ============================================
  // US v. SKILLING (Enron - 2006) - Fraud Case
  // ============================================
  {
    text: "Enron's mark-to-market accounting: The company booked projected 20-year profits from energy contracts immediately, recognizing $110 million in day-one gains on the Blockbuster video-on-demand deal that never materialized.",
    doc_type: "EVIDENCE",
    case_id: "enron",
    source: "SEC Filing Analysis",
    objection_type: null,
    keywords: "mark-to-market accounting profits earnings contracts blockbuster"
  },
  {
    text: "Arthur Andersen audit opinion 2000: 'Enron's financial statements present fairly, in all material respects, the financial position of the company in conformity with GAAP.'",
    doc_type: "EVIDENCE",
    case_id: "enron",
    source: "Audit Report 2000",
    objection_type: null,
    keywords: "arthur andersen audit GAAP financial statements"
  },
  {
    text: "Raptor SPE structure: Enron created four special purpose entities named after velociraptors, funded with Enron stock, to hedge declining asset values. When stock fell, the hedges collapsed.",
    doc_type: "EVIDENCE",
    case_id: "enron",
    source: "EX-22 (Board Minutes)",
    objection_type: null,
    keywords: "raptor SPE hedge debt stock collapse special purpose entity"
  },
  {
    text: "California energy crisis trading logs: Enron traders used strategies called 'Death Star' and 'Get Shorty' to manipulate electricity prices, creating artificial shortages during peak demand.",
    doc_type: "EVIDENCE",
    case_id: "enron",
    source: "EX-99 (Trader Communications)",
    objection_type: null,
    keywords: "california energy manipulation death star trader shortage"
  },
  {
    text: "Skilling testimony: 'I believed Enron was in excellent financial condition when I resigned. Our accounting was aggressive but fully compliant with GAAP as approved by Arthur Andersen.'",
    doc_type: "TRANSCRIPT",
    case_id: "enron",
    source: "Trial Transcript Day 8",
    objection_type: null,
    keywords: "skilling testimony financial health GAAP andersen"
  },
  {
    text: "Vinson & Elkins legal opinion: 'The Raptor transactions appear to comply with applicable accounting standards. However, the related party disclosures may need enhancement.'",
    doc_type: "EVIDENCE",
    case_id: "enron",
    source: "Legal Opinion Letter",
    objection_type: null,
    keywords: "raptor legal opinion compliance vinson elkins disclosure"
  },
  {
    text: "Defense objection: Questions about California market manipulation assume criminal intent not established by evidence. Trading within market rules is not per se illegal.",
    doc_type: "RULE",
    case_id: "enron",
    source: "Defense Motion",
    objection_type: "ASSUMES FACTS",
    keywords: "california manipulation assumes facts intent defense"
  },
  {
    text: "Andrew Fastow testimony as cooperating witness: 'Jeff Skilling knew about the Raptor structures. We discussed hiding losses from shareholders multiple times.'",
    doc_type: "TRANSCRIPT",
    case_id: "enron",
    source: "Trial Transcript Day 12",
    objection_type: null,
    keywords: "fastow testimony raptor skilling hiding losses shareholders"
  },

  // ============================================
  // KITZMILLER v. DOVER (2005) - Intelligent Design
  // ============================================
  {
    text: "Of Pandas and People textbook analysis: Early 1987 drafts contained 'creationism' which was systematically replaced with 'intelligent design' after Edwards v. Aguillard banned creationism in schools.",
    doc_type: "EVIDENCE",
    case_id: "kitzmiller",
    source: "Expert Report (Dr. Barbara Forrest)",
    objection_type: null,
    keywords: "pandas people creationism intelligent design edwards aguillard"
  },
  {
    text: "Dr. Kevin Padian paleontology testimony: 'In geology, abrupt appearance means appearing in the fossil record within a few million years - instantaneous on a geological scale, but not literally instantaneous creation.'",
    doc_type: "TRANSCRIPT",
    case_id: "kitzmiller",
    source: "Trial Transcript Day 6",
    objection_type: null,
    keywords: "padian abrupt appearance fossil record geological time million years"
  },
  {
    text: "Dr. Michael Behe testimony on irreducible complexity: 'The bacterial flagellum has 40 protein parts. Remove any one and it fails. Such complexity cannot evolve incrementally - it requires intelligent design.'",
    doc_type: "TRANSCRIPT",
    case_id: "kitzmiller",
    source: "Trial Transcript Day 11",
    objection_type: null,
    keywords: "behe irreducible complexity flagellum intelligent design protein"
  },
  {
    text: "AAAS Board Resolution 2002: 'Intelligent Design has not been demonstrated to be a scientific theory through peer review and testing. It should not be presented as science in public schools.'",
    doc_type: "EVIDENCE",
    case_id: "kitzmiller",
    source: "AAAS Resolution",
    objection_type: null,
    keywords: "AAAS intelligent design science peer review schools"
  },
  {
    text: "Of Pandas and People, page 99-100: 'Intelligent design means that various forms of life began abruptly through an intelligent agency, with their distinctive features already intact: fish with fins and scales, birds with feathers.'",
    doc_type: "EVIDENCE",
    case_id: "kitzmiller",
    source: "Pandas and People p.99-100",
    objection_type: null,
    keywords: "pandas people abruptly intelligent agency features intact fish birds"
  },
  {
    text: "Dover School Board meeting minutes: Board member William Buckingham stated 'Two thousand years ago someone died on a cross. Can't someone stand up for him?' when arguing for intelligent design.",
    doc_type: "EVIDENCE",
    case_id: "kitzmiller",
    source: "Board Meeting Minutes June 2004",
    objection_type: null,
    keywords: "buckingham board meeting religious motivation cross dover"
  },
  {
    text: "Cross-examination: Counsel's paraphrase of Dr. Padian's testimony mischaracterizes his statement. Dr. Padian testified about geological time, not instantaneous appearance.",
    doc_type: "RULE",
    case_id: "kitzmiller",
    source: "Court Ruling on Objection",
    objection_type: "MISCHARACTERIZATION",
    keywords: "padian mischaracterize testimony geological instantaneous"
  },
  {
    text: "Judge Jones ruling: The term 'abrupt' in Pandas is deliberately ambiguous, designed to suggest sudden divine creation while maintaining plausible deniability as science.",
    doc_type: "EVIDENCE",
    case_id: "kitzmiller",
    source: "Kitzmiller Decision p.32",
    objection_type: "VAGUE",
    keywords: "abrupt ambiguous vague creation science pandas"
  },
  {
    text: "Dr. Kenneth Miller cross-examination of Behe: 'Isn't it true that the Type III secretory system contains a subset of flagellum proteins, suggesting evolutionary precursors?'",
    doc_type: "TRANSCRIPT",
    case_id: "kitzmiller",
    source: "Trial Transcript Day 12",
    objection_type: null,
    keywords: "miller behe flagellum type III secretory evolution"
  }
];

async function embedText(text) {
  const response = await fetch('https://api.jina.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JINA_API_KEY}`,
    },
    body: JSON.stringify({
      input: [text],
      model: 'jina-embeddings-v2-base-en',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Jina API error: ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

async function seed() {
  console.log('Starting legal data seed...\n');

  // Check if collection exists, recreate for fresh start
  try {
    await client.deleteCollection(COLLECTION_NAME);
    console.log(`Deleted existing ${COLLECTION_NAME} collection`);
  } catch (e) {
    console.log('No existing collection to delete');
  }

  // Create fresh collection
  console.log('Creating new collection...');
  await client.createCollection(COLLECTION_NAME, {
    vectors: {
      size: 768,
      distance: 'Cosine',
    },
  });

  // Create payload indexes for filtering
  await client.createPayloadIndex(COLLECTION_NAME, {
    field_name: 'case_id',
    field_schema: 'keyword',
  });
  await client.createPayloadIndex(COLLECTION_NAME, {
    field_name: 'doc_type',
    field_schema: 'keyword',
  });
  await client.createPayloadIndex(COLLECTION_NAME, {
    field_name: 'objection_type',
    field_schema: 'keyword',
  });

  // Embed and upsert all documents
  console.log(`\nEmbedding ${LEGAL_DATA.length} documents...`);

  const points = [];
  for (let i = 0; i < LEGAL_DATA.length; i++) {
    const doc = LEGAL_DATA[i];
    process.stdout.write(`  [${i + 1}/${LEGAL_DATA.length}] ${doc.source.substring(0, 40).padEnd(40)}...`);

    try {
      const embedding = await embedText(doc.text);
      points.push({
        id: i + 1,
        vector: embedding,
        payload: {
          text: doc.text,
          doc_type: doc.doc_type,
          case_id: doc.case_id,
          source: doc.source,
          objection_type: doc.objection_type,
          keywords: doc.keywords,
        },
      });
      console.log(' OK');
    } catch (e) {
      console.log(` FAILED: ${e.message}`);
    }

    // Rate limiting - wait 150ms between requests
    await new Promise(r => setTimeout(r, 150));
  }

  // Upsert all points
  console.log(`\nUpserting ${points.length} points to Qdrant...`);
  await client.upsert(COLLECTION_NAME, {
    wait: true,
    points: points,
  });

  // Verify
  const finalInfo = await client.getCollection(COLLECTION_NAME);
  console.log(`\nDone! Collection now has ${finalInfo.points_count} points.`);

  // Run test searches
  console.log('\n' + '='.repeat(60));
  console.log('TESTING SEARCHES');
  console.log('='.repeat(60));

  const testQueries = [
    { query: 'Did you have a strategy to kill Netscape?', case: 'msft' },
    { query: 'visit from the Godfather meeting threat', case: 'msft' },
    { query: 'Did you use mark-to-market to book future profits?', case: 'enron' },
    { query: 'Tell us about the Raptor vehicles hiding debt', case: 'enron' },
    { query: 'Dr. Padian testified abrupt means something different', case: 'kitzmiller' },
    { query: 'abruptly intelligent agency features intact', case: 'kitzmiller' },
  ];

  for (const test of testQueries) {
    console.log(`\n[${test.case.toUpperCase()}] "${test.query}"`);
    const embedding = await embedText(test.query);
    const results = await client.search(COLLECTION_NAME, {
      vector: embedding,
      limit: 3,
      with_payload: true,
      filter: {
        should: [
          { key: 'case_id', match: { value: test.case } },
          { key: 'case_id', match: { value: 'universal' } },
        ]
      }
    });

    results.forEach((r, i) => {
      const objection = r.payload.objection_type ? ` [${r.payload.objection_type}]` : '';
      console.log(`  ${i + 1}. [${r.score.toFixed(3)}] ${r.payload.doc_type}${objection}: ${r.payload.text.substring(0, 70)}...`);
    });

    await new Promise(r => setTimeout(r, 150));
  }

  console.log('\n' + '='.repeat(60));
  console.log('SEED COMPLETE');
  console.log('='.repeat(60));
}

seed().catch(console.error);
