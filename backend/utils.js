import { readFile } from "fs/promises";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { getEmbeddingFromOpenAI, supabase } from "./config.js"; // đảm bảo hàm này đã sẵn sàng   
import dotenv from "dotenv";
dotenv.config();

const JSON_PATH = "./movies_sample.json";
const CHUNK_SIZE = 1500;
const CHUNK_OVERLAP = 200;

async function loadMovies() {
  const file = await readFile(JSON_PATH, "utf8");
  return JSON.parse(file);
}

function formatMovieToChunk(movie, index) {
  return {
    id: `movie-${index}`,
    content: `Title: ${movie.title || "N/A"}, Year: ${movie.year || "N/A"}, Description: ${movie.extract || "N/A"}, Genre: ${movie.genres || "N/A"}, Cast: ${movie.cast?.join(", ") || "N/A"}
    `,
    metadata: {
      thumbnail: movie.thumbnail || null,
    }
  };
}

async function splitIntoChunks(formattedMovies) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  const allChunks = [];

  for (const movie of formattedMovies) {
    const splitChunks = await splitter.createDocuments(
      [movie.content],
      [{ metadata: movie.metadata }]
    );

    for (const chunk of splitChunks) {
      allChunks.push({
        id: movie.id,
        content: chunk.pageContent,
        metadata: chunk.metadata
      });
    }
  }

  return allChunks;
}

async function processChunksAndStore(chunks) {
  for (const chunk of chunks) {
    const embedding = await getEmbeddingFromOpenAI(chunk.content);
    console.log(`Chunk ID: ${chunk.id}, Embedding len: ${embedding.length}`);
    console.log(`Chunk thumbnail: ${chunk.metadata.metadata.thumbnail}`);

    await supabase.from("movies").insert({
      content: chunk.content,
      embedding,
      thumbnail: chunk.metadata.metadata.thumbnail,
    });
  }
}

export async function findThumbnailByTitle(title) {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('thumbnail')
      .ilike('content', `%${title}%`)
      .limit(1);

    if (error) {
      throw error;
    }

    // Nếu có dữ liệu, trả về thumbnail của phần tử đầu tiên
    if (data && data.length > 0) {
      return data[0].thumbnail;
    } else {
      return null; // hoặc trả về chuỗi thông báo không tìm thấy
    }
  } catch (error) {
    console.error('Error fetching thumbnail:', error);
    throw error;
  }
}

export async function findNearestMatch(embedding) {
  const { data, error } = await supabase.rpc("match_movies", {
    query_embedding: embedding,
    match_threshold: 0.4,
    match_count: 2,
  });
  if (error) {
    console.error("Error fetching nearest match:", error);
    throw error;
  }
  return data;
}



async function storeEmbeddings() {
  const movies = await loadMovies();
  const formatted = movies.map(formatMovieToChunk);
  const chunks = await splitIntoChunks(formatted);
  await processChunksAndStore(chunks);

  console.log("✅ All movie chunks embedded and stored to Supabase.");
}


// initalize chat completions
export async function getChatCompletions(inputText, query) {
  const chatMessages = [
    {
      role: "system",
      content: `You are a passionate movie expert who specializes in giving recommendations.

      You will receive:
      1. A context containing movie details (title, description, genre, cast, etc.)
      2. A user question asking for recommendations.
      
      Your job is to answer the question by using **only the given context**.
      Respond with a **JSON array**. Each item should be a JSON object with:
      - "title": the movie's name
      - "year" : the release year of the movie
      - "description": a short summary based on the context
      - "note": an optional comment or highlight from the context (if available)
      
      Example output:
      [
        {
          "title": "Inception",
          "year": 2020,
          "description": "A mind-bending thriller where a team enters dreams to implant ideas.",
          "note": "Directed by Christopher Nolan."
        },
        {
          "title": "Interstellar",
          "year": 2024,
          "description": "Two astronauts travel through a wormhole in search of a new home for humanity.",
          "note": "Features emotional moments and scientific themes."
        }
      ]
      
      If no relevant answer can be found in the context, respond with:
      "Sorry, I don't know the answer."
      
      Do not make up any movie details that are not explicitly found in the context. Be concise and accurate.`
      
    },
  ];

  chatMessages.push({
    role: "user",
    content: `Context: ${inputText} Question: ${query}`,
  });
  // console.log(chatMessages);

  try {
    const response = await fetch(
      "https://api.fireworks.ai/inference/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "fw_3ZHY3YcWXby7iC2Xsm3DErad",
        },
        body: JSON.stringify({
          model: "accounts/fireworks/models/llama-v3p1-405b-instruct",
          max_tokens: 16384,
          top_p: 1,
          top_k: 40,
          presence_penalty: 0,
          frequency_penalty: 0.5,
          temperature: 0.5,
          messages: chatMessages,
        }),
      }
    );
    const data = await response.json();
    const answer = data.choices[0].message.content;
    console.log("LLM answer:", answer);
    let parsed;
    try {
      parsed = JSON.parse(answer);
    } catch (e) {
      console.error("❌Failed to parse LLM reply:", e.message);
      parsed = []; // hoặc null tùy bạn xử lý fallback
    }
    console.log("Parsed answer:", parsed);
    return parsed;


  } catch (error) {
    console.error("Error in getChatCompletions:", error);
    throw error;
  }
}
