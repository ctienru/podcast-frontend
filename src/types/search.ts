// Search modes for episode search
export type SearchMode = "bm25" | "knn" | "hybrid" | "exact";

export type Show = {
  showId: string;
  title: string;
  description?: string;
  language?: string;
  publisher: string;
  imageUrl?: string;
  episodeCount?: number;

  highlights?: {
    title?: string[];
    description?: string[];
  };
};

export type Episode = {
  episodeId: string;
  title: string;
  description?: string;

  highlights?: {
    title?: string[];
    description?: string[];
  };

  publishedAt: string;        // ISO 8601
  durationSec?: number;
  imageUrl?: string;

  podcast: {
    showId: string;
    title: string;
    publisher: string;
    imageUrl?: string;
    externalUrl?: {
      applePodcastUrl?: string;
    };
  };
};

export type SearchResult = Show | Episode;

export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type RankingsItem = {
  rank: number;
  showId: string;
  title: string;
  publisher: string;
  imageUrl?: string;
  language?: string;
  episodeCount?: number;
  externalUrls?: {
    apple_podcasts?: string;
  };
};

export type RankingsResult = {
  country: string;
  type: string;
  items: RankingsItem[];
  updatedAt?: string;  // ISO 8601
};