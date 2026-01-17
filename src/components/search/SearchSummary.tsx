type Props = {
  query: string;
  total: number;
};

export function SearchSummary({ query, total }: Props) {
  return (
    <p className="text-sm text-muted-foreground">
      Results for <strong>“{query}”</strong> · {total} items
    </p>
  );
}