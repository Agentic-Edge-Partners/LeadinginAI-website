import { NextResponse } from "next/server";
import { z } from "zod";
import { getSite } from "@/lib/content";

/**
 * POST /api/subscribe → Beehiiv. The API key never reaches the client.
 * Responses:
 *   200 { ok: true, status: "subscribed" | "already" }
 *   400 { ok: false, error: "invalid" }
 *   503 { ok: false, error: "unconfigured" }   (env vars missing)
 *   502 { ok: false, error: "provider" }       (Beehiiv down / rejected)
 */
const Body = z.object({ email: z.email(), source: z.string().max(40).optional() });

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = Body.safeParse({
    ...(raw ?? {}),
    email: typeof raw?.email === "string" ? raw.email.trim().toLowerCase() : raw?.email,
  });
  if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });

  const key = process.env.BEEHIIV_API_KEY;
  const pub = process.env.BEEHIIV_PUBLICATION_ID;
  if (!key || !pub) return NextResponse.json({ ok: false, error: "unconfigured" }, { status: 503 });

  try {
    const res = await fetch(`https://api.beehiiv.com/v2/publications/${pub}/subscriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: parsed.data.email,
        reactivate_existing: false,
        send_welcome_email: true,
        utm_source: "website",
        utm_medium: parsed.data.source ?? "site",
        referring_site: getSite().url,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`[subscribe] Beehiiv responded ${res.status}`);
      return NextResponse.json({ ok: false, error: "provider" }, { status: 502 });
    }
    const data = (await res.json().catch(() => ({}))) as {
      data?: { created?: number; status?: string };
    };
    const created = data.data?.created;
    // Beehiiv returns the existing subscription for duplicates; treat anything
    // created more than two minutes ago as "already subscribed".
    const already = typeof created === "number" && Date.now() / 1000 - created > 120;
    return NextResponse.json({ ok: true, status: already ? "already" : "subscribed" });
  } catch (err) {
    console.error("[subscribe] provider error", err);
    return NextResponse.json({ ok: false, error: "provider" }, { status: 502 });
  }
}
