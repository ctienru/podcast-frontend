import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchBar() {
  return (
    <form className="flex gap-2">
      <Input placeholder="Search podcasts or episodes" />
      <Button type="submit">Search</Button>
    </form>
  );
}