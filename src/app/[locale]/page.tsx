"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params.locale;

  const [query, setQuery] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    router.push(
      `/${locale}/search?q=${encodeURIComponent(query)}&page=1`
    );
  };

  return (
    <>
      {/* Hero */}
      <section className="py-16 text-center space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          Search Podcasts & Episodes
        </h1>
        <p className="text-muted-foreground">
          Explore Apple Podcasts with powerful search and rankings.
        </p>

        <form
          onSubmit={onSubmit}
          className="mx-auto max-w-md flex gap-2"
        >
          <Input
            placeholder="Search podcasts or episodes"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit">Search</Button>
        </form>
      </section>

      {/* Highlights */}
      <section className="py-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-4 space-y-1">
              <h2 className="font-semibold">Podcast Rankings</h2>
              <p className="text-sm text-muted-foreground">
                Apple Podcasts charts in Taiwan and the US.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <h2 className="font-semibold">Episode Search</h2>
              <p className="text-sm text-muted-foreground">
                Search across episodes, not just podcast titles.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}