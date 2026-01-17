import { Card, CardContent } from "@/components/ui/card";

type Props = {
  title: string;
  author: string;
  category: string;
  language: string;
  imageUrl: string;
};


export function PodcastResultCard({
  title,
  author,
  category,
  language,
  imageUrl,
}: Props) {
  return (
    <Card>
      <CardContent className="p-4">
        <article className="flex gap-4">
          <img
            src={imageUrl}
            alt="Podcast cover"
            className="h-16 w-16 rounded"
          />

          <div className="space-y-1">
            <h2 className="font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              by {author}
            </p>
            <p className="text-xs text-muted-foreground">
              {category} · {language}
            </p>
          </div>
        </article>
      </CardContent>
    </Card>
  );
}