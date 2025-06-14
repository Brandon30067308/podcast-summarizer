import MarkdownRenderer from "@/components/markdown";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { formatDuration } from "date-fns/formatDuration";
import { Brain, PlayIcon } from "lucide-react";
import Image from "next/image";
import { PodcastEpisode } from "podcast-api";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  episode: PodcastEpisode;
};

export default function PodcastCard({ episode }: Props) {
  const [summary, setSummary] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  async function handleSummarize() {
    try {
      setIsSummarizing(true);
      toast.loading(
        `Summarizing "${episode.title_original}" from "${episode.podcast.title_original}"...`,
        { id: episode.id }
      );

      const initResponse = await axios.get(
        `/api/podcast-episodes/${episode.id}`
      );

      const existingEpisodeSummary = initResponse.data?.summary;
      if (existingEpisodeSummary) {
        setSummary(existingEpisodeSummary);
        setShowSummary(true);
        return;
      }

      const response = await fetch(
        `/api/podcast-episodes/${episode.id}/summarize`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to start summarization");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let summary = "";

      setShowSummary(true);
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          summary += decoder.decode(value, { stream: true });
          setSummary(summary);
        }
      } finally {
        reader.releaseLock();
        if (!summary) {
          throw new Error("Failed to summarize podcast episode");
        }
      }
    } catch (error: unknown) {
      console.error("error ", error);
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      toast.dismiss(episode.id);
      setIsSummarizing(false);
    }
  }

  return (
    <>
      <Card key={episode.id} className="overflow-hidden pt-0 shadow-none">
        <CardHeader className="p-0">
          <div className="relative aspect-square w-full">
            <Image
              src={episode.image}
              alt={episode.podcast.title_original}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="line-clamp-2 font-semibold">
            {episode.title_original}
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {episode.podcast.publisher_original}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-muted-foreground text-xs">
              {formatDistanceToNow(episode.pub_date_ms, { addSuffix: true })}
            </span>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="text-muted-foreground text-xs">
              {formatDuration({
                hours: Math.floor(episode.audio_length_sec / 3600),
                minutes: Math.floor((episode.audio_length_sec % 3600) / 60),
              })}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-1 items-end p-4 pt-0">
          <div className="grid w-full grid-cols-2 gap-2">
            <Button asChild variant="secondary" size="lg">
              <a
                href={episode.listennotes_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <PlayIcon className="size-4" />
                Listen Now
              </a>
            </Button>
            <Button
              disabled={isSummarizing}
              size="lg"
              onClick={handleSummarize}
            >
              <Brain className="size-4" />
              Summarize
            </Button>
          </div>
        </CardFooter>
      </Card>
      <Dialog open={showSummary && !!summary} onOpenChange={setShowSummary}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Summary for {episode.title_original}</DialogTitle>
          </DialogHeader>
          <MarkdownRenderer
            content={summary ?? "No summary available"}
            className="chat-mdx font-sans-alt font-normal"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
