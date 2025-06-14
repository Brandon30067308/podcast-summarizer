"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type Props = {
  query: string;
  setQuery: (query: string) => void;
};

export default function PodcastSearch({ query, setQuery }: Props) {
  return (
    <div className="relative flex h-12 w-full max-w-xs flex-col gap-4">
      <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
        <Search className="size-4" />
      </span>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a podcast"
        className="h-full pl-10"
      />
    </div>
  );
}
