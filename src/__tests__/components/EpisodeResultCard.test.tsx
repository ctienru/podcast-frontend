import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { EpisodeResultCard } from "@/components/search/searchPage/EpisodeResultCard";
import type { Episode } from "@/types/search";

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

const defaultClickLogProps = {
  rank: 1,
  searchRequestId: null as string | null,
  query: "test",
  selectedLang: "zh-tw" as const,
};

async function renderEpisodeCard(episode: Episode, props = defaultClickLogProps) {
  const rendered = render(<EpisodeResultCard episode={episode} {...props} />);

  await act(async () => {
    vi.runOnlyPendingTimers();
  });

  return rendered;
}

async function renderEpisodeCardWithRealTimers(episode: Episode, props = defaultClickLogProps) {
  vi.useRealTimers();

  const rendered = render(<EpisodeResultCard episode={episode} {...props} />);

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  return rendered;
}

// Mock clipboard
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-03-28T12:00:00.000Z"));
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
    sendBeacon: vi.fn().mockReturnValue(true),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const createMockEpisode = (overrides?: Partial<Episode>): Episode => ({
  episodeId: "ep-123",
  title: "Test Episode Title",
  description: "This is a test episode description",
  publishedAt: new Date().toISOString(),
  durationSec: 3600,
  imageUrl: "https://example.com/episode.jpg",
  language: "zh-tw",
  podcast: {
    showId: "show-123",
    title: "Test Podcast",
    publisher: "Test Publisher",
    imageUrl: "https://example.com/podcast.jpg",
    externalUrl: {
      applePodcastUrl: "https://podcasts.apple.com/test",
    },
  },
  ...overrides,
});

