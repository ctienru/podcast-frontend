import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RankingsPage() {
  return (
    <section className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-semibold">Rankings</h1>
        <p className="text-sm text-muted-foreground">
          Apple Podcasts charts
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Select defaultValue="tw">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tw">Taiwan</SelectItem>
            <SelectItem value="us">United States</SelectItem>
          </SelectContent>
        </Select>

        <Tabs defaultValue="podcast">
          <TabsList>
            <TabsTrigger value="podcast">Podcast</TabsTrigger>
            <TabsTrigger value="episode">Episode</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Ranking list */}
      <ol className="space-y-3">
        {[1, 2, 3, 4].map((rank) => (
          <li key={rank} className="flex gap-4 items-start">
            <div className="w-8 text-right text-2xl font-semibold text-muted-foreground">
              {rank}
            </div>
            <Card className="flex-1">
              <CardContent className="p-4">
                <article className="space-y-1">
                  <h2 className="font-semibold">
                    {rank === 1
                      ? "The Daily"
                      : rank === 2
                      ? "Huberman Lab"
                      : rank === 3
                      ? "Acquired"
                      : "Lex Fridman Podcast"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Sample author · Category
                  </p>
                </article>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </section>
  );
}