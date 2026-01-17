type Props = {
  query: string;
  total: number;
};

export function SearchSummary({ query, total }: Props) {
  if (!query) {
    return (
      <p className="text-sm text-muted-foreground">
        Showing all results · {total.toLocaleString()} items
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      Results for <strong>“{query}”</strong> ·{" "}
      {total.toLocaleString()} items
    </p>
  );
}