import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ShowResultCard } from "@/components/search/searchPage/ShowResultCard";
import type { Show } from "@/types/search";

// Mock clipboard
beforeEach(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });
});

const createMockShow = (overrides?: Partial<Show>): Show => ({
  showId: "show-123",
  title: "Test Podcast Show",
  publisher: "Test Publisher",
  description: "This is a test podcast description",
  imageUrl: "https://example.com/show.jpg",
  episodeCount: 42,
  language: "en",
  ...overrides,
});

describe("ShowResultCard", () => {
  describe("basic rendering", () => {
    it("should render show title", () => {
      const show = createMockShow();
      render(<ShowResultCard show={show} />);

      expect(screen.getByText("Test Podcast Show")).toBeInTheDocument();
    });

    it("should render publisher", () => {
      const show = createMockShow();
      render(<ShowResultCard show={show} />);

      expect(screen.getByText(/Test Publisher/)).toBeInTheDocument();
    });

    it("should render episode count", () => {
      const show = createMockShow();
      render(<ShowResultCard show={show} />);

      expect(screen.getByText(/42 episodes/)).toBeInTheDocument();
    });

    it("should render description", () => {
      const show = createMockShow();
      render(<ShowResultCard show={show} />);

      expect(
        screen.getByText("This is a test podcast description")
      ).toBeInTheDocument();
    });
  });

  describe("highlight rendering", () => {
    it("should render highlighted title with <mark> tags", () => {
      const show = createMockShow({
        highlights: {
          title: ["<em>Best</em> Podcast Show"],
        },
      });
      render(<ShowResultCard show={show} />);

      const mark = screen.getByText("Best");
      expect(mark.tagName).toBe("MARK");
    });

    it("should render highlighted description", () => {
      const show = createMockShow({
        highlights: {
          description: ["A podcast about <em>technology</em>"],
        },
      });
      render(<ShowResultCard show={show} />);

      const mark = screen.getByText("technology");
      expect(mark.tagName).toBe("MARK");
    });

    it("should handle multiple highlights", () => {
      const show = createMockShow({
        highlights: {
          title: ["<em>Tech</em> <em>News</em> Daily"],
        },
      });
      render(<ShowResultCard show={show} />);

      expect(screen.getByText("Tech")).toBeInTheDocument();
      expect(screen.getByText("News")).toBeInTheDocument();
    });

    it("should fall back to original title when no highlight", () => {
      const show = createMockShow({ highlights: undefined });
      render(<ShowResultCard show={show} />);

      expect(screen.getByText("Test Podcast Show")).toBeInTheDocument();
    });
  });

  describe("image handling", () => {
    it("should display show image when available", () => {
      const show = createMockShow();
      render(<ShowResultCard show={show} />);

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "https://example.com/show.jpg");
    });

    it("should use placeholder when image is missing", () => {
      const show = createMockShow({ imageUrl: undefined });
      render(<ShowResultCard show={show} />);

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "/placeholder-podcast.svg");
    });

    it("should fallback to placeholder on image error", () => {
      const show = createMockShow();
      render(<ShowResultCard show={show} />);

      const img = screen.getByRole("img");
      fireEvent.error(img);

      expect(img).toHaveAttribute("src", "/placeholder-podcast.svg");
    });

    it("should have alt text from show title", () => {
      const show = createMockShow();
      render(<ShowResultCard show={show} />);

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("alt", "Test Podcast Show");
    });
  });

  describe("episode count", () => {
    it("should display episode count when available", () => {
      const show = createMockShow({ episodeCount: 100 });
      render(<ShowResultCard show={show} />);

      expect(screen.getByText(/100 episodes/)).toBeInTheDocument();
    });

    it("should not display episode count when 0", () => {
      const show = createMockShow({ episodeCount: 0 });
      render(<ShowResultCard show={show} />);

      expect(screen.queryByText(/episodes/)).not.toBeInTheDocument();
    });

    it("should not display episode count when undefined", () => {
      const show = createMockShow({ episodeCount: undefined });
      render(<ShowResultCard show={show} />);

      expect(screen.queryByText(/episodes/)).not.toBeInTheDocument();
    });

    it("should handle single episode", () => {
      const show = createMockShow({ episodeCount: 1 });
      render(<ShowResultCard show={show} />);

      // Note: Current implementation shows "1 episodes" - plural is hardcoded
      expect(screen.getByText(/1 episodes/)).toBeInTheDocument();
    });
  });

  describe("description", () => {
    it("should not render description section when missing", () => {
      const show = createMockShow({
        description: undefined,
        highlights: undefined,
      });
      render(<ShowResultCard show={show} />);

      expect(screen.getByText("Test Podcast Show")).toBeInTheDocument();
      expect(screen.getByText(/Test Publisher/)).toBeInTheDocument();
    });

    it("should prefer highlighted description over original", () => {
      const show = createMockShow({
        description: "Original description",
        highlights: {
          description: ["<em>Highlighted</em> description"],
        },
      });
      render(<ShowResultCard show={show} />);

      expect(screen.getByText("Highlighted")).toBeInTheDocument();
      expect(
        screen.queryByText("Original description")
      ).not.toBeInTheDocument();
    });
  });

  describe("copy functionality", () => {
    it("should have copyable title", () => {
      const show = createMockShow();
      render(<ShowResultCard show={show} />);

      const copyableElements = screen.getAllByRole("button");
      expect(copyableElements.length).toBeGreaterThan(0);
    });
  });

  describe("card structure", () => {
    it("should be contained in an article", () => {
      const show = createMockShow();
      render(<ShowResultCard show={show} />);

      expect(screen.getByRole("article")).toBeInTheDocument();
    });

    it("should have h2 heading for title", () => {
      const show = createMockShow();
      render(<ShowResultCard show={show} />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toBeInTheDocument();
    });
  });
});
