type Props = {
  page: number;
  total: number;
  pageSize: number;
  onPageChange?: (page: number) => void;
};

export function Pagination({
  page,
  total,
  pageSize,
  onPageChange,
}: Props) {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-between pt-4"
      aria-label="Pagination"
    >
      <button
        className="text-sm text-muted-foreground disabled:opacity-50"
        disabled={page <= 1}
        onClick={() => onPageChange?.(page - 1)}
      >
        ← Previous
      </button>

      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>

      <button
        className="text-sm text-muted-foreground disabled:opacity-50"
        disabled={page >= totalPages}
        onClick={() => onPageChange?.(page + 1)}
      >
        Next →
      </button>
    </nav>
  );
}