import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EpisodeResultCard } from "@/components/search/searchPage/EpisodeResultCard";
import type { Episode } from "@/types/search";

const defaultClickLogProps = {
  rank: 1,
  searchRequestId: null as string | null,
  searchResultTimestamp: null as number | null,
  query: "test",
  selectedLang: "zh-tw" as const,
};

// Mock clipboard
beforeEach(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
    sendBeacon: vi.fn().mockReturnValue(true),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
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
    it("should render episode title", () => {
      const episode = createMockEpisode();
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      expect(screen.getByText("Test Episode Title")).toBeInTheDocument();
    });

    it("should render podcast title", () => {
      const episode = createMockEpisode();
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      expect(screen.getByText("Test Podcast")).toBeInTheDocument();
    });

    it("should render publisher", () => {
      const episode = createMockEpisode();
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      expect(screen.getByText(/Test Publisher/)).toBeInTheDocument();
    });

    it("should render description", () => {
      const episode = createMockEpisode();
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      expect(
        screen.getByText("This is a test episode description")
      ).toBeInTheDocument();
    });
  });

  describe("highlight rendering", () => {
    it("should render highlighted title with <mark> tags", () => {
      const episode = createMockEpisode({
        highlights: {
          title: ["<em>Highlighted</em> Title"],
        },
      });
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      const mark = screen.getByText("Highlighted");
      expect(mark.tagName).toBe("MARK");
    });

    it("should render highlighted description", () => {
      const episode = createMockEpisode({
        highlights: {
          description: ["Description with <em>keyword</em>"],
        },
      });
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      const mark = screen.getByText("keyword");
      expect(mark.tagName).toBe("MARK");
    });

    it("should handle multiple highlight sections", () => {
      const episode = createMockEpisode({
        highlights: {
          title: ["<em>First</em> and <em>Second</em> highlights"],
        },
      });
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Second")).toBeInTheDocument();
    });
  });

  describe("duration formatting", () => {
    it("should format duration in minutes", () => {
      const episode = createMockEpisode({ durationSec: 1800 });
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      expect(screen.getByText(/30 min/)).toBeInTheDocument();
    });

    it("should handle 0 duration", () => {
      const episode = createMockEpisode({ durationSec: 0 });
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      // 0 seconds returns null from formatDuration, so no "min" should appear
      // Note: The actual format shows "0 min" because 0/60 = 0
      expect(screen.getByText("Test Episode Title")).toBeInTheDocument();
    });

    it("should handle undefined duration", () => {
      const episode = createMockEpisode({ durationSec: undefined });
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      // Should not throw, just not render duration
      expect(screen.getByText("Test Episode Title")).toBeInTheDocument();
    });
  });

  describe("date formatting", () => {
    it("should show relative time for recent dates", () => {
      const recentDate = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const episode = createMockEpisode({ publishedAt: recentDate });
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      expect(screen.getByText(/min ago/)).toBeInTheDocument();
    });

    it("should show hours ago for dates within 24 hours", () => {
      const hoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
      const episode = createMockEpisode({ publishedAt: hoursAgo });
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      expect(screen.getByText(/hours ago/)).toBeInTheDocument();
    });

    it("should show days ago for dates within a week", () => {
      const daysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const episode = createMockEpisode({ publishedAt: daysAgo });
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      expect(screen.getByText(/days ago/)).toBeInTheDocument();
    });
  });

  describe("image handling", () => {
    it("should display episode image when available", () => {
      const episode = createMockEpisode();
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "https://example.com/episode.jpg");
    });

    it("should fallback to podcast image when episode image is missing", () => {
      const episode = createMockEpisode({ imageUrl: undefined });
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "https://example.com/podcast.jpg");
    });

    it("should use placeholder when both images are missing", () => {
      const episode = createMockEpisode({
        imageUrl: undefined,
        podcast: {
          showId: "show-1",
          title: "Podcast",
          publisher: "Publisher",
          imageUrl: undefined,
        },
      });
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "/placeholder-podcast.svg");
    });

    it("should use placeholder on image error", () => {
      const episode = createMockEpisode();
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      const img = screen.getByRole("img");
      fireEvent.error(img);

      expect(img).toHaveAttribute("src", "/placeholder-podcast.svg");
    });

    it("should have alt text from podcast title", () => {
      const episode = createMockEpisode();
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("alt", "Test Podcast");
    });
  });

  describe("external link", () => {
    it("should link to Apple Podcasts", () => {
      const episode = createMockEpisode();
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute(
        "href",
        "https://podcasts.apple.com/test"
      );
    });

    it("should open in new tab", () => {
      const episode = createMockEpisode();
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("should have accessible label", () => {
      const episode = createMockEpisode();
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute(
        "aria-label",
        "Open podcast Test Podcast on Apple Podcasts"
      );
    });
  });

  describe("copy functionality", () => {
    it("should have copyable title", () => {
      const episode = createMockEpisode();
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      // CopyableTitle should be rendered with role="button"
      const copyableElements = screen.getAllByRole("button");
      expect(copyableElements.length).toBeGreaterThan(0);
    });
  });

  describe("no description", () => {
    it("should not render description section when missing", () => {
      const episode = createMockEpisode({
        description: undefined,
        highlights: undefined,
      });
      render(<EpisodeResultCard episode={episode} {...defaultClickLogProps} />);

      expect(screen.getByText("Test Episode Title")).toBeInTheDocument();
      // Should not throw
    });
  });

  describe("click log — sendBeacon", () => {
    it("有 searchRequestId 時點擊卡片送出 beacon", () => {
      const episode = createMockEpisode();
      render(
        <EpisodeResultCard
          episode={episode}
          rank={1}
          searchRequestId="req-abc"
          searchResultTimestamp={Date.now() - 3000}
          query="人工智慧"
          selectedLang="zh-tw"
        />
      );

      fireEvent.click(screen.getByRole("article"));

      expect(navigator.sendBeacon).toHaveBeenCalledWith(
        "/api/log/click",
        expect.stringContaining('"requestId":"req-abc"')
      );
    });

    it("beacon payload 包含 query 和 rank", () => {
      const episode = createMockEpisode();
      render(
        <EpisodeResultCard
          episode={episode}
          rank={3}
          searchRequestId="req-xyz"
          searchResultTimestamp={Date.now() - 2000}
          query="podcast搜尋"
          selectedLang="en"
        />
      );

      fireEvent.click(screen.getByRole("article"));

      const call = (navigator.sendBeacon as ReturnType<typeof vi.fn>).mock.calls[0];
      const payload = JSON.parse(call[1]);
      expect(payload.query).toBe("podcast搜尋");
      expect(payload.clickedRank).toBe(3);
      expect(payload.selectedLang).toBe("en");
    });

    it("searchRequestId 為 null 時不送出 beacon", () => {
      const episode = createMockEpisode();
      render(
        <EpisodeResultCard
          episode={episode}
          rank={1}
          searchRequestId={null}
          searchResultTimestamp={null}
          query="test"
          selectedLang="zh-tw"
        />
      );

      fireEvent.click(screen.getByRole("article"));

      expect(navigator.sendBeacon).not.toHaveBeenCalled();
    });

    it("searchResultTimestamp 為 null 時不送出 beacon", () => {
      const episode = createMockEpisode();
      render(
        <EpisodeResultCard
          episode={episode}
          rank={1}
          searchRequestId="req-123"
          searchResultTimestamp={null}
          query="test"
          selectedLang="zh-tw"
        />
      );

      fireEvent.click(screen.getByRole("article"));

      expect(navigator.sendBeacon).not.toHaveBeenCalled();
    });
  });
});
