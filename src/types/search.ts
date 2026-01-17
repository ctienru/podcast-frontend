export type Show = {
  podcastId: string;
  title: string;
  description?: string;
  language?: string;
  publisher: string;
  imageUrl?: string;
  episodeCount?: number;
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
    podcastId: string;
    title: string;
    publisher: string;
    imageUrl?: string;
  };
};

export type SearchResult = Show | Episode;

export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};