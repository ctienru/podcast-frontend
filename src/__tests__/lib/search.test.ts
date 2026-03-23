import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  SearchApiError,
  searchShowsFromApi,
  searchEpisodesFromApi,
  getRankingsFromApi,
} from "@/lib/search";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("SearchApiError", () => {
  it("should create error with message and status", () => {
    const error = new SearchApiError("Test error", 404);

    expect(error.message).toBe("Test error");
    expect(error.status).toBe(404);
    expect(error.name).toBe("SearchApiError");
  });

  it("should be instanceof Error", () => {
    const error = new SearchApiError("Test", 500);
    expect(error).toBeInstanceOf(Error);
  });
});

describe("searchShowsFromApi", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return PagedResult on successful response", async () => {
    const mockResponse = {
      status: "ok",
      data: {
        items: [
          {
            showId: "123",
            title: "Test Podcast",
            publisher: "Test Publisher",
          },
        ],
        total: 1,
        page: 1,
        size: 10,
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await searchShowsFromApi({ query: "test", pageSize: 10 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("Test Podcast");
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  it("should throw SearchApiError on HTTP error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(
      searchShowsFromApi({ query: "test", pageSize: 10 })
    ).rejects.toThrow("Show search API error: 500");
  });

  it("should throw SearchApiError on API error status", async () => {
    const mockResponse = {
      status: "error",
      error: { message: "Invalid query" },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await expect(
      searchShowsFromApi({ query: "test", pageSize: 10 })
    ).rejects.toThrow("Invalid query");
  });

  it("should return empty array when data is empty", async () => {
    const mockResponse = {
      status: "ok",
      data: {},
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await searchShowsFromApi({ query: "test", pageSize: 10 });

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("should send correct request parameters", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: "ok", data: {} }),
    });

    await searchShowsFromApi({ query: "podcast", pageSize: 5 });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/search/shows"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "podcast", page: 1, size: 5 }),
      })
    );
  });
});

describe("searchEpisodesFromApi", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("should return PagedResult with correct pagination", async () => {
    const mockResponse = {
      status: "ok",
      searchRequestId: "req-abc",
      data: {
        items: [
          {
            episodeId: "ep-1",
            title: "Episode 1",
            publishedAt: "2024-01-01",
            podcast: { showId: "123", title: "Test", publisher: "Pub" },
          },
        ],
        total: 100,
        page: 2,
        size: 10,
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = await searchEpisodesFromApi({
      query: "test",
      page: 2,
      pageSize: 10,
      lang: "zh-tw",
    });

    expect(result.page).toBe(2);
    expect(result.total).toBe(100);
    expect(result.items).toHaveLength(1);
  });

  it("should throw SearchApiError on HTTP 404", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(
      searchEpisodesFromApi({ query: "test", page: 1, pageSize: 10, lang: "zh-tw" })
    ).rejects.toThrow("Episode search API error: 404");
  });

  it("should return result and searchRequestId", async () => {
    const mockResponse = {
      status: "ok",
      searchRequestId: "req-uuid-123",
      data: {
        items: [{ episodeId: "ep-1", title: "Ep", publishedAt: "2024-01-01", podcast: { showId: "s1", title: "P", publisher: "Pub" } }],
        total: 1,
        page: 1,
        size: 10,
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result, searchRequestId } = await searchEpisodesFromApi({
      query: "test",
      page: 1,
      pageSize: 10,
      lang: "zh-tw",
    });

    expect(searchRequestId).toBe("req-uuid-123");
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("should send lang as single string, not language array", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: "ok", searchRequestId: "r1", data: {} }),
    });

    await searchEpisodesFromApi({ query: "test", page: 1, pageSize: 10, lang: "zh-cn" });

    const body = JSON.parse(
      (mockFetch.mock.calls[0][1] as { body: string }).body
    );
    expect(body.lang).toBe("zh-cn");
    expect(body.language).toBeUndefined();
  });

  it("should send zh-both correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: "ok", searchRequestId: "r2", data: {} }),
    });

    await searchEpisodesFromApi({ query: "test", page: 1, pageSize: 10, lang: "zh-both" });

    const body = JSON.parse(
      (mockFetch.mock.calls[0][1] as { body: string }).body
    );
    expect(body.lang).toBe("zh-both");
  });

  it("should pass page parameter correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: "ok", searchRequestId: "r3", data: {} }),
    });

    await searchEpisodesFromApi({ query: "search", page: 3, pageSize: 20, lang: "en" });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({ q: "search", page: 3, size: 20, lang: "en" }),
      })
    );
  });

  it("should pass mode parameter when provided", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: "ok", searchRequestId: "r4", data: {} }),
    });

    await searchEpisodesFromApi({ query: "test", page: 1, pageSize: 10, lang: "zh-tw", mode: "exact" });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({ q: "test", page: 1, size: 10, lang: "zh-tw", mode: "exact" }),
      })
    );
  });

  it("should pass bm25 mode correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: "ok", searchRequestId: "r5", data: {} }),
    });

    await searchEpisodesFromApi({ query: "keyword search", page: 1, pageSize: 10, lang: "zh-tw", mode: "bm25" });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({ q: "keyword search", page: 1, size: 10, lang: "zh-tw", mode: "bm25" }),
      })
    );
  });

  it("should not include mode when undefined", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: "ok", searchRequestId: "r6", data: {} }),
    });

    await searchEpisodesFromApi({ query: "test", page: 1, pageSize: 10, lang: "en" });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({ q: "test", page: 1, size: 10, lang: "en" }),
      })
    );
  });
});

describe("getRankingsFromApi", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("should return rankings data on success", async () => {
    const mockResponse = {
      status: "ok",
      data: {
        country: "tw",
        type: "podcast",
        items: [
          { rank: 1, showId: "1", title: "Top Podcast", publisher: "Pub 1" },
        ],
        updatedAt: "2024-01-01T00:00:00Z",
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await getRankingsFromApi({ country: "tw", type: "podcast" });

    expect(result.country).toBe("tw");
    expect(result.type).toBe("podcast");
    expect(result.items).toHaveLength(1);
    expect(result.items[0].rank).toBe(1);
  });

  it("should use default parameters when not provided", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: "ok",
          data: { country: "tw", type: "podcast", items: [] },
        }),
    });

    await getRankingsFromApi({});

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/country=tw.*type=podcast.*limit=20/),
      expect.any(Object)
    );
  });

  it("should throw SearchApiError on API error", async () => {
    const mockResponse = {
      status: "error",
      error: { message: "Rankings unavailable" },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await expect(
      getRankingsFromApi({ country: "tw", type: "podcast" })
    ).rejects.toThrow("Rankings unavailable");
  });

  it("should throw on invalid response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(null),
    });

    await expect(getRankingsFromApi({})).rejects.toThrow("Invalid API response");
  });

  it("should handle HTTP errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
    });

    await expect(getRankingsFromApi({})).rejects.toThrow(
      "Rankings API error: 503"
    );
  });

  it("should return default values when data is missing", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: "ok" }),
    });

    const result = await getRankingsFromApi({ country: "us", type: "episode" });

    expect(result.country).toBe("us");
    expect(result.type).toBe("episode");
    expect(result.items).toEqual([]);
  });
});
