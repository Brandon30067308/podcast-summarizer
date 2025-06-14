import { uploadToS3 } from "@/lib/aws/s3";
import { transcribeAudio } from "@/lib/aws/transcribe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const key = `${Date.now()}_${crypto.randomUUID()}`;

    const s3Uri = await uploadToS3(url, key);

    const transcript = await transcribeAudio(s3Uri, key);

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("error transcribing audio ", error);
    return NextResponse.json(
      { error: "Failed to process audio file" },
      { status: 500 }
    );
  }
}
