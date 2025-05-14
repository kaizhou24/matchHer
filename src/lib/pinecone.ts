import {
  Pinecone,
  Index,
  IndexModel,
  PineconeRecord as SDKPineconeRecord,
  // QueryOptions, // This is a union type in the SDK, often better to type options structurally for specific query types
} from "@pinecone-database/pinecone";

import { createEmbedding } from "./openai.ts";
import { ensureServer } from "./env.ts";

export const RESPONSES_INDEX = "responses";
const EXPECTED_EMBEDDING_DIMENSION = 1536;

// --- Official Pinecone Metadata Types (based on SDK v6.0.0) ---
export type PineconeMetadataValue = string | boolean | number | string[];
export type BasePineconeMetadata = Record<string, PineconeMetadataValue>;

// --- Custom Metadata Interfaces ---

// Define specific known properties for StorableMetadata
interface StorableMetadataSpecificProps {
    type: string;
    name: string;
    originalText: string;
}
// StorableMetadata combines BasePineconeMetadata with its specific known string properties
export interface StorableMetadata extends BasePineconeMetadata, StorableMetadataSpecificProps {}


// Define specific known properties for FormSpecificMetadata
interface FormSpecificMetadataSpecificProps {
    type: string;
    name: string;
    originalText: string;
    form_id: string;
    response_id: string;
    respondent_name: string;
}
// FormSpecificMetadata combines BasePineconeMetadata with its specific known string properties
export interface FormSpecificMetadata extends BasePineconeMetadata, FormSpecificMetadataSpecificProps {}


// --- Pinecone Client Initialization ---
let _pineconeClient: Pinecone | null = null;

function getPineconeClient(): Pinecone {
  ensureServer("getPineconeClient");
  if (!_pineconeClient) {
    if (!process.env.PINECONE_API_KEY) {
      console.error("[getPineconeClient] PINECONE_API_KEY is not set.");
      throw new Error("PINECONE_API_KEY environment variable is not set");
    }
    _pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    console.log("[getPineconeClient] Pinecone client initialized.");
  }
  return _pineconeClient;
}

// --- Index Initialization and Management ---
export async function initializeIndex() {
  console.log(`[initializeIndex] Checking for Pinecone index: "${RESPONSES_INDEX}"`);
  const client = getPineconeClient();
  try {
    const { indexes } = await client.listIndexes();
    const indexExists = indexes?.some((index: IndexModel) => index.name === RESPONSES_INDEX);

    if (!indexExists) {
      console.log(`[initializeIndex] Index "${RESPONSES_INDEX}" does not exist. Creating now...`);
      await client.createIndex({
        name: RESPONSES_INDEX,
        dimension: EXPECTED_EMBEDDING_DIMENSION,
        metric: 'cosine',
        spec: {
          serverless: { cloud: 'aws', region: 'us-east-1' }
        }
      });
      console.log(`[initializeIndex] Index "${RESPONSES_INDEX}" created. It may take moments to be ready.`);
    } else {
      console.log(`[initializeIndex] Index "${RESPONSES_INDEX}" already exists.`);
    }
  } catch (error) {
    console.error("[initializeIndex] Error initializing Pinecone index:", error);
    throw error;
  }
}

const getIndex = <TMetadata extends BasePineconeMetadata = StorableMetadata>(): Index<TMetadata> =>
  getPineconeClient().Index<TMetadata>(RESPONSES_INDEX);

export async function clearPineconeIndex(indexName: string = RESPONSES_INDEX) {
  ensureServer("clearPineconeIndex");
  console.log(`[clearPineconeIndex] Clearing index: "${indexName}"`);
  try {
    const index = getPineconeClient().Index<BasePineconeMetadata>(indexName);
    await index.deleteAll();
    console.log(`[clearPineconeIndex] Successfully cleared index: "${indexName}".`);
  } catch (error) {
    console.error(`[clearPineconeIndex] Error clearing index "${indexName}":`, error);
    if (error instanceof Error && error.message.includes("not found")) {
        console.warn(`[clearPineconeIndex] Index "${indexName}" not found.`);
    } else {
        throw error;
    }
  }
}

