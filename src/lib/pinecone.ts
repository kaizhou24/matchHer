import { Pinecone, Index } from "@pinecone-database/pinecone"; // Added Index for type hint
import { createEmbedding } from "./openai.ts"; // Ensure this correctly returns Promise<number[]>
import { ensureServer } from "./env.ts"; // Ensure this is correctly set up for your environment

export const RESPONSES_INDEX = "responses";
const EXPECTED_EMBEDDING_DIMENSION = 1536; // Define this based on your embedding model

let _pineconeClient: Pinecone | null = null;

function getPineconeClient(): Pinecone {
  ensureServer("getPineconeClient");
  if (!_pineconeClient) {
    if (!process.env.PINECONE_API_KEY) {
      console.error("[getPineconeClient] PINECONE_API_KEY is not set in environment variables.");
      throw new Error("PINECONE_API_KEY environment variable is not set");
    }
    // If your Pinecone project setup needs environment (e.g. for pod-based indexes), ensure it's checked.
    // For serverless, typically only apiKey is needed for the client constructor.
    _pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    console.log("[getPineconeClient] Pinecone client initialized.");
  }
  return _pineconeClient;
}

export async function initializeIndex() {
  console.log(`[initializeIndex] Checking for Pinecone index: "${RESPONSES_INDEX}"`);
  const client = getPineconeClient();
  try {
    const { indexes } = await client.listIndexes();
    const indexExists = indexes?.some((index: { name: string }) => index.name === RESPONSES_INDEX);

    if (!indexExists) {
      console.log(`[initializeIndex] Index "${RESPONSES_INDEX}" does not exist. Creating now...`);
      await client.createIndex({
        name: RESPONSES_INDEX,
        dimension: EXPECTED_EMBEDDING_DIMENSION,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws', // Or your preferred cloud
            region: 'us-east-1' // Or your preferred region
          }
        }
        // For pod-based, spec might look like:
        // spec: { pod: { environment: 'your-pinecone-environment', podType: 'p1.x1', pods: 1 } }
      });
      console.log(`[initializeIndex] Index "${RESPONSES_INDEX}" created successfully. It might take a few moments to be ready.`);
      // Consider adding a loop with client.describeIndex({ indexName: RESPONSES_INDEX })
      // to wait until the index is ready, especially in automated scripts.
    } else {
      console.log(`[initializeIndex] Index "${RESPONSES_INDEX}" already exists.`);
    }
  } catch (error) {
    console.error("[initializeIndex] Error initializing Pinecone index:", error);
    throw error;
  }
}

// Helper to get an index instance
const getIndex = (): Index => getPineconeClient().Index(RESPONSES_INDEX); // Added Index type

// New function to clear all vectors from the index
export async function clearPineconeIndex(indexName: string = RESPONSES_INDEX) {
  ensureServer("clearPineconeIndex");
  console.log(`[clearPineconeIndex] Attempting to clear all vectors from index: "${indexName}"`);
  try {
    const index = getPineconeClient().Index(indexName);
    await index.deleteAll(); // Clears all vectors from the default namespace
    // If using namespaces and want to clear a specific one:
    // await index.namespace("your-namespace").deleteAll();
    console.log(`[clearPineconeIndex] Successfully cleared all vectors from index: "${indexName}".`);
  } catch (error) {
    console.error(`[clearPineconeIndex] Error clearing index "${indexName}":`, error);
    // It's possible the index doesn't exist; handle specific errors if necessary
    if ((error as any).message && (error as any).message.includes("not found")) {
        console.warn(`[clearPineconeIndex] Index "${indexName}" not found. Assuming it's already clean or yet to be created.`);
    } else {
        throw error; // Re-throw other errors
    }
  }
}


interface StorableMetadata extends Record<string, any> {
    type: string;
    name: string;
    // Add other common fields if necessary, e.g., email?: string;
}

