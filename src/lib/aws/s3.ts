"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import axios from "axios";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(url: string, key: string) {
  const head = await axios.head(url);
  const contentLength = head.headers["content-length"];
  const fileSizeBytes = contentLength ? parseInt(contentLength) : 0;
  const fileSize = fileSizeBytes >= 1 ? fileSizeBytes / (1024 * 1024) : 0;

  console.log("file size ", fileSize);

  const response = await axios.get(url, { responseType: "stream" });
  const fileStream = response.data;

  if (fileSize >= 10) {
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.TRANSCRIBE_BUCKET_NAME!,
        Key: key,
        Body: fileStream,
      },
      queueSize: fileSize <= 15 ? 2 : 3,
      partSize: fileSize <= 15 ? fileSize * 1024 * 1024 : 5 * 1024 * 1024,
      leavePartsOnError: false,
    });

    upload.on("httpUploadProgress", (progress) => {
      console.log(`Uploaded ${progress.loaded} / ${progress.total}`);
    });

    await upload.done();
  } else {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.TRANSCRIBE_BUCKET_NAME!,
        Key: key,
        Body: fileStream,
        ContentType: head.headers["content-type"] || "audio/mpeg",
      })
    );
  }

  return `s3://${process.env.TRANSCRIBE_BUCKET_NAME}/${key}`;
}
