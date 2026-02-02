"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NavSearchBox } from "@/components/NavSearchBox";

type Props = {
  locale: string;
  siteTitle: string;
  rankingsLabel: string;
  searchPlaceholder: string;
};

export function Header({ locale, siteTitle, rankingsLabel, searchPlaceholder }: Props) {
  const pathname = usePathname();
  const isRankingsPage = pathname.includes("/rankings");

  return (
    <header className="border-b">
      <div className="mx-auto max-w-screen-md px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-semibold text-lg hover:opacity-80 transition-opacity"
          >
            {siteTitle}
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/rankings"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {rankingsLabel}
            </Link>
            {isRankingsPage && <NavSearchBox placeholder={searchPlaceholder} />}
          </nav>
        </div>

        <LanguageSwitcher locale={locale} />
      </div>
    </header>
  );
}
