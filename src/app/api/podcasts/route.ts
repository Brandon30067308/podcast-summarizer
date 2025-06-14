import { postApiClient } from "@/lib/podcast-api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const offset = searchParams.get("offset") || 0;
    const pageSize = searchParams.get("page_size") || 10;
    const search = searchParams.get("search") || "";

    const searchResult = await postApiClient.search({
      q: search,
      type: "episode",
      language: "English",
      offset: Number(offset),
      page_size: Number(pageSize),
    });

    if (!searchResult?.data) {
      return NextResponse.json(
        {
          error: "No data found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(searchResult.data, { status: 200 });
  } catch (error: unknown) {
    console.log("error fetching podcasts ", error);

    return NextResponse.json(
      {
        error: "Failed to fetch podcasts.",
      },
      { status: 500 }
    );
  }
}
