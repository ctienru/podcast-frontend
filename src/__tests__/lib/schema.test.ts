import { describe, it, expect } from "vitest";
import { buildSearchItemListSchema } from "@/lib/schema";
import type { Show, Episode } from "@/types/search";

describe("buildSearchItemListSchema", () => {
  const baseUrl = "https://example.com/search?q=test";

  describe("Episode schema generation", () => {
    it("should generate PodcastEpisode schema for episodes", () => {
      const episode: Episode = {
        episodeId: "ep-1",
        title: "Test Episode",
        description: "Episode description",
        publishedAt: "2024-01-15T10:00:00Z",
        podcast: {
          showId: "show-1",
          title: "Test Podcast",
          publisher: "Test Publisher",
        },
      };

      const schema = buildSearchItemListSchema({
        url: baseUrl,
        results: [episode],
      });

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("ItemList");
      expect(schema.itemListElement).toHaveLength(1);

      const item = schema.itemListElement[0];
      expect(item["@type"]).toBe("ListItem");
      expect(item.position).toBe(1);
      expect(item.item["@type"]).toBe("PodcastEpisode");
      expect(item.item.name).toBe("Test Episode");
      expect(item.item.description).toBe("Episode description");
      expect(item.item.datePublished).toBe("2024-01-15T10:00:00Z");
      expect(item.item.partOfSeries).toBeDefined();
      expect(item.item.partOfSeries?.["@type"]).toBe("PodcastSeries");
      expect(item.item.partOfSeries?.name).toBe("Test Podcast");
    });

    it("should use highlighted description when available", () => {
      const episode: Episode = {
        episodeId: "ep-1",
        title: "Test Episode",
        description: "Original description",
        highlights: {
          description: ["Highlighted <em>description</em>"],
        },
        publishedAt: "2024-01-15",
        podcast: {
          showId: "show-1",
          title: "Podcast",
          publisher: "Publisher",
        },
      };

      const schema = buildSearchItemListSchema({
        url: baseUrl,
        results: [episode],
      });

      expect(schema.itemListElement[0].item.description).toBe(
        "Highlighted <em>description</em>"
      );
    });
  });

  describe("Show schema generation", () => {
    it("should generate PodcastSeries schema for shows", () => {
      const show: Show = {
        showId: "show-1",
        title: "Test Podcast",
        publisher: "Test Publisher",
        language: "zh",
        description: "Show description",
      };

      const schema = buildSearchItemListSchema({
        url: baseUrl,
        results: [show],
      });

      const item = schema.itemListElement[0];
      expect(item["@type"]).toBe("ListItem");
      expect(item.position).toBe(1);
      expect(item.item["@type"]).toBe("PodcastSeries");
      expect(item.item.name).toBe("Test Podcast");
      expect(item.item.inLanguage).toBe("zh");
      expect(item.item.publisher).toBeDefined();
      expect(item.item.publisher?.["@type"]).toBe("Organization");
      expect(item.item.publisher?.name).toBe("Test Publisher");
    });

    it("should use default language when not specified", () => {
      const show: Show = {
        showId: "show-1",
        title: "Test Podcast",
        publisher: "Publisher",
      };

      const schema = buildSearchItemListSchema({
        url: baseUrl,
        results: [show],
      });

      expect(schema.itemListElement[0].item.inLanguage).toBe("en");
    });
  });

  describe("Mixed results", () => {
    it("should handle mixed Episode and Show results", () => {
      const episode: Episode = {
        episodeId: "ep-1",
        title: "Episode Title",
        publishedAt: "2024-01-01",
        podcast: { showId: "s1", title: "Podcast", publisher: "Pub" },
      };

      const show: Show = {
        showId: "show-1",
        title: "Show Title",
        publisher: "Publisher",
      };

      const schema = buildSearchItemListSchema({
        url: baseUrl,
        results: [episode, show],
      });

      expect(schema.itemListElement).toHaveLength(2);
      expect(schema.itemListElement[0].item["@type"]).toBe("PodcastEpisode");
      expect(schema.itemListElement[1].item["@type"]).toBe("PodcastSeries");
    });

    it("should calculate positions correctly (starting from 1)", () => {
      const show1: Show = {
        showId: "s1",
        title: "Show 1",
        publisher: "P1",
      };
      const show2: Show = {
        showId: "s2",
        title: "Show 2",
        publisher: "P2",
      };
      const show3: Show = {
        showId: "s3",
        title: "Show 3",
        publisher: "P3",
      };

      const schema = buildSearchItemListSchema({
        url: baseUrl,
        results: [show1, show2, show3],
      });

      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[1].position).toBe(2);
      expect(schema.itemListElement[2].position).toBe(3);
    });
  });

  describe("Empty results", () => {
    it("should return empty itemListElement for empty array", () => {
      const schema = buildSearchItemListSchema({
        url: baseUrl,
        results: [],
      });

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("ItemList");
      expect(schema.itemListElement).toEqual([]);
    });
  });

  describe("Schema structure", () => {
    it("should have correct itemListOrder", () => {
      const schema = buildSearchItemListSchema({
        url: baseUrl,
        results: [],
      });

      expect(schema.itemListOrder).toBe(
        "https://schema.org/ItemListOrderAscending"
      );
    });
  });
});
