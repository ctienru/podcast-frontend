type Props = {
  query: string;
};

export function SearchEmpty({ query }: Props) {
  return (
    <div className="rounded-md border p-6 text-center">
      <p className="font-medium">No results found</p>
      <p className="text-sm text-muted-foreground">
        {query
          ? `Try a different keyword for "${query}".`
          : "Try searching for podcasts or episodes."}
      </p>
    </div>
  );
}