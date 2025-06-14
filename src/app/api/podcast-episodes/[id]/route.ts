import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const episodeId = (await params).id;

    const episodeSummary = await prisma.podcastEpisodeSummary.findFirst({
      where: {
        podcastEpisodeId: episodeId,
      },
    });

    return NextResponse.json({ ...(episodeSummary ?? {}) });
  } catch (error) {
    console.error("Error fetching podcast episode summary", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
