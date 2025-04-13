import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { CohereEmbeddings } from "@langchain/cohere";

const embeddings = new CohereEmbeddings({
  model: "embed-english-v3.0"
});

export async function getEmbeddingFromOpenAI(inputText) {
  try {
    const embedding = await embeddings.embedQuery(inputText);
    return embedding;
  } catch (error) {
    console.error('Error generating embedding from OpenAI:', error);
    throw error;
  }
}

// Initialize Supabase client
const privateKey = process.env.SUPABASE_PRIVATE_KEY;
if (!privateKey) {
  throw new Error('SUPABASE_PRIVATE_KEY is not set in the environment variables.');
}
const supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is not set in the environment variables.');
}
export const supabase = createClient(supabaseUrl, privateKey);
