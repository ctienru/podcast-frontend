"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type Props = {
  message?: string;
};

export function SearchError({ message }: Props) {
  const t = useTranslations("search");

  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 space-y-3">
      <p className="text-sm text-destructive">
        {message ?? t("errorMessage")}
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.location.reload()}
      >
        {t("retry")}
      </Button>
    </div>
  );
}
