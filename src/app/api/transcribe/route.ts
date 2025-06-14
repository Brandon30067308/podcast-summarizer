import { uploadToS3 } from "@/lib/aws/s3";
import { transcribeAudio } from "@/lib/aws/transcribe";
import axios from "axios";
import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

const FFMPEG_PATH = `${process.cwd()}${(ffmpegPath ?? "").split(/\s/)[0].replace("[project]", "").replace("index.js", "ffmpeg")}`;
const TEMP_DIR = path.join(process.cwd(), "tmp");

async function compressAudio(
  inputPath: string,
  outputPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = ["-i", inputPath, "-b:a", "64k", "-ac", "1", outputPath];
    const ffmpeg = spawn(FFMPEG_PATH!, args);

    ffmpeg.stderr.on("data", (data) => console.error(data.toString()));
    ffmpeg.on("close", (code) => {
      if (code === 0) resolve(outputPath);
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
}

export async function POST(req: Request) {
  const cleanUp: string[] = [];

  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR);
    }

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
      maxContentLength: 200 * 1024 * 1024,
    });

    const writer = fs.createWriteStream(rawFilePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(rawFilePath));
      writer.on("error", reject);
    });
    await compressAudio(rawFilePath, compressedFilePath);

    const s3Uri = await uploadToS3(compressedFilePath, compressedFilename);

    const transcript = await transcribeAudio(s3Uri, key);

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("error transcribing audio ", error);
    return NextResponse.json(
      { error: "Failed to process audio file" },
      { status: 500 }
    );
  } finally {
    cleanUp.forEach((file) => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  }
}
