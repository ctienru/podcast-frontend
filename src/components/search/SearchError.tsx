type Props = {
  message?: string;
};

export function SearchError({ message }: Props) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
      <p className="text-sm text-destructive">
        {message ?? "Something went wrong. Please try again later."}
      </p>
    </div>
  );
}