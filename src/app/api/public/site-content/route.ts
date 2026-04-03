import { NextResponse } from "next/server";
import { getAdminContentServer } from "@/lib/admin-content-server";

export const dynamic = "force-dynamic";

/** Public JSON for site UI. Uses Admin SDK on the server when configured (bypasses Firestore client rules). */
export async function GET() {
  const doc = await getAdminContentServer();
  if (!doc) {
    return NextResponse.json(null, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  }
  const safe = { ...doc };
  delete safe.password;
  return NextResponse.json(safe, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}
