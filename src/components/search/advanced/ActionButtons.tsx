"use client";

import { Button } from "@/components/ui/button";

type Props = {
  onApply: () => void;
  onReset: () => void;
  translations: {
    applyFilters: string;
    reset: string;
  };
};

export function ActionButtons({ onApply, onReset, translations }: Props) {
  return (
    <div className="flex gap-3 pt-2">
      <Button onClick={onApply} className="flex-1 sm:flex-initial">
        {translations.applyFilters}
      </Button>
      <Button onClick={onReset} variant="outline">
        {translations.reset}
      </Button>
    </div>
  );
}
