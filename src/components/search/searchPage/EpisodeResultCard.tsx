"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CopyableTitle } from "@/components/CopyableTitle";
import { buildClickLogPayload } from "@/lib/analytics";
import type { Episode, LangFilter } from "@/types/search";

const PLACEHOLDER_IMAGE = "/placeholder-podcast.svg";

type Props = {
  episode: Episode;
  rank: number;
  searchRequestId: string | null;
  query: string;
  selectedLang: LangFilter;
};

/* =========================
 * Helpers
 * ========================= */

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

// Duration formatter
function formatDuration(seconds?: number) {
  if (!seconds) return null;
  const min = Math.floor(seconds / 60);
  return `${min} min`;
}

function formatAbsoluteDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

// Relative date (timezone-aware)
function formatRelativeDate(iso: string) {
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();

  const min = Math.floor(diffMs / 60000);
  if (min < 60) return `${min} min ago`;

  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} hours ago`;

  const day = Math.floor(hour / 24);
  if (day < 7) return `${day} days ago`;

  return formatAbsoluteDate(iso);
}

/* =========================
 * Component
 * ========================= */
export function EpisodeResultCard({
  episode,
  rank,
  searchRequestId,
  query,
  selectedLang,
}: Props) {
  const searchResultTimestampRef = useRef<number | null>(null);
  useEffect(() => {
    searchResultTimestampRef.current = Date.now();
  }, [searchRequestId]);
  const {
    title,
    description,
    highlights,
    publishedAt,
    durationSec,
    imageUrl,
    language,
    podcast,
  } = episode;

  function handleClick() {
    const searchResultTimestamp = searchResultTimestampRef.current;
    if (!searchRequestId || searchResultTimestamp === null || !language) return;
    const baseUrl = process.env.NEXT_PUBLIC_SEARCH_API_BASE;
    if (!baseUrl) return;

    const payload = buildClickLogPayload({
      requestId: searchRequestId,
      query,
      selectedLang,
      episode: { episodeId: episode.episodeId, language },
      rank,
      searchResultTimestamp,
      clickTimestamp: Date.now(),
    });

    navigator.sendBeacon(
      `${baseUrl}/log/click`,
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );
  }

  // Image fallback: episode → podcast → placeholder
  const initialImage = imageUrl || podcast.imageUrl || PLACEHOLDER_IMAGE;
  const [imgSrc, setImgSrc] = useState(initialImage);
  const absoluteDate = useMemo(() => formatAbsoluteDate(publishedAt), [publishedAt]);
  const [relativeDate, setRelativeDate] = useState<{
    publishedAt: string;
    value: string;
  } | null>(null);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setRelativeDate({
        publishedAt,
        value: formatRelativeDate(publishedAt),
      });
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [publishedAt]);

  const displayDate =
    relativeDate?.publishedAt === publishedAt
      ? relativeDate.value
      : absoluteDate;

  const titleWithHighlight =
    highlights?.title?.[0] ?? title;
  const snippet =
    highlights?.description?.[0] ?? description;

  return (
    <Card>
      <CardContent className="p-4">
        <article
          role="article"
          className="flex gap-4 overflow-hidden"
          onClick={(event) => {
            const target = event.target as HTMLElement | null;
            if (target && target.closest("a, button, [role='button'], input, textarea, select")) return;
            handleClick();
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- external images with onError fallback */}
          <img
            src={imgSrc}
            alt={podcast.title || "Podcast cover"}
            className="h-32 w-32 rounded-md object-cover shrink-0"
            onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
          />

          {/* Right: Content */}
          <div className="min-w-0 space-y-1 flex-1">
            {/* Episode title */}
            <h2 className="text-base sm:text-lg font-semibold leading-snug line-clamp-2">
              <CopyableTitle title={title}>
                {renderHighlightedText(titleWithHighlight)}
              </CopyableTitle>
            </h2>

            {/* Podcast name (external link) */}
            <p className="text-sm sm:text-base text-muted-foreground">
              <a
                href={podcast.externalUrl?.applePodcastUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                aria-label={`Open podcast ${podcast.title} on Apple Podcasts`}
                onClick={() => {
                  handleClick();
                }}
              >
                {podcast.title}
              </a>
              {" · "}
              {podcast.publisher}
            </p>

            {/* Meta */}
            <p className="text-xs text-muted-foreground">
              {formatDuration(durationSec)} ·{" "}
              {displayDate}
            </p>

            {/* Description / highlight */}
            {snippet && (
              <p className="text-sm text-muted-foreground line-clamp-4">
                {renderHighlightedText(snippet)}
              </p>
            )}
          </div>
        </article>
      </CardContent>
    </Card>
  );
}
