import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
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

        <form className="mx-auto max-w-md flex gap-2">
          <Input placeholder="Search podcasts or episodes" />
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