import { NextResponse } from "next/server";

/**
 * Liveness endpoint.
 *
 * Railway polls `healthcheckPath` before it routes traffic to a new
 * deployment, and will roll back rather than publish an instance that never
 * answers. Vercel does not need this, but an uncached JSON endpoint is a
 * cheap thing to have when something is wrong in production.
 *
 * Deliberately shallow: it reports that this process is up and serving, and
 * nothing more. It does not reach Supabase. A health check that fails because
 * a third party is briefly unreachable will take a working deployment down
 * with it, and this site degrades to its empty states when Supabase is
 * missing rather than breaking, so Supabase being down is not a reason to
 * refuse traffic.
 */

// Never prerendered, never cached: a cached health check is not a health check.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
