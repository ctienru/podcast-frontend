"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Show } from "@/types/search";

type Props = {
  show: Show;
};

export function ShowResultCard({ show }: Props) {
  return (
    <Card>
      <CardContent className="p-4">
        <article className="flex gap-4">
          {show.imageUrl && (
            <img
              src={show.imageUrl}
              alt={show.title}
              className="h-12 w-12 rounded-md object-cover flex-shrink-0"
            />
          )}

          <div className="min-w-0 space-y-1">
            <h2 className="font-semibold line-clamp-1">
              {show.title}
            </h2>

            <p className="text-sm text-muted-foreground">
              {show.publisher}
              {show.episodeCount && (
                <> · {show.episodeCount} episodes</>
              )}
            </p>

            {show.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {show.description}
              </p>
            )}
          </div>
        </article>
      </CardContent>
    </Card>
  );
}