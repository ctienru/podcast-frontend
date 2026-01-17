"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const DEBOUNCE_MS = 300;

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read the current query from the URL as the initial input value
  const urlQuery = searchParams.get("q") ?? "";
  const [value, setValue] = useState(urlQuery);

  // Keep input value in sync when URL changes
  // (e.g. browser back / forward navigation)
  useEffect(() => {
    setValue(urlQuery);
  }, [urlQuery]);

  // Debounced update: input value → URL query
  // This avoids pushing a new URL on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }

      // Reset pagination whenever the search query changes
      params.delete("page");

      router.push(`?${params.toString()}`);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value, router, searchParams]);

  // Submit handler (Enter key or Search button)
  // Triggers an immediate URL update without waiting for debounce
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }

    // Always reset page to 1 on a new search
    params.delete("page");

    router.push(`?${params.toString()}`);
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search podcasts or episodes"
      />
      <Button type="submit">Search</Button>
    </form>
  );
}