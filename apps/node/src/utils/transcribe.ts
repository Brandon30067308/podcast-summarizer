"use server";

import {
  GetTranscriptionJobCommand,
  StartTranscriptionJobCommand,
  TranscribeClient,
} from "@aws-sdk/client-transcribe";
import axios from "axios";

const transcribe = new TranscribeClient({ region: process.env.AWS_REGION });

export async function transcribeAudio(s3Uri: string, jobName: string) {
  await transcribe.send(
    new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      LanguageCode: "en-US",
      MediaFormat: "mp3",
      Media: {
        MediaFileUri: s3Uri,
      },
      OutputBucketName: process.env.TRANSCRIBE_BUCKET_NAME!,
    })
  );

  let status = "";
  let uri = "";
  while (status !== "COMPLETED" && status !== "FAILED") {
    const { TranscriptionJob } = await transcribe.send(
      new GetTranscriptionJobCommand({ TranscriptionJobName: jobName })
    );

    status = TranscriptionJob?.TranscriptionJobStatus || "";
    uri = TranscriptionJob?.Transcript?.TranscriptFileUri || "";
    console.log(`Status: ${status}`);
    await new Promise((res) => setTimeout(res, 4000));
  }

  if (status === "COMPLETED") {
    const res = await axios.get(uri);
    return res.data.results.transcripts
      .map((t: { transcript: string }) => t.transcript)
      .join("\n");
  }
  throw new Error("Transcription failed");
}
