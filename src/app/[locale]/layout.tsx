import "../globals.css";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Toaster } from "@/components/ui/sonner";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations("nav");

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {/* Header */}
          <header className="border-b">
            <div className="mx-auto max-w-screen-md px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link
                  href="/"
                  className="font-semibold text-lg hover:opacity-80 transition-opacity"
                >
                  Podcast Search
                </Link>
                <nav>
                  <Link
                    href="/rankings"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("rankings")}
                  </Link>
                </nav>
              </div>

              <LanguageSwitcher locale={locale} />
            </div>
          </header>

          {/* Main */}
          <main className="mx-auto max-w-screen-md px-4 py-6">{children}</main>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}