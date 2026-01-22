export function SearchLoading() {
  return (
    <ul className="space-y-4 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <li
          key={i}
          className="h-20 rounded-md bg-muted"
        />
      ))}
    </ul>
  );
}