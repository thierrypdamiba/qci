/**
 * Seed script for native QCI model collection
 * Uses all-MiniLM-L6-v2 (384 dims) hosted directly on Qdrant Cloud
 * This demonstrates true QCI latency benefits with zero external API calls
 */

const { QdrantClient } = require('@qdrant/js-client-rest');
const fs = require('fs');
const path = require('path');

// Read env file - try .env.local first, then .env
function loadEnv() {
    const envFiles = ['.env.local', '.env'];
    for (const file of envFiles) {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const env = {};
            content.split('\n').forEach(line => {
                const [key, ...val] = line.split('=');
                if (key && !key.startsWith('#')) env[key.trim()] = val.join('=').trim();
            });
            return env;
        }
    }
    // Fall back to process.env
    return process.env;
}

const env = loadEnv();
const QDRANT_URL = (env.QDRANT_URL || '').trim();
const QDRANT_API_KEY = (env.QDRANT_API_KEY || '').trim();

if (!QDRANT_URL || !QDRANT_API_KEY) {
    console.error('Missing QDRANT_URL or QDRANT_API_KEY');
    console.error('Create a .env file with these variables or set them in environment');
    process.exit(1);
}
const COLLECTION_NAME = 'wiki_minilm';
const MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
const VECTOR_SIZE = 384;

// Note: This collection uses all-MiniLM-L6-v2 (384 dims) for fair comparison
// Both "external" (FastEmbed) and "QCI native" modes use this same model
// The only difference is WHERE the embedding happens - that's what we're benchmarking

const client = new QdrantClient({
    url: QDRANT_URL,
    apiKey: QDRANT_API_KEY,
});

// Sample Wikipedia articles for benchmarking
const WIKI_ARTICLES = [
    {
        title: 'Speed of light',
        content: 'The speed of light in vacuum, commonly denoted c, is a universal physical constant that is exactly equal to 299,792,458 metres per second. According to the special theory of relativity, c is the upper limit for the speed at which conventional matter or energy can travel through space.',
    },
    {
        title: 'Telephone',
        content: 'A telephone is a telecommunications device that permits two or more users to conduct a conversation when they are too far apart to be easily heard directly. Alexander Graham Bell was awarded the first U.S. patent for the invention of the telephone in 1876.',
    },
    {
        title: 'World War II',
        content: 'World War II or the Second World War was a global conflict that lasted from 1939 to 1945. It involved the vast majority of the world\'s countries forming two opposing military alliances: the Allies and the Axis powers. The war ended in Europe on 8 May 1945 (V-E Day).',
    },
    {
        title: 'Photosynthesis',
        content: 'Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy that can be stored and later released to fuel the organism\'s activities. This process involves the absorption of carbon dioxide and water, using sunlight to produce glucose and oxygen.',
    },
    {
        title: 'Romeo and Juliet',
        content: 'Romeo and Juliet is a tragedy written by William Shakespeare early in his career about the romance between two Italian youths from feuding families. It was among Shakespeare\'s most popular plays during his lifetime and is one of his most frequently performed plays.',
    },
    {
        title: 'Albert Einstein',
        content: 'Albert Einstein was a German-born theoretical physicist who is widely held to be one of the greatest and most influential scientists of all time. He developed the theory of relativity, one of the two pillars of modern physics alongside quantum mechanics. His mass-energy equivalence formula E = mc² has been called the world\'s most famous equation.',
    },
    {
        title: 'Moon landing',
        content: 'The Apollo 11 mission was the American spaceflight that first landed humans on the Moon. Commander Neil Armstrong and lunar module pilot Buzz Aldrin landed the Apollo Lunar Module Eagle on July 20, 1969. Armstrong became the first person to step onto the lunar surface six hours and 39 minutes later.',
    },
    {
        title: 'DNA',
        content: 'Deoxyribonucleic acid is a polymer composed of two polynucleotide chains that coil around each other to form a double helix. The structure of DNA was discovered by James Watson and Francis Crick in 1953, with contributions from Rosalind Franklin\'s X-ray crystallography work.',
    },
    {
        title: 'Great Wall of China',
        content: 'The Great Wall of China is a series of fortifications that were built across the historical northern borders of ancient Chinese states and Imperial China as protection against various nomadic groups. The wall spans approximately 21,196 kilometers and was built over many centuries.',
    },
    {
        title: 'Python programming',
        content: 'Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability with the use of significant indentation. Python was conceived in the late 1980s by Guido van Rossum and first released in 1991.',
    },
    {
        title: 'Climate change',
        content: 'Climate change refers to long-term shifts in temperatures and weather patterns. Human activities have been the main driver of climate change since the 1800s, primarily due to the burning of fossil fuels like coal, oil, and gas, which produces heat-trapping gases.',
    },
    {
        title: 'Quantum mechanics',
        content: 'Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles. It differs from classical physics in that energy, momentum, and other quantities are often restricted to discrete values.',
    },
    {
        title: 'Artificial intelligence',
        content: 'Artificial intelligence is the simulation of human intelligence processes by machines, especially computer systems. These processes include learning, reasoning, and self-correction. AI applications include expert systems, natural language processing, speech recognition, and machine vision.',
    },
    {
        title: 'Black holes',
        content: 'A black hole is a region of spacetime where gravity is so strong that nothing, not even light or other electromagnetic waves, can escape once past the event horizon. The theory of general relativity predicts that a sufficiently compact mass can deform spacetime to form a black hole.',
    },
    {
        title: 'Renaissance',
        content: 'The Renaissance was a period of cultural, artistic, political, and economic rebirth following the Middle Ages. Generally described as taking place from the 14th to the 17th century, it promoted the rediscovery of classical philosophy, literature, and art.',
    },
    {
        title: 'Vaccines',
        content: 'A vaccine is a biological preparation that provides active acquired immunity to a particular infectious disease. Vaccines typically contain an agent that resembles a disease-causing microorganism and is often made from weakened or killed forms of the microbe.',
    },
    {
        title: 'Solar system',
        content: 'The Solar System is the gravitationally bound system of the Sun and the objects that orbit it. The largest objects are the eight planets, with the remainder being smaller objects such as dwarf planets, asteroids, and comets. The Solar System formed 4.6 billion years ago.',
    },
    {
        title: 'Democracy',
        content: 'Democracy is a form of government in which the people have the authority to deliberate and decide legislation, or to choose governing officials to do so. The term comes from Greek and means rule by the people. Athens is generally credited with establishing the first democracy.',
    },
    {
        title: 'Electricity',
        content: 'Electricity is the set of physical phenomena associated with the presence and motion of matter that has a property of electric charge. Benjamin Franklin conducted extensive research on electricity in the 18th century, famously flying a kite in a thunderstorm.',
    },
    {
        title: 'Evolution',
        content: 'Evolution is the change in the heritable characteristics of biological populations over successive generations. Charles Darwin published his theory of evolution by natural selection in 1859 in his book On the Origin of Species, revolutionizing our understanding of life on Earth.',
    },
];

