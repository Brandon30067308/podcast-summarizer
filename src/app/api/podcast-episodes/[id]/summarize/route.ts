import axiosClient from "@/lib/axios";
import { postApiClient } from "@/lib/podcast-api";
import { prisma } from "@/lib/prisma";
import { ChatRole } from "@/types";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const episodeId = (await params).id;

    let episodeSummary = await prisma.podcastEpisodeSummary.findFirst({
      where: {
        podcastEpisodeId: episodeId,
      },
    });

    if (episodeSummary && episodeSummary.completed) {
      return NextResponse.json({ summary: episodeSummary });
    }

    const podcastEpisode = (
      await postApiClient.fetchEpisodeById({
        id: episodeId,
        show_transcript: 1,
      })
    )?.data;

    if (!podcastEpisode)
      return NextResponse.json(
        { error: "Podcast episode not found." },
        { status: 404 }
      );

    const transcript =
      episodeSummary?.transcript ??
      (
        await axiosClient.post(`/api/transcribe`, {
          url: podcastEpisode.audio,
        })
      ).data.transcript;

    if (!transcript) {
      return NextResponse.json(
        { error: "Failed to transcribe podcast episode" },
        { status: 500 }
      );
    }

    const systemMessage = {
      role: "system" as ChatRole,
      content: `You are a helpful assistant that summarizes podcast episodes. You will be given a podcast episode and you will need to summarize it. You will be given the episode title, description, and transcript. You will need to summarize the episode in a way that is easy to understand and engaging.
      
          Response Format Requirements:
          1. Your response must be a string in markdown format.

          2. Markdown Formatting Rules:
            - Use # for headers
            - Use * for bullet points
            - Use ** for bold text
            - Use > for quotes
            - Ensure all markdown tags are properly closed

          3. Do not include any supporting text in your response and limit your response to 700 words.
          `,
    };
    const userMessage = {
      role: "user" as ChatRole,
      content: `Title: ${podcastEpisode.title_original}\nDescription: ${
        podcastEpisode?.description_original ?? ""
      }\nTranscript: ${transcript}`,
    };

    if (!episodeSummary) {
      episodeSummary = await prisma.podcastEpisodeSummary.create({
        data: {
          podcastEpisodeId: episodeId,
          podcastId: podcastEpisode.id,
          title: podcastEpisode.title,
          transcript,
          summary: "",
          completed: false,
        },
      });
    }

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: [systemMessage, userMessage],
    });

    const stream = result.fullStream;
    const encoder = new TextEncoder();
    let buffer = "";
    let parsed: string | null = null;
    let latestDate = Date.now();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (!chunk.type) continue;

            if (chunk.type === "error") {
              throw new Error(
                (chunk as unknown as { error: string })?.error ??
                  "Unknown error"
              );
            }

            buffer +=
              (chunk as unknown as { textDelta: string })?.textDelta ?? "";
            controller.enqueue(
              encoder.encode(
                (chunk as unknown as { textDelta: string })?.textDelta ?? ""
              )
            );

            try {
              parsed = buffer as string;

              const now = Date.now();
              if (parsed && now - latestDate > 5000) {
                latestDate = now;
                await prisma.podcastEpisodeSummary.update({
                  where: {
                    id: episodeSummary.id,
                  },
                  data: {
                    summary: parsed,
                  },
                });
              }
            } catch (error) {
              console.warn(error);
            }
          }
        } catch (error: unknown) {
          throw error;
        } finally {
          if (parsed) {
            await prisma.podcastEpisodeSummary.update({
              where: {
                id: episodeSummary.id,
              },
              data: {
                summary: parsed,
                completed: true,
              },
            });
          }
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to summarize podcast episode" },
      { status: 500 }
    );
  }
}