export async function storeResponseEmbedding(
  text: string,
  metadata: StorableMetadata
) {
  console.log(`[storeResponseEmbedding] Attempting to store embedding for ${metadata.type}: "${metadata.name}"`);
  if (!text || text.trim() === "") {
    console.warn(`[storeResponseEmbedding] Received empty or whitespace-only text for "${metadata.name}", skipping embedding.`);
    return;
  }

  const index = getIndex();
  let embedding: number[];

  try {
    console.log(`[storeResponseEmbedding]   Creating embedding for text snippet: "${text.substring(0, 60)}..."`);
    embedding = await createEmbedding(text);
    console.log(`[storeResponseEmbedding]   Embedding created (Dimension: ${embedding.length}) for "${metadata.name}".`);

    if (embedding.length !== EXPECTED_EMBEDDING_DIMENSION) {
      const errMsg = `[storeResponseEmbedding] CRITICAL: Embedding dimension mismatch! Expected ${EXPECTED_EMBEDDING_DIMENSION}, got ${embedding.length} for "${metadata.name}".`;
      console.error(errMsg);
      throw new Error(errMsg);
    }
  } catch (error) {
    console.error(`[storeResponseEmbedding] Failed to create embedding for "${metadata.name}":`, error);
    throw error;
  }

  const idSuffix = metadata.name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
  const generatedId = `${metadata.type}-${idSuffix}`;
  console.log(`[storeResponseEmbedding]   Generated ID for upsert: "${generatedId}"`);

  try {
    console.log(`[storeResponseEmbedding]   Upserting vector with ID "${generatedId}" into Pinecone index "${RESPONSES_INDEX}".`);
    await index.upsert([{
      id: generatedId,
      values: embedding,
      metadata: {
        ...metadata,
        originalText: text.substring(0, 1000) // Store original text, possibly truncated if very long
      }
    }]);
    console.log(`[storeResponseEmbedding] Successfully upserted ID "${generatedId}" for "${metadata.name}".`);
  } catch (error) {
    console.error(`[storeResponseEmbedding] Failed to upsert data for "${metadata.name}" (ID: "${generatedId}"):`, error);
    throw error;
  }
}

// Define a type for the filter object based on Pinecone's capabilities.
// This is a simplified version; for complex filters, refer to Pinecone documentation.
export type PineconeQueryFilter = Record<string, string | number | boolean | { [key: string]: any }>;


export async function findSimilarResponses(
  queryText: string,
  limit: number = 5,
  filter?: PineconeQueryFilter // Added optional filter parameter
): Promise<any[]> { // Consider defining a PineconeMatch[] return type consistent with your test script
  console.log(`[findSimilarResponses] Searching for similar responses to query: "${queryText.substring(0, 60)}..." (topK: ${limit})`);
  if (filter) {
    console.log(`[findSimilarResponses]   Applying filter: ${JSON.stringify(filter)}`);
  }

  if (!queryText || queryText.trim() === "") {
    console.warn("[findSimilarResponses] Received empty or whitespace-only query text. Returning empty array.");
    return [];
  }

  const index = getIndex();
  let queryEmbedding: number[];

  try {
    console.log("[findSimilarResponses]   Creating embedding for query text...");
    queryEmbedding = await createEmbedding(queryText);
    console.log(`[findSimilarResponses]   Query embedding created (Dimension: ${queryEmbedding.length}).`);

    if (queryEmbedding.length !== EXPECTED_EMBEDDING_DIMENSION) {
      const errMsg = `[findSimilarResponses] CRITICAL: Query embedding dimension mismatch! Expected ${EXPECTED_EMBEDDING_DIMENSION}, got ${queryEmbedding.length}.`;
      console.error(errMsg);
      throw new Error(errMsg);
    }
  } catch (error) {
    console.error("[findSimilarResponses] Failed to create embedding for query text:", error);
    throw error;
  }

  try {
    console.log(`[findSimilarResponses]   Querying Pinecone index "${RESPONSES_INDEX}"...`);
    const queryOptions: any = { // Using 'any' for flexibility, can be typed more strictly
      vector: queryEmbedding,
      topK: limit,
      includeMetadata: true,
      // includeValues: false, // Optional: set to true if you need the vectors themselves
    };

    if (filter) {
      queryOptions.filter = filter;
    }

    const results = await index.query(queryOptions);
    console.log(`[findSimilarResponses]   Pinecone query returned ${results.matches?.length || 0} matches.`);
    return results.matches || [];
  } catch (error) {
    console.error("[findSimilarResponses] Failed to query Pinecone:", error);
    throw error;
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    console.error("[cosineSimilarity] Vector length mismatch.");
    throw new Error("Vectors must have the same length");
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i]; // Square of each element
    normB += b[i] * b[i]; // Square of each element
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    return 0;
  }
  return dotProduct / denominator;
}

