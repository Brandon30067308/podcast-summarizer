import axios from "axios";
import { spawn } from "child_process";
import express, { Application, Request, Response, Router } from "express";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import path from "path";
import { uploadToS3 } from "../utils/s3";
import { transcribeAudio } from "../utils/transcribe";

const FFMPEG_PATH = (ffmpegPath ?? "").replace(
  ".pnpm/ffmpeg-static@5.2.0/node_modules/",
  ""
);
const TEMP_DIR = path.join(process.cwd(), "tmp");

console.log("FFMPEG_PATH ", FFMPEG_PATH);

async function compressAudio(
  inputPath: string,
  outputPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      "-i",
      inputPath,
      "-b:a",
      "128k",
      "-ac",
      "1",
      "-y",
      outputPath,
    ];
    const ffmpeg = spawn(FFMPEG_PATH!, args);

    ffmpeg.stderr.on("data", (data) => console.error(data.toString()));
    ffmpeg.on("close", (code) => {
      if (code === 0) resolve(outputPath);
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
}

const router: Router = express.Router();

router.post("/", (async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR);
    }

    const cleanUp = [];
    const key = `${Date.now()}_${crypto.randomUUID()}`;
    const rawFilename = `raw-${key}.mp3`;
    const rawFilePath = path.join(TEMP_DIR, rawFilename);
    const compressedFilename = `compressed-${key}.mp3`;
    const compressedFilePath = path.join(TEMP_DIR, compressedFilename);

    cleanUp.push(rawFilePath, compressedFilePath);

    const response = await axios({
      method: "GET",
      url: url,
      responseType: "stream",
      timeout: 30000,
      maxContentLength: 200 * 1024 * 1024,
    });

    const writer = fs.createWriteStream(rawFilePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(rawFilePath));
      writer.on("error", reject);
    });
    await compressAudio(rawFilePath, compressedFilePath);

    console.log("upload start ", new Date().toLocaleTimeString());
    const s3Uri = await uploadToS3(compressedFilePath, compressedFilename);
    console.log("upload done ", new Date().toLocaleTimeString());

    console.log("transcribe start ", new Date().toLocaleTimeString());
    const transcript = await transcribeAudio(s3Uri, key);
    console.log("transcribe done ", new Date().toLocaleTimeString());

    return res.status(200).json({ transcript });
  } catch (error) {
    console.error("error transcribing audio ", error);
    return res.status(500).json({ error: "Failed to process audio file" });
  }
}) as Application);

export default router;
