import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const h = await headers();
  const configured = Boolean(process.env.WEBDECOY_API_KEY?.trim());
  return Response.json(
    {
      reportingConfigured: configured,
      decision: configured ? h.get("x-webdecoy-decision") || null : null,
      wouldBlock: configured ? h.get("x-webdecoy-would-block") || null : null,
      note: "Request verdict only. Confirm the Test record in your own WebDecoy dashboard.",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
