// Search modes for episode search
export type SearchMode = "bm25" | "knn" | "hybrid" | "exact";

/**
 * Language filter selected by the user.
 *
 * - "zh-tw"   Traditional Chinese (targets podcast-episodes-zh-tw index)
 * - "zh-cn"   Simplified Chinese  (targets podcast-episodes-zh-cn index)
 * - "en"      English             (targets podcast-episodes-en index)
 * - "zh-both" Both Chinese scripts (queries two indexes simultaneously, backend RRF merge, first 5 pages only)
 */
export type LangFilter = "zh-tw" | "zh-cn" | "en" | "zh-both";

/**
 * Language index value stored on an episode document.
 * Subset of LangFilter (excludes "zh-both", which is a query-time option only).
 */
export type EpisodeLanguage = "zh-tw" | "zh-cn" | "en";

/**
 * UI locale, matching next-intl routing config.
 */
export type AppLocale = "zh" | "en";

/**
 * Derives the default LangFilter from the URL locale.
 * zh locale → zh-tw; anything else → en
 */
export function defaultLangForLocale(locale: AppLocale): LangFilter {
  return locale === "zh" ? "zh-tw" : "en";
}

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
  language?: EpisodeLanguage;

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

export type ShowDetail = {
  showId: string;
  description?: string;
  categories?: string[];
  language?: string;
  episodeCount?: number;
};

export type RankingsItemEnriched = RankingsItem & {
  detail?: ShowDetail;
};

export type RankingsResult = {
  country: string;
  type: string;
  items: RankingsItem[];
  updatedAt?: string;  // ISO 8601
};
