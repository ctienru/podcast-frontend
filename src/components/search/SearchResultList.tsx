export function SearchResultList({ results }: { results: any[] }) {
  return (
    <ul className="space-y-4">
      {results.map((item, idx) => (
        <li key={idx}>
          {/* podcast / episode card */}
        </li>
      ))}
    </ul>
  );
}