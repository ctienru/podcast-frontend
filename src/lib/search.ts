import type { Show, Episode, PagedResult, RankingsResult, SearchMode, ShowDetail, LangFilter } from "@/types/search";

/* =========================
 * Error
 * ========================= */
export class SearchApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "SearchApiError";
    this.status = status;
  }
}

/* =========================
 * Types
 * ========================= */
interface ApiResponse<T> {
  status: "ok" | "partial_success" | "error";
  warning?: string;
  data?: {
    page?: number;
    size?: number;
    total?: number;
    items?: T[];
  };
  error?: {
    message?: string;
  };
}

/* =========================
 * Helpers
 * ========================= */

function getFrontendApiUrl(path: string, baseUrl?: string): string {
  if (typeof window !== "undefined") {
    return path;
  }

  const resolvedBaseUrl = (baseUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${resolvedBaseUrl}${path}`;
}

function ensureOkApiResponse<T>(
  json: ApiResponse<T>,
  fallbackPage: number,
  fallbackSize: number
): PagedResult<T> {
  if (!json || typeof json !== "object") {
    throw new SearchApiError("Invalid API response", 500);
  }

  if (json.status === "error") {
    throw new SearchApiError(
      json.error?.message ?? "Search API error",
      400
    );
  }

  // ok / partial_success 都視為成功
  const data = json.data ?? {};

  return {
    page: data.page ?? fallbackPage,
    pageSize: data.size ?? fallbackSize,
    total: data.total ?? 0,
    items: Array.isArray(data.items) ? data.items : [],
  };
}

/* =========================
 * Shows (discovery, page = 1 only)
 * ========================= */
export type ShowSearchMode = "bm25" | "knn" | "hybrid";

const TRANSIENT_UPSTREAM_STATUSES = new Set([502, 503, 504]);

export async function searchShowsFromApi({
  query,
  pageSize,
  language,
  mode,
  baseUrl,
}: {
  query: string;
  pageSize: number;
  language?: string[];
  mode?: ShowSearchMode;
  baseUrl?: string;
}): Promise<{ result: PagedResult<Show>; warning: string | null }> {
  const apiUrl = getFrontendApiUrl("/api/search/shows", baseUrl);
  const res = await fetch(
    apiUrl,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        q: query,
        page: 1, // discovery only
        size: pageSize,
        ...(language?.length && { language }),
        ...(mode && { mode }),
      }),
    }
  );

  if (!res.ok) {
    if (TRANSIENT_UPSTREAM_STATUSES.has(res.status)) {
      return {
        result: {
          page: 1,
          pageSize,
          total: 0,
          items: [],
        },
        warning: `Show search temporarily unavailable (${res.status})`,
      };
    }

    throw new SearchApiError(
      `Show search API error: ${res.status}`,
      res.status
    );
  }

  const json = await res.json();
  const result = ensureOkApiResponse<Show>(json, 1, pageSize);
  const warning: string | null = json.status === "partial_success" ? (json.warning ?? null) : null;

  return { result, warning };
}

/* =========================
 * Episodes
 * ========================= */
export async function searchEpisodesFromApi({
  query,
  page,
  pageSize,
  lang,
  mode,
  baseUrl,
}: {
  query: string;
  page: number;
  pageSize: number;
  lang: LangFilter;
  mode?: SearchMode;
  baseUrl?: string;
}): Promise<{ result: PagedResult<Episode>; searchRequestId: string; warning: string | null }> {
  const apiUrl = getFrontendApiUrl("/api/search/episodes", baseUrl);
  const res = await fetch(
    apiUrl,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        q: query,
        page,
        size: pageSize,
        lang,
        ...(mode && { mode }),
      }),
    }
  );

  if (!res.ok) {
    throw new SearchApiError(
      `Episode search API error: ${res.status}`,
      res.status
    );
  }

  const json = await res.json();
  const result = ensureOkApiResponse<Episode>(json, page, pageSize);
  const searchRequestId: string = json.searchRequestId ?? "";
  const warning: string | null = json.status === "partial_success" ? (json.warning ?? null) : null;

  return { result, searchRequestId, warning };
}

/* =========================
 * Rankings
 * ========================= */
export async function getRankingsFromApi({
  region = "tw",
  type = "podcast",
  limit = 20,
  baseUrl,
}: {
  region?: string;
  type?: string;
  limit?: number;
  baseUrl?: string;
}): Promise<RankingsResult> {
  const apiUrl = getFrontendApiUrl("/api/rankings", baseUrl);
  const params = new URLSearchParams({
    region,
    type,
    limit: String(limit),
  });

  const res = await fetch(`${apiUrl}?${params}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new SearchApiError(
      `Rankings API error: ${res.status}`,
      res.status
    );
  }

  const json = await res.json();

  if (!json || typeof json !== "object") {
    throw new SearchApiError("Invalid API response", 500);
  }

  if (json.status === "error") {
    throw new SearchApiError(
      json.error?.message ?? "Rankings API error",
      400
    );
  }

  if (!json.data || typeof json.data !== "object") {
    return { region, type, items: [] };
  }

  return {
    ...json.data,
    region: json.data.region ?? json.data.country ?? region,
  };
}

/* =========================
 * Shows Batch
 * ========================= */
export async function batchGetShowDetailsFromApi(
  showIds: string[],
  baseUrl?: string
): Promise<Record<string, ShowDetail>> {
  if (showIds.length === 0) {
    return {};
  }

  const apiUrl = getFrontendApiUrl("/api/shows/batch", baseUrl);
  const params = new URLSearchParams({
    ids: showIds.join(","),
  });

  const res = await fetch(`${apiUrl}?${params}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new SearchApiError(
      `Batch shows API error: ${res.status}`,
      res.status
    );
  }

  const json = await res.json();

  if (!json || typeof json !== "object") {
    throw new SearchApiError("Invalid API response", 500);
  }

  if (json.status === "error") {
    throw new SearchApiError(
      json.error?.message ?? "Batch shows API error",
      400
    );
  }

  return json.data ?? {};
}
