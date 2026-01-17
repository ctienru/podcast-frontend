import { PodcastResultCard } from "./PodcastResultCard";
import { EpisodeResultCard } from "./EpisodeResultCard";

export function SearchResultList({ results }: { results: any[] }) {
  return (
    <ul className="space-y-4">
      {results.map((item, idx) => (
        <li key={idx}>
          {item.type === "podcast" ? (
            <PodcastResultCard
              title={item.title}
              author={item.author}
              category={item.category}
              language={item.language}
              imageUrl={item.imageUrl}
            />
          ) : (
            <EpisodeResultCard
              title={item.title}
              podcast={item.podcast}
              duration={item.duration}
              date={item.date}
              description={item.description}
            />
          )}
        </li>
      ))}
    </ul>
  );
}