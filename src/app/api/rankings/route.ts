import { proxyToBackend } from "@/app/api/_lib/proxy";

export async function GET(request: Request) {
  return proxyToBackend(request, {
    method: "GET",
    path: "/rankings",
  });
}