// --- Embedding Storage ---
// InputStorableMetadata now explicitly has 'type' and 'name' as strings,
// and omits 'originalText' from the specific props.
// It also allows for other arbitrary keys compatible with BasePineconeMetadata.
type InputStorableMetadata = {
    type: string;
    name: string;
} & Omit<BasePineconeMetadata, 'type' | 'name' | 'originalText'>; // Allow other base metadata keys

export async function storeResponseEmbedding(
  text: string,
  metadata: InputStorableMetadata // metadata.type and metadata.name are now strongly typed as string
) {
  console.log(`[storeResponseEmbedding] Storing embedding for ${metadata.type}: "${metadata.name}"`);
  if (!text || text.trim() === "") {
    console.warn(`[storeResponseEmbedding] Empty text for "${metadata.name}", skipping.`);
    return;
  }

  const index = getIndex<StorableMetadata>();
  let embedding: number[];

  try {
    embedding = await createEmbedding(text);
    if (embedding.length !== EXPECTED_EMBEDDING_DIMENSION) {
      throw new Error(`Embedding dimension mismatch for "${metadata.name}". Expected ${EXPECTED_EMBEDDING_DIMENSION}, got ${embedding.length}.`);
    }
  } catch (error) {
    console.error(`[storeResponseEmbedding] Failed to create embedding for "${metadata.name}":`, error);
    throw error;
  }

  // metadata.name is now guaranteed to be a string due to InputStorableMetadata's definition.
  const idSuffix = metadata.name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
  const generatedId = `${metadata.type}-${idSuffix}`;

  // Construct fullMetadata.
  // Spread metadata to include any other BasePineconeMetadata properties.
  // Then explicitly set type, name (which are already strings from InputStorableMetadata)
  // and the new originalText.
  const fullMetadata: StorableMetadata = {
    ...(metadata as BasePineconeMetadata), // Spread other potential base metadata fields
    type: metadata.type, // Explicitly from InputStorableMetadata (string)
    name: metadata.name, // Explicitly from InputStorableMetadata (string)
    originalText: text.substring(0, 1000)
  };

  const recordToUpsert: SDKPineconeRecord<StorableMetadata> = {
    id: generatedId,
    values: embedding,
    metadata: fullMetadata
  };

  try {
    await index.upsert([recordToUpsert]);
    console.log(`[storeResponseEmbedding] Upserted ID "${generatedId}" for "${metadata.name}".`);
  } catch (error)
 {
    console.error(`[storeResponseEmbedding] Failed to upsert data for "${metadata.name}" (ID: "${generatedId}"):`, error);
    throw error;
  }
}

// --- Querying and Similarity ---
export type PineconeFilterValue = PineconeMetadataValue | { [key: string]: PineconeMetadataValue | PineconeMetadataValue[] | object };
export type PineconeQueryFilter = Record<string, PineconeFilterValue>;

interface InternalQueryOptions {
    vector: number[];
    id?: string;
    sparseValues?: { indices: number[]; values: number[]; };
    topK: number;
    filter?: PineconeQueryFilter; // PineconeQueryFilter is used here
    includeMetadata?: boolean;
    includeValues?: boolean;
    namespace?: string;
}

export interface PineconeMatch<TMetadata extends BasePineconeMetadata = StorableMetadata> extends SDKPineconeRecord<TMetadata> {
  score?: number;
}

