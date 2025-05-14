import OpenAI from "openai";
import { ensureServer } from "./env.ts";

// Initialize OpenAI only on the server side
let _openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  ensureServer("getOpenAIClient");
  
  if (!_openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    
    _openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  return _openaiClient;
}

/**
 * Create an embedding for the given text
 * This function must only be called from server-side code
 */
export async function createEmbedding(text: string): Promise<number[]> {
  ensureServer("createEmbedding");
  
  try {
    const client = getOpenAIClient();
    const response = await client.embeddings.create({
      model: "text-embedding-3-small",  // Using a more cost-effective model
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error creating embedding:", error);
    throw new Error("Failed to create embedding");
  }
}

/**
 * Generate a response using the OpenAI API
 */
export async function generateResponse(prompt: string): Promise<string> {
  ensureServer("generateResponse");
  
  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",  // Using a standard model
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    return response.choices[0].message.content || 'Unable to generate response';
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error("Failed to generate response");
  }
} 