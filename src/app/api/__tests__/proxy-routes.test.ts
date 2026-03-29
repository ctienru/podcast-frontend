import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as searchEpisodesPost } from "@/app/api/search/episodes/route";
import { POST as searchShowsPost } from "@/app/api/search/shows/route";
import { GET as rankingsGet } from "@/app/api/rankings/route";
import { GET as batchShowsGet } from "@/app/api/shows/batch/route";
import { POST as clickLogPost } from "@/app/api/logs/click/route";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("frontend api proxy routes", () => {
  const originalInternalBase = process.env.SEARCH_API_INTERNAL_BASE;

  beforeEach(() => {
    process.env.SEARCH_API_INTERNAL_BASE = "https://backend.example.com/api";
    mockFetch.mockReset();
  });

  afterEach(() => {
    process.env.SEARCH_API_INTERNAL_BASE = originalInternalBase;
    vi.restoreAllMocks();
  });

  it("forwards episode search body and content type", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "ok", data: { items: [] } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );

    const request = new Request("http://localhost:3000/api/search/episodes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ q: "ai", page: 1, size: 10, lang: "en" }),
    });

    const response = await searchEpisodesPost(request);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://backend.example.com/api/search/episodes",
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
        headers: expect.any(Headers),
        body: JSON.stringify({ q: "ai", page: 1, size: 10, lang: "en" }),
      })
    );
    expect((mockFetch.mock.calls[0][1] as { headers: Headers }).headers.get("content-type")).toBe("application/json");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok", data: { items: [] } });
  });

  it("forwards show search requests to the backend", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "ok", data: { items: [] } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );

    const request = new Request("http://localhost:3000/api/search/shows", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ q: "podcast", page: 1, size: 5 }),
    });

    await searchShowsPost(request);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://backend.example.com/api/search/shows",
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
      })
    );
  });

  it("preserves rankings query string and upstream status", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "ok", data: { items: [] } }), {
        status: 206,
        headers: { "content-type": "application/json" },
      })
    );

    const request = new Request("http://localhost:3000/api/rankings?region=tw&type=podcast&limit=20");
    const response = await rankingsGet(request);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://backend.example.com/api/rankings?region=tw&type=podcast&limit=20",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
      })
    );
    expect(response.status).toBe(206);
  });

  it("forwards show batch query string", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "ok", data: {} }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );

    const request = new Request("http://localhost:3000/api/shows/batch?ids=show-1%2Cshow-2");
    await batchShowsGet(request);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://backend.example.com/api/shows/batch?ids=show-1%2Cshow-2",
      expect.objectContaining({
        method: "GET",
      })
    );
  });

  it("forwards click log payload to /log/click", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "ok" }), {
        status: 202,
        headers: { "content-type": "application/json" },
      })
    );

    const request = new Request("http://localhost:3000/api/logs/click", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ requestId: "req-1" }),
    });

    const response = await clickLogPost(request);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://backend.example.com/api/log/click",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ requestId: "req-1" }),
      })
    );
    expect(response.status).toBe(202);
  });

  it("returns 500 when SEARCH_API_INTERNAL_BASE is missing", async () => {
    delete process.env.SEARCH_API_INTERNAL_BASE;

    const request = new Request("http://localhost:3000/api/rankings?region=us");
    const response = await rankingsGet(request);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      status: "error",
      error: {
        message: "SEARCH_API_INTERNAL_BASE is not configured",
      },
    });
  });
});
