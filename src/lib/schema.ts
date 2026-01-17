export function buildSearchItemListSchema({
  url,
  results,
}: {
  url: string;
  results: any[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: results.map((item, index) => {
      if (item.type === "podcast") {
        return {
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "PodcastSeries",
            name: item.title,
            inLanguage: item.language ?? "en",
            author: {
              "@type": "Person",
              name: item.author ?? "Unknown",
            },
          },
        };
      }

      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "PodcastEpisode",
          name: item.title,
          partOfSeries: {
            "@type": "PodcastSeries",
            name: item.podcast,
          },
          description: item.description,
          datePublished: item.date,
        },
      };
    }),
  };
}