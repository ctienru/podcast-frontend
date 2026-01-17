"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CopyableTitle } from "@/components/CopyableTitle";
import type { Show } from "@/types/search";

const PLACEHOLDER_IMAGE = "/placeholder-podcast.svg";

type Props = {
  show: Show;
};

// Highlight renderer: <em> → <mark>
function renderHighlightedText(text?: string) {
  if (!text) return null;

  const parts = text.split(/(<em>|<\/em>)/g);

  let isHighlight = false;

  return parts.map((part, idx) => {
    if (part === "<em>") {
      isHighlight = true;
      return null;
    }
    if (part === "</em>") {
      isHighlight = false;
      return null;
    }

    if (isHighlight) {
      return (
        <mark
          key={idx}
          className="bg-yellow-200/60 text-inherit rounded px-0.5"
        >
          {part}
        </mark>
      );
    }

    return <span key={idx}>{part}</span>;
  });
}

export function ShowResultCard({ show }: Props) {
  const [imgSrc, setImgSrc] = useState(show.imageUrl || PLACEHOLDER_IMAGE);

  const titleWithHighlight =
    show.highlights?.title?.[0] ?? show.title;
  const descriptionWithHighlight =
    show.highlights?.description?.[0] ?? show.description;

  return (
    <Card className="h-full">
      <CardContent className="p-4 h-full">
        <article className="flex gap-4 h-full">
          <img
            src={imgSrc}
            alt={show.title}
            className="h-12 w-12 rounded-md object-cover flex-shrink-0"
            onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
          />

          <div className="min-w-0 space-y-1">
            <h2 className="font-semibold line-clamp-1">
              <CopyableTitle title={show.title}>
                {renderHighlightedText(titleWithHighlight)}
              </CopyableTitle>
            </h2>

            <p className="text-sm text-muted-foreground">
              {show.publisher}
              {show.episodeCount && (
                <> · {show.episodeCount} episodes</>
              )}
            </p>

            {descriptionWithHighlight && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {renderHighlightedText(descriptionWithHighlight)}
              </p>
            )}
          </div>
        </article>
      </CardContent>
    </Card>
  );
}