declare module "podcast-api" {
  interface Podcast {
    id: string;
    image: string;
    genre_ids: number[];
    thumbnail: string;
    listen_score: number;
    title_original: string;
    listennotes_url: string;
    title_highlighted: string;
    publisher_original: string;
    publisher_highlighted: string;
    listen_score_global_rank: string;
  }

  interface PodcastEpisode {
    id: string;
    rss: string;
    link: string;
    audio: string;
    image: string;
    podcast: Podcast;
    itunes_id: number;
    thumbnail: string;
    pub_date_ms: number;
    guid_from_rss: string;
    title: string;
    title_original: string;
    listennotes_url: string;
    audio_length_sec: number;
    explicit_content: boolean;
    title_highlighted: string;
    description_original: string;
    description_highlighted: string;
    transcripts_highlighted: string[];
  }

  interface SearchResponse {
    took: number;
    count: number;
    total: number;
    results: PodcastEpisode[];
    next_offset: number;
  }

  interface SearchParams {
    q?: string;
    sort_by_date?: boolean | 0 | 1;
    type?: "episode" | "podcast";
    offset?: number;
    len_min?: number;
    len_max?: number;
    genre_ids?: string;
    published_before?: number;
    published_after?: number;
    only_in?: string;
    language?: string;
    safe_mode?: boolean | 0 | 1;
    unique_podcasts?: boolean | 0 | 1;
    interviews_only?: boolean | 0 | 1;
    sponsored_only?: boolean | 0 | 1;
    page_size?: number;
  }

  export function Client(config: { apiKey: string }): {
    search(params: SearchParams): Promise<{ data: SearchResponse }>;
    fetchEpisodeById(params: {
      id: string;
      show_transcript: 0 | 1;
    }): Promise<{ data: PodcastEpisode }>;
  };
}