/**
 * Upsert points using QCI inference (embed during upsert)
 */
async function upsertWithQCI(points) {
    // QCI upserts with Document objects instead of vectors
    const qciPoints = points.map(p => ({
        id: p.id,
        vector: {
            text: p.text,
            model: MODEL,
        },
        payload: p.payload,
    }));

    const response = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points?wait=true`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'api-key': QDRANT_API_KEY,
        },
        body: JSON.stringify({
            points: qciPoints,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`QCI upsert error: ${response.status} - ${error}`);
    }

    return await response.json();
}

async function seed() {
    console.log('='.repeat(60));
    console.log('SEEDING NATIVE MODEL COLLECTION');
    console.log('='.repeat(60));
    console.log(`Collection: ${COLLECTION_NAME}`);
    console.log(`Model: ${MODEL} (${VECTOR_SIZE} dims)`);
    console.log(`Documents: ${WIKI_ARTICLES.length}`);
    console.log('');

    // Delete existing collection if exists
    try {
        await client.deleteCollection(COLLECTION_NAME);
        console.log('Deleted existing collection');
    } catch (e) {
        console.log('No existing collection to delete');
    }

    // Create new collection with 384 dimensions
    console.log('Creating collection...');
    await client.createCollection(COLLECTION_NAME, {
        vectors: {
            size: VECTOR_SIZE,
            distance: 'Cosine',
        },
    });

    // Create payload index
    await client.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'title',
        field_schema: 'keyword',
    });

    // Upsert with QCI inference (embeds during upsert)
    console.log('\nUpserting documents with QCI inference...');

    const points = WIKI_ARTICLES.map((article, idx) => ({
        id: idx + 1,
        text: `${article.title}: ${article.content}`,
        payload: {
            title: article.title,
            content: article.content,
        },
    }));

    const startUpsert = Date.now();
    await upsertWithQCI(points);
    const upsertTime = Date.now() - startUpsert;

    console.log(`Upserted ${points.length} documents in ${upsertTime}ms (${Math.round(upsertTime / points.length)}ms/doc)`);

    // Verify
    const info = await client.getCollection(COLLECTION_NAME);
    console.log(`\nCollection created with ${info.points_count} points`);

    // Test search using QCI
    console.log('\n' + '='.repeat(60));
    console.log('BENCHMARK SEARCHES (QCI Native Model)');
    console.log('='.repeat(60));

    const testQueries = [
        'What is the speed of light?',
        'Who invented the telephone?',
        'When did World War 2 end?',
        'What is photosynthesis?',
        'Who wrote Romeo and Juliet?',
    ];

    for (const query of testQueries) {
        const start = Date.now();

        // Use QCI query endpoint
        const response = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': QDRANT_API_KEY,
            },
            body: JSON.stringify({
                query: {
                    nearest: {
                        text: query,
                        model: MODEL,
                    },
                },
                limit: 3,
                with_payload: true,
            }),
        });

        const data = await response.json();
        const latency = Date.now() - start;

        console.log(`\nQuery: "${query}"`);
        console.log(`  Latency: ${latency}ms`);
        if (data.result?.points) {
            data.result.points.slice(0, 2).forEach((p, i) => {
                console.log(`  ${i + 1}. [${p.score?.toFixed(3)}] ${p.payload.title}`);
            });
        } else {
            console.log(`  Error: ${JSON.stringify(data)}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('DONE - Run benchmark to compare QCI native vs Jina');
    console.log('='.repeat(60));
}

seed().catch(console.error);
