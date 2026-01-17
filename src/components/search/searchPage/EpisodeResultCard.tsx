"use client";

import { Card, CardContent } from "@/components/ui/card";

type Props = {
  episode: {
    episodeId: string;
    title: string;
    description?: string;
    highlights?: {
      description?: string[];
    };
    publishedAt: string;
    durationSec?: number;
    imageUrl?: string;
    podcast: {
      podcastId: string;
      title: string;
      publisher: string;
      imageUrl?: string;
    };
  };
};

function formatDuration(seconds?: number) {
  if (!seconds) return null;
  const min = Math.floor(seconds / 60);
  return `${min} min`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

export function EpisodeResultCard({ episode }: Props) {
  const {
    title,
    description,
    highlights,
    publishedAt,
    durationSec,
    imageUrl,
    podcast,
  } = episode;

  const snippet =
    highlights?.description?.[0] ?? description;

  return (
    <Card>
      <CardContent className="p-4">
        <article className="flex gap-4">
          {/* Left: podcast image */}
          {(podcast.imageUrl || imageUrl) && (
            <img
              src={podcast.imageUrl ?? imageUrl}
              alt={podcast.title}
              className="h-16 w-16 rounded-md object-cover flex-shrink-0"
            />
          )}

          {/* Right: content */}
          <div className="min-w-0 space-y-1">
            <h2 className="font-semibold leading-snug line-clamp-2">
              {title}
            </h2>

            <p className="text-sm text-muted-foreground">
              {podcast.title} · {podcast.publisher}
            </p>

            <p className="text-xs text-muted-foreground">
              {formatDuration(durationSec)} ·{" "}
              {formatDate(publishedAt)}
            </p>

            {snippet && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {snippet}
              </p>
            )}
          </div>
        </article>
      </CardContent>
    </Card>
  );
}