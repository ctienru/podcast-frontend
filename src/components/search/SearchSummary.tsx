type Props = {
  query: string;
  total?: number; // undefined = loading
};

export function SearchSummary({ query, total }: Props) {
  if (total === undefined) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading results…
      </p>
    );
  }

  if (!query) {
    return (
      <p className="text-sm text-muted-foreground">
        Showing all results · {total} items
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      Results for <strong>“{query}”</strong> · {total} items
    </p>
  );
}