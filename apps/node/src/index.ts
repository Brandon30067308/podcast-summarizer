import cors from "cors";
import { config } from "dotenv";
import express from "express";
import podcastEpisodesRouter from "./routes/podcast-episodes";
import transcribeRouter from "./routes/transcribe";

config();

const app = express();
const port = process.env.PORT || 7070;

app.use(cors());
app.use(express.json());

app.use("/api/podcast-episodes", podcastEpisodesRouter);
app.use("/api/transcribe", transcribeRouter);

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