export async function getSimilarity(pointId1: string, pointId2: string): Promise<number> {
  ensureServer("getSimilarity");
  console.log(`[getSimilarity] Calculating similarity between Pinecone points: "${pointId1}" and "${pointId2}"`);
  try {
    const index = getIndex();
    const fetchResult = await index.fetch([pointId1, pointId2]);

    const vector1 = fetchResult.records[pointId1]?.values;
    const vector2 = fetchResult.records[pointId2]?.values;

    if (!vector1 || !vector2) {
      const missingIds = [];
      if (!vector1) missingIds.push(pointId1);
      if (!vector2) missingIds.push(pointId2);
      console.error(`[getSimilarity] Failed to retrieve vectors for one or both points: ${missingIds.join(', ')}`);
      throw new Error(`Failed to retrieve vectors for: ${missingIds.join(', ')}`);
    }

    console.log(`[getSimilarity]   Vectors retrieved. Calculating cosine similarity.`);
    return cosineSimilarity(vector1, vector2);
  } catch (error) {
    console.error(`[getSimilarity] Error calculating similarity between "${pointId1}" and "${pointId2}":`, error);
    throw error;
  }
}

export async function generateFormConnections(formId: string) {
  ensureServer("generateFormConnections");
  console.log(`[generateFormConnections] Generating connections for formId: "${formId}" in namespace "ns1"`);
  try {
    const namespace = 'ns1'; // This function is hardcoded to use 'ns1'
    const index = getIndex();

    console.log(`[generateFormConnections]   Querying namespace "${namespace}" with filter for form_id "${formId}".`);
    // Note: Querying with a zero vector relies heavily on filters and topK to get relevant points.
    // This is a specific strategy for fetching points based on metadata.
    const result = await index.namespace(namespace).query({
      vector: new Array(EXPECTED_EMBEDDING_DIMENSION).fill(0),
      topK: 100, // Fetch up to 100 points matching the filter
      includeMetadata: true,
      includeValues: true, // Important if you want to avoid re-fetching vectors in getSimilarity
      filter: { form_id: { $eq: formId } },
    });

    const points = result.matches || [];
    console.log(`[generateFormConnections]   Found ${points.length} points matching filter.`);
    const connections = [];

    // Consider optimizing if points.length is large. N^2 comparisons can be slow.
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const p1 = points[i];
        const p2 = points[j];

        let sim: number;
        if (p1.values && p2.values) { // Check if vectors were included in the query response
            sim = cosineSimilarity(p1.values, p2.values);
        } else {
            // Fallback to fetching if vectors weren't included (e.g., includeValues was false)
            // This part would be less efficient.
            console.warn(`[generateFormConnections] Vectors not included in query results for ${p1.id} or ${p2.id}. Re-fetching for similarity. Consider setting includeValues: true in query.`);
            sim = await getSimilarity(p1.id, p2.id);
        }

        connections.push({
          response1Id: p1.metadata?.response_id as string, // Add type assertions if confident
          response2Id: p2.metadata?.response_id as string,
          response1Name: p1.metadata?.respondent_name as string,
          response2Name: p2.metadata?.respondent_name as string,
          similarityScore: sim,
        });
      }
    }
    console.log(`[generateFormConnections]   Generated ${connections.length} pairwise connections.`);
    return connections.sort((a, b) => b.similarityScore - a.similarityScore);
  } catch (error) {
    console.error(`[generateFormConnections] Error for formId "${formId}":`, error);
    throw error;
  }
}