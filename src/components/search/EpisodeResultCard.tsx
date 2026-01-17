import { Card, CardContent } from "@/components/ui/card";

type Props = {
  title: string;
  podcast: string;
  duration: string;
  date: string;
  description: string;
};

export function EpisodeResultCard({
  title,
  podcast,
  duration,
  date,
  description,
}: Props) {
  return (
    <Card>
      <CardContent className="p-4">
        <article className="space-y-1">
          <h2 className="font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {podcast}
          </p>
          <p className="text-xs text-muted-foreground">
            {duration} · {date}
          </p>
          <p className="text-sm line-clamp-2">
            {description}
          </p>
        </article>
      </CardContent>
    </Card>
  );
}