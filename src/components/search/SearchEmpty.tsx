type Props = {
  query: string;
  hasShows?: boolean;
  reason?: "empty" | "too_short";
};

const MIN_QUERY_LENGTH = 2;

export function SearchEmpty({ query, hasShows, reason }: Props) {
  // keyword too short
  if (reason === "too_short") {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="font-medium text-amber-800">Search query too short</p>
        <p className="text-sm text-amber-700">
          Please enter at least {MIN_QUERY_LENGTH} characters to search.
        </p>
      </div>
    );
  }

  // with shows but no episodes
  if (hasShows) {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="font-medium">No episodes found</p>
        <p className="text-sm text-muted-foreground">
          We found matching podcasts above, but no specific episodes for "{query}".
        </p>
      </div>
    );
  }

  // no shows and no episodes
  return (
    <div className="rounded-md border p-6 text-center">
      <p className="font-medium">No results found</p>
      <p className="text-sm text-muted-foreground">
        {query
          ? `No podcasts or episodes match "${query}". Try a different keyword.`
          : "Try searching for podcasts or episodes."}
      </p>
    </div>
  );
}