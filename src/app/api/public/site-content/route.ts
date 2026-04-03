import { NextResponse } from "next/server";
import { getAdminContentServer } from "@/lib/admin-content-server";

export const dynamic = "force-dynamic";

/** Public JSON for site UI. Legacy `password` fields removed if present. */
export async function GET() {
  const doc = await getAdminContentServer();
  if (!doc) {
    return NextResponse.json(null, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  }
  const safe = { ...doc } as Record<string, unknown>;
  delete safe.password;
  return NextResponse.json(safe, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}