describe("EpisodeResultCard", () => {
  describe("basic rendering", () => {
    it("should render episode title", async () => {
      const episode = createMockEpisode();
      await renderEpisodeCard(episode);

      expect(screen.getByText("Test Episode Title")).toBeInTheDocument();
    });

    it("should render podcast title", async () => {
      const episode = createMockEpisode();
      await renderEpisodeCard(episode);

      expect(screen.getByText("Test Podcast")).toBeInTheDocument();
    });

    it("should render publisher", async () => {
      const episode = createMockEpisode();
      await renderEpisodeCard(episode);

      expect(screen.getByText(/Test Publisher/)).toBeInTheDocument();
    });

    it("should render description", async () => {
      const episode = createMockEpisode();
      await renderEpisodeCard(episode);

      expect(
        screen.getByText("This is a test episode description")
      ).toBeInTheDocument();
    });
  });

  describe("highlight rendering", () => {
    it("should render highlighted title with <mark> tags", async () => {
      const episode = createMockEpisode({
        highlights: {
          title: ["<em>Highlighted</em> Title"],
        },
      });
      await renderEpisodeCard(episode);

      const mark = screen.getByText("Highlighted");
      expect(mark.tagName).toBe("MARK");
    });

    it("should render highlighted description", async () => {
      const episode = createMockEpisode({
        highlights: {
          description: ["Description with <em>keyword</em>"],
        },
      });
      await renderEpisodeCard(episode);

      const mark = screen.getByText("keyword");
      expect(mark.tagName).toBe("MARK");
    });

    it("should handle multiple highlight sections", async () => {
      const episode = createMockEpisode({
        highlights: {
          title: ["<em>First</em> and <em>Second</em> highlights"],
        },
      });
      await renderEpisodeCard(episode);

      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Second")).toBeInTheDocument();
    });
  });

  describe("duration formatting", () => {
    it("should format duration in minutes", async () => {
      const episode = createMockEpisode({ durationSec: 1800 });
      await renderEpisodeCard(episode);

      expect(screen.getByText(/30 min/)).toBeInTheDocument();
    });

    it("should handle 0 duration", async () => {
      const episode = createMockEpisode({ durationSec: 0 });
      await renderEpisodeCard(episode);

      // 0 seconds returns null from formatDuration, so the meta row should not render a duration.
      expect(screen.getByText("Test Episode Title")).toBeInTheDocument();
      expect(screen.getByText(/0 min ago/).closest("p")).toHaveTextContent("· 0 min ago");
      expect(screen.getByText(/0 min ago/).closest("p")).not.toHaveTextContent("0 min ·");
    });

    it("should handle undefined duration", async () => {
      const episode = createMockEpisode({ durationSec: undefined });
      await renderEpisodeCard(episode);

      // Should not throw, just not render duration
      expect(screen.getByText("Test Episode Title")).toBeInTheDocument();
    });
  });

  describe("date formatting", () => {
    it("shows a stable absolute date first, then updates to relative time after mount", async () => {
      const recentDate = "2026-03-28T11:30:00.000Z";
      const episode = createMockEpisode({ publishedAt: recentDate });
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      expect(screen.getByText(/60 min/).closest("p")).toHaveTextContent("60 min · Mar 28, 2026");

      await act(async () => {
        vi.runAllTimers();
      });

      expect(screen.getByText(/60 min/).closest("p")).toHaveTextContent("60 min · 30 min ago");
    });

    it("should show hours ago for dates within 24 hours", async () => {
      const hoursAgo = "2026-03-28T07:00:00.000Z";
      const episode = createMockEpisode({ publishedAt: hoursAgo });
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      await act(async () => {
        vi.runAllTimers();
      });

      expect(screen.getByText(/60 min/).closest("p")).toHaveTextContent("5 hours ago");
    });

    it("should show days ago for dates within a week", async () => {
      const daysAgo = "2026-03-25T12:00:00.000Z";
      const episode = createMockEpisode({ publishedAt: daysAgo });
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      await act(async () => {
        vi.runAllTimers();
      });

      expect(screen.getByText(/60 min/).closest("p")).toHaveTextContent("3 days ago");
    });
  });

  describe("image handling", () => {
    it("should display episode image when available", async () => {
      const episode = createMockEpisode();
      await renderEpisodeCard(episode);

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "https://example.com/episode.jpg");
    });

    it("should fallback to podcast image when episode image is missing", async () => {
      const episode = createMockEpisode({ imageUrl: undefined });
      await renderEpisodeCard(episode);

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "https://example.com/podcast.jpg");
    });

    it("should use placeholder when both images are missing", async () => {
      const episode = createMockEpisode({
        imageUrl: undefined,
        podcast: {
          showId: "show-1",
          title: "Podcast",
          publisher: "Publisher",
          imageUrl: undefined,
        },
      });
      await renderEpisodeCard(episode);

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "/placeholder-podcast.svg");
    });

    it("should use placeholder on image error", async () => {
      const episode = createMockEpisode();
      await renderEpisodeCard(episode);

      const img = screen.getByRole("img");
      fireEvent.error(img);

      expect(img).toHaveAttribute("src", "/placeholder-podcast.svg");
    });

    it("should have alt text from podcast title", async () => {
      const episode = createMockEpisode();
      await renderEpisodeCard(episode);

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("alt", "Test Podcast");
    });
  });

  describe("external link", () => {
    it("should link to Apple Podcasts", async () => {
      const episode = createMockEpisode();
      await renderEpisodeCard(episode);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute(
        "href",
        "https://podcasts.apple.com/test"
      );
    });

    it("should open in new tab", async () => {
      const episode = createMockEpisode();
      await renderEpisodeCard(episode);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("should have accessible label", async () => {
      const episode = createMockEpisode();
      await renderEpisodeCard(episode);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute(
        "aria-label",
        "Open podcast Test Podcast on Apple Podcasts"
      );
    });
  });

  describe("copy functionality", () => {
    it("should have copyable title", async () => {
      const episode = createMockEpisode();
      await renderEpisodeCard(episode);

      // CopyableTitle should be rendered with role="button"
      const copyableElements = screen.getAllByRole("button");
      expect(copyableElements.length).toBeGreaterThan(0);
    });
  });

  describe("no description", () => {
    it("should not render description section when missing", async () => {
      const episode = createMockEpisode({
        description: undefined,
        highlights: undefined,
      });
      await renderEpisodeCard(episode);

      expect(screen.getByText("Test Episode Title")).toBeInTheDocument();
      // Should not throw
    });
  });

  describe("click log — sendBeacon", () => {
    it("sends beacon when card is clicked with searchRequestId", async () => {
      const episode = createMockEpisode();
      await renderEpisodeCardWithRealTimers(
        episode,
        {
          rank: 1,
          searchRequestId: "req-abc",
          query: "人工智慧",
          selectedLang: "zh-tw",
        }
      );

      fireEvent.click(screen.getByRole("article"));

      expect(navigator.sendBeacon).toHaveBeenCalledWith(
        expect.stringContaining("/log/click"),
        expect.any(Blob)
      );
      const blob = (navigator.sendBeacon as ReturnType<typeof vi.fn>).mock.calls[0][1] as Blob;
      expect(blob.type).toBe("application/json");
      const body = JSON.parse(await readBlob(blob));
      expect(body.requestId).toBe("req-abc");
    });

    it("includes query and rank in beacon payload", async () => {
      const episode = createMockEpisode();
      await renderEpisodeCardWithRealTimers(episode, {
        rank: 3,
        searchRequestId: "req-xyz",
        query: "podcast搜尋",
        selectedLang: "en",
      });

      fireEvent.click(screen.getByRole("article"));

      const call = (navigator.sendBeacon as ReturnType<typeof vi.fn>).mock.calls[0];
      const payload = JSON.parse(await readBlob(call[1] as Blob));
      expect(payload.query).toBe("podcast搜尋");
      expect(payload.clickedRank).toBe(3);
      expect(payload.selectedLang).toBe("en");
    });

    it("does not send beacon when searchRequestId is null", async () => {
      const episode = createMockEpisode();
      await renderEpisodeCard(episode, {
        rank: 1,
        searchRequestId: null,
        query: "test",
        selectedLang: "zh-tw",
      });

      fireEvent.click(screen.getByRole("article"));

      expect(navigator.sendBeacon).not.toHaveBeenCalled();
    });

    it("sends beacon when Apple Podcasts link is clicked", async () => {
      const episode = createMockEpisode();
      await renderEpisodeCardWithRealTimers(episode, {
        rank: 1,
        searchRequestId: "req-link",
        query: "連結點擊",
        selectedLang: "zh-tw",
      });

      fireEvent.click(screen.getByRole("link"));

      expect(navigator.sendBeacon).toHaveBeenCalledWith(
        expect.stringContaining("/log/click"),
        expect.any(Blob)
      );
      const blob = (navigator.sendBeacon as ReturnType<typeof vi.fn>).mock.calls[0][1] as Blob;
      const body = JSON.parse(await readBlob(blob));
      expect(body.requestId).toBe("req-link");
    });

    it("does not send beacon when NEXT_PUBLIC_SEARCH_API_BASE is missing", async () => {
      const originalBaseUrl = process.env.NEXT_PUBLIC_SEARCH_API_BASE;
      process.env.NEXT_PUBLIC_SEARCH_API_BASE = "";

      const episode = createMockEpisode();
      await renderEpisodeCardWithRealTimers(episode, {
        rank: 1,
        searchRequestId: "req-no-base",
        query: "test",
        selectedLang: "zh-tw",
      });

      fireEvent.click(screen.getByRole("article"));

      expect(navigator.sendBeacon).not.toHaveBeenCalled();

      process.env.NEXT_PUBLIC_SEARCH_API_BASE = originalBaseUrl;
    });
  });
});
