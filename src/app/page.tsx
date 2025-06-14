import PageMessage from "@/components/page-message";
import axiosClient from "@/lib/axios";
import { ApiResponse } from "@/types";
import { Metadata } from "next";
import { SearchResponse as PodcastApiSearchResponse } from "podcast-api";
import PodcastsList from "./_components/podcasts-list";

export const metadata: Metadata = {
  title: "Podcast Summarizer",
  description:
    "Effortlessly generate concise summaries of your favorite podcasts.",
};

const PAGE_SIZE = 10;

export default async function Home() {
  const initOffset = 0;
  const initQuery = "Star wars";
  let initPodcastSearchResponse: PodcastApiSearchResponse | null = null;
  let message: string | null = null;

  try {
    const response = await axiosClient.get(
      `/api/podcasts?offset=${initOffset}&page_size=${PAGE_SIZE}&search=${initQuery}`
    );
    initPodcastSearchResponse =
      response?.data as ApiResponse<PodcastApiSearchResponse>;
  } catch (error: unknown) {
    message =
      error instanceof Error ? error.message : "An unknown error occurred";
  }

  if (message) {
    return <PageMessage message={message} />;
  }
  return (
    <div className="w-full">
      <div className="container">
        <PodcastsList
          pageSize={PAGE_SIZE}
          initQuery={initQuery}
          initOffset={initOffset}
          initPodcastSearchResponse={initPodcastSearchResponse}
        />
      </div>
    </div>
  );
}
