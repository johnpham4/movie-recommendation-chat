import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getEmbeddingFromOpenAI } from "./config.js";
import { getChatCompletions, findNearestMatch, findThumbnailByTitle } from "./utils.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json()); 

app.post("/chat", async (req, res) => {
  console.log("Received body:", req.body);
  const { people, time, favoriteMovie, mood, newClassic, islandPerson } = req.body;

  if (!people || !time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const userQuery = `
    We have ${people} people with ${time} minutes.
    They love the movie "${favoriteMovie}".
    They want something ${newClassic}, and the mood is "${mood}".
    They would love to be stranded with: ${islandPerson}.
  `;

  try {
    const embedding = await getEmbeddingFromOpenAI(userQuery);
    const match = await findNearestMatch(embedding);
    const thumbnail = match[0].thumbnail;
    const reply = await getChatCompletions(match, userQuery);
    
    console.log("Reply:", reply);

    const mappedMovies = reply.map(async (movie, index) => ({
      title: movie.title,
      year: movie.year,
      description: movie.description,
      thumbnail: await findThumbnailByTitle(movie.title),
      note: movie.note || null,
    }));
    
    const resolvedMovies = await Promise.all(mappedMovies);
    const data = resolvedMovies.filter((movie) => movie.thumbnail !== null);

    console.log("Data:", data);

    return res.status(200).json({
      reply: data
    });
  } catch (error) {
    console.error("Error in /chat:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
