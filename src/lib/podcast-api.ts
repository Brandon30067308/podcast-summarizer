import { Client as PodcastApiClient } from "podcast-api";

export const postApiClient = PodcastApiClient({
  apiKey: process.env.LISTEN_API_KEY!,
});
