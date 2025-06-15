"use client";

import { Button } from "@/components/ui/button";
import { ApiResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { SearchResponse as PodcastApiSearchResponse } from "podcast-api";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import PodcastCard from "./podcast-card";
import PodcastSearch from "./podcast-search";

type Props = {
  pageSize: number;
  initQuery: string;
  initOffset: number;
  initPodcastSearchResponse: PodcastApiSearchResponse | null;
};

export default function PodcastsList({
  pageSize,
  initQuery,
  initOffset,
  initPodcastSearchResponse,
}: Props) {
  const [offset, setOffset] = useState(initOffset);
  const [query, setQuery] = useState(initQuery);
  const [debouncedQuery] = useDebounce(query, 600);
  const podcastsListRef = useRef<HTMLDivElement>(null);

  const { isFetching, error, data } = useQuery<PodcastApiSearchResponse>({
    queryKey: ["podcasts", offset, debouncedQuery],
    initialData: initPodcastSearchResponse ?? undefined,
    queryFn: async () => {
      try {
        const res = await axios.get<ApiResponse<PodcastApiSearchResponse>>(
          `${process.env.NEXT_PUBLIC_NODE_API_URL}/api/podcast-episodes?offset=${offset}&page_size=${pageSize}&search=${debouncedQuery}`
        );
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          throw new Error(
            (err.response.data as ApiResponse<PodcastApiSearchResponse>)
              ?.error ?? "An unknown error occurred"
          );
        }
        throw err;
      }
    },
  });

  const podcastEpisodes = data?.results || [];
  const nextOffset = data?.next_offset;

  useEffect(() => {
    setOffset(0);
  }, [debouncedQuery]);

  /*useEffect(() => {
    if (podcastsListRef.current) {
      podcastsListRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data]);*/

  return (
    <div ref={podcastsListRef} className="flex flex-col gap-6">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Podcast Summarizer</h1>
          <p className="text-muted-foreground text-sm font-medium">
            Effortlessly generate concise summaries of your favorite podcasts.
          </p>
        </div>
        <PodcastSearch query={query} setQuery={setQuery} />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {podcastEpisodes.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {podcastEpisodes.map((episode) => (
                <PodcastCard key={episode.id} episode={episode} />
              ))}
            </div>
          )}
        </div>
        {error && (
          <p className="text-destructive text-center text-sm font-medium">
            {error.message}
          </p>
        )}
        {isFetching && (
          <div className="text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            <p className="text-muted-foreground text-sm font-medium">
              Loading podcasts...
            </p>
          </div>
        )}
        <div className="bg-background/80 sticky bottom-0 flex w-full items-center justify-center gap-4 py-6 backdrop-blur-sm">
          <Button
            disabled={offset < pageSize}
            variant="outline"
            onClick={() => setOffset((prevOffset) => prevOffset - pageSize)}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <Button
            disabled={!nextOffset}
            variant="outline"
            onClick={() => setOffset(nextOffset ?? 0)}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
