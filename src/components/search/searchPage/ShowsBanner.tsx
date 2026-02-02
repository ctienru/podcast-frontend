"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type { Show } from "@/types/search";

const PLACEHOLDER_IMAGE = "/placeholder-podcast.svg";

type Props = {
  shows: Show[];
};

export function ShowsBanner({ shows }: Props) {
  const t = useTranslations("search");

  if (shows.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{t("podcasts")}</h2>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
          {shows.map((show) => (
            <ShowCard key={show.showId} show={show} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ShowCard({ show }: { show: Show }) {
  const [imgSrc, setImgSrc] = useState(show.imageUrl || PLACEHOLDER_IMAGE);

  return (
    <Link
      href={`/show/${show.showId}`}
      className="flex-shrink-0 w-[160px] snap-start group"
    >
      <article className="space-y-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- external images with onError fallback */}
        <img
          src={imgSrc}
          alt={show.title}
          className="w-[160px] h-[160px] rounded-lg object-cover shadow-md group-hover:shadow-lg transition-shadow"
          onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
        />

        <div className="space-y-1">
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {show.title}
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-1">
            {show.publisher}
          </p>
        </div>
      </article>
    </Link>
  );
}
