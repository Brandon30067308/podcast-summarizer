"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  forcePathStyle: false,
  useAccelerateEndpoint: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(filePath: string, key: string) {
  const fileStream = fs.createReadStream(filePath);
  const stats = await fs.promises.stat(filePath);
  const fileSize = stats.size / (1024 * 1024);

  console.log("file size ", fileSize);

  if (fileSize >= 10) {
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.TRANSCRIBE_BUCKET_NAME!,
        Key: key,
        Body: fileStream,
      },
      queueSize: fileSize < 10 ? 1 : fileSize <= 15 ? 2 : 3,
      partSize:
        fileSize < 10
          ? fileSize
          : fileSize <= 15
            ? (fileSize / 2) * 1024 * 1024
            : 5 * 1024 * 1024,
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
      })
    );
  }

  return `s3://${process.env.TRANSCRIBE_BUCKET_NAME}/${key}`;
}