export async function findSimilarResponses<TMetadata extends BasePineconeMetadata = StorableMetadata>(
  queryText: string,
  limit: number = 5,
  filter?: PineconeQueryFilter // Parameter is PineconeQueryFilter
): Promise<PineconeMatch<TMetadata>[]> {
  console.log(`[findSimilarResponses] Searching for query: "${queryText.substring(0, 60)}...", topK: ${limit}`);
  if (filter) console.log(`[findSimilarResponses]   Applying filter: ${JSON.stringify(filter)}`);

  if (!queryText || queryText.trim() === "") {
    console.warn("[findSimilarResponses] Empty query text. Returning empty array.");
    return [];
  }

  const index = getIndex<TMetadata>();
  let queryEmbedding: number[];

  try {
    queryEmbedding = await createEmbedding(queryText);
    if (queryEmbedding.length !== EXPECTED_EMBEDDING_DIMENSION) {
        throw new Error(`Query embedding dimension mismatch! Expected ${EXPECTED_EMBEDDING_DIMENSION}, got ${queryEmbedding.length}.`);
    }
  } catch (error) {
    console.error("[findSimilarResponses] Failed to create embedding for query:", error);
    throw error;
  }

  try {
    const queryOptions: InternalQueryOptions = {
      vector: queryEmbedding,
      topK: limit,
      includeMetadata: true,
      includeValues: false,
    };

    if (filter) {
      // Assign directly as types match (PineconeQueryFilter | undefined)
      queryOptions.filter = filter;
    }

    // The 'as any' cast is kept here because InternalQueryOptions (specifically its 'filter' field
    // of type PineconeQueryFilter) may not perfectly align with the Pinecone SDK's
    // 'QueryOperationRequest' type if its 'Filter<T>' resolves to a simpler structure like Partial<TMetadata>.
    // This cast acknowledges that our PineconeQueryFilter is richer to support documented filter capabilities.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await index.query(queryOptions as any);

    return (results.matches as PineconeMatch<TMetadata>[]) || [];
  } catch (error) {
    console.error("[findSimilarResponses] Failed to query Pinecone:", error);
    throw error;
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length for cosine similarity.");
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

export async function getSimilarity(pointId1: string, pointId2: string): Promise<number> {
  ensureServer("getSimilarity");
  console.log(`[getSimilarity] Calculating similarity between: "${pointId1}" and "${pointId2}"`);
  try {
    const index = getIndex<BasePineconeMetadata>();
    const fetchResult = await index.fetch([pointId1, pointId2]);

    const vector1 = fetchResult.records?.[pointId1]?.values;
    const vector2 = fetchResult.records?.[pointId2]?.values;

    if (!vector1 || !vector2) {
      const missing = !vector1 ? pointId1 : pointId2;
      throw new Error(`Failed to retrieve vector for point: ${missing}`);
    }
    return cosineSimilarity(vector1, vector2);
  } catch (error) {
    console.error(`[getSimilarity] Error for "${pointId1}" vs "${pointId2}":`, error);
    throw error;
  }
}

interface Connection {
  response1Id: string;
  response2Id: string;
  response1Name: string;
  response2Name: string;
  similarityScore: number;
}

export async function generateFormConnections(formId: string): Promise<Connection[]> {
  ensureServer("generateFormConnections");
  const namespace = 'ns1';
  console.log(`[generateFormConnections] Generating for formId: "${formId}" in namespace "${namespace}"`);
  try {
    const index = getIndex<FormSpecificMetadata>();

    const queryOptions: InternalQueryOptions = {
      vector: new Array(EXPECTED_EMBEDDING_DIMENSION).fill(0),
      topK: 100,
      includeMetadata: true,
      includeValues: true,
      filter: { form_id: { $eq: formId } } as PineconeQueryFilter, // Cast for complex filter object
      namespace: namespace,
    };

    // Similar to findSimilarResponses, the 'as any' cast is retained for the call to index.query
    // due to potential discrepancies between our rich PineconeQueryFilter and the SDK's static filter types.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await index.query(queryOptions as any);
    const points: PineconeMatch<FormSpecificMetadata>[] = (result.matches as PineconeMatch<FormSpecificMetadata>[]) || [];
    console.log(`[generateFormConnections] Found ${points.length} points.`);
    const connections: Connection[] = [];

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const p1 = points[i];
        const p2 = points[j];

        if (!p1.metadata || !p2.metadata || !p1.values || !p2.values) {
          console.warn(`[generateFormConnections] Skipping pair due to missing data: ${p1.id}, ${p2.id}`);
          continue;
        }
        connections.push({
          response1Id: p1.metadata.response_id,
          response2Id: p2.metadata.response_id,
          response1Name: p1.metadata.respondent_name,
          response2Name: p2.metadata.respondent_name,
          similarityScore: cosineSimilarity(p1.values, p2.values),
        });
      }
    }
    console.log(`[generateFormConnections] Generated ${connections.length} connections.`);
    return connections.sort((a, b) => b.similarityScore - a.similarityScore);
  } catch (error) {
    console.error(`[generateFormConnections] Error for formId "${formId}":`, error);
    throw error;
  }
}