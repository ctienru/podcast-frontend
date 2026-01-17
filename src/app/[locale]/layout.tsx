import "../globals.css";

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Header */}
        <header className="border-b">
          <div className="mx-auto max-w-screen-md px-4 py-4 flex items-center justify-between">
            <div className="font-semibold text-lg">
              Podcast Search
            </div>

            <div className="text-sm text-muted-foreground">
              EN | 中文
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="mx-auto max-w-screen-md px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}