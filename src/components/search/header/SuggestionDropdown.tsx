"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ShowSuggestion, EpisodeSuggestion } from "@/lib/search";

type FlatSuggestion =
  | ({ type: "show" } & ShowSuggestion)
  | ({ type: "episode" } & EpisodeSuggestion);

type SuggestionDropdownProps = {
  shows: ShowSuggestion[];
  episodes: EpisodeSuggestion[];
  selectedIndex: number;
  onSelect: (suggestion: FlatSuggestion) => void;
  isLoading: boolean;
};

export function SuggestionDropdown({
  shows,
  episodes,
  selectedIndex,
  onSelect,
  isLoading,
}: SuggestionDropdownProps) {
  const t = useTranslations("search");

  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg p-3 z-50">
        <span className="text-muted-foreground text-sm">{t("loading")}</span>
      </div>
    );
  }

  if (shows.length === 0 && episodes.length === 0) {
    return null;
  }

  let currentIndex = 0;

  return (
    <div
      id="suggestion-listbox"
      role="listbox"
      className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg overflow-hidden z-50 max-h-80 overflow-y-auto"
    >
      {shows.length > 0 && (
        <div>
          <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50">
            {t("suggestions.shows")}
          </div>
          {shows.map((show) => {
            const idx = currentIndex++;
            return (
              <SuggestionItem
                key={show.showId}
                id={`suggestion-${idx}`}
                title={show.title}
                subtitle={show.publisher}
                imageUrl={show.imageUrl}
                isSelected={selectedIndex === idx}
                onClick={() => onSelect({ type: "show", ...show })}
              />
            );
          })}
        </div>
      )}

      {episodes.length > 0 && (
        <div>
          <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50">
            {t("suggestions.episodes")}
          </div>
          {episodes.map((episode) => {
            const idx = currentIndex++;
            return (
              <SuggestionItem
                key={episode.episodeId}
                id={`suggestion-${idx}`}
                title={episode.title}
                subtitle={episode.showTitle}
                imageUrl={episode.imageUrl}
                isSelected={selectedIndex === idx}
                onClick={() => onSelect({ type: "episode", ...episode })}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function SuggestionItem({
  id,
  title,
  subtitle,
  imageUrl,
  isSelected,
  onClick,
}: {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={isSelected}
      className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${
        isSelected ? "bg-accent" : "hover:bg-accent/50"
      }`}
      onClick={onClick}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt=""
          width={32}
          height={32}
          className="rounded shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{title}</div>
        {subtitle && (
          <div className="text-xs text-muted-foreground truncate">{subtitle}</div>
        )}
      </div>
    </div>
  );
}

export type { FlatSuggestion };
