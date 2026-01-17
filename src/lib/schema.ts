import type { Show, Episode } from "@/types/search";

type SchemaResult = Show | Episode;

export function buildSearchItemListSchema({
  url,
  results,
}: {
  url: string;
  results: SchemaResult[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListOrder:
      "https://schema.org/ItemListOrderAscending",
    itemListElement: results.map((item, index) => {
      // Episode
      if ("episodeId" in item) {
        return {
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "PodcastEpisode",
            name: item.title,
            description:
              item.highlights?.description?.[0] ??
              item.description,
            datePublished: item.publishedAt,
            partOfSeries: {
              "@type": "PodcastSeries",
              name: item.podcast.title,
            },
          },
        };
      }

      // Show
      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "PodcastSeries",
          name: item.title,
          inLanguage: item.language ?? "en",
          publisher: {
            "@type": "Organization",
            name: item.publisher,
          },
        },
      };
    }),
  };
}