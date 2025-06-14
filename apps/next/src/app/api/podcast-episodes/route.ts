import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_NODE_API_URL}/api/podcast-episodes?${searchParams.toString()}`
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    console.log("error fetching podcasts ", error);

    return NextResponse.json(
      {
        error: "Failed to fetch podcasts. Please try again later.",
      },
      { status: 500 }
    );
  }
}
