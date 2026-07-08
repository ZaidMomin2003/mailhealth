/**
 * MailHealth API Worker
 * HTTP endpoints for frontend to poll results from KV
 * Routes:
 *   GET /mail-test/result?id=xxx
 *   GET /warmup/results?session=xxx
 *   GET /ip-reputation?ip=x.x.x.x
 *   GET /health
 */

export interface Env {
  MAIL_RESULTS: KVNamespace;
  ALLOWED_ORIGIN: string;
}

// DNSBL servers to check
const BLOCKLISTS = [
  { name: "Spamhaus ZEN", host: "zen.spamhaus.org" },
  { name: "Barracuda", host: "b.barracudacentral.org" },
  { name: "SpamCop", host: "bl.spamcop.net" },
  { name: "SORBS", host: "dnsbl.sorbs.net" },
  { name: "CBL", host: "cbl.abuseat.org" },
  { name: "UCEPROTECT", host: "dnsbl-1.uceprotect.net" },
  { name: "PSBL", host: "psbl.surriel.com" },
  { name: "S5H", host: "all.s5h.net" },
];

function corsHeaders(origin: string, allowedOrigin: string): Record<string, string> {
  const allowed = origin === allowedOrigin || origin === "http://localhost:3000" || origin === "https://www.mailhealth.online";
  return {
    "Access-Control-Allow-Origin": allowed ? origin : allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(data: unknown, status: number, origin: string, allowedOrigin: string): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin, allowedOrigin),
    },
  });
}

// Reverse an IP for DNSBL lookups: 1.2.3.4 → 4.3.2.1
function reverseIp(ip: string): string {
  return ip.split(".").reverse().join(".");
}

// Check a single blocklist via Cloudflare DoH
async function checkBlocklist(reversedIp: string, host: string): Promise<boolean> {
  const query = `${reversedIp}.${host}`;
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(query)}&type=A`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/dns-json" },
      cf: { cacheTtl: 300 },
    });
    const data = await res.json() as { Answer?: { data: string }[] };
    // If there's an answer with 127.x.x.x, the IP is listed
    if (data.Answer && data.Answer.length > 0) {
      return data.Answer.some((a) => a.data.startsWith("127."));
    }
    return false;
  } catch {
    return false; // On error, assume clean
  }
}

// Get reverse DNS (PTR record) via DoH
async function getReverseDns(ip: string): Promise<string | null> {
  const reversed = reverseIp(ip);
  const query = `${reversed}.in-addr.arpa`;
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(query)}&type=PTR`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/dns-json" } });
    const data = await res.json() as { Answer?: { data: string }[] };
    if (data.Answer && data.Answer.length > 0) {
      return data.Answer[0].data.replace(/\.$/, "");
    }
    return null;
  } catch {
    return null;
  }
}

// Rate limiting via KV
async function isRateLimited(ip: string, env: Env): Promise<boolean> {
  const key = `ratelimit:${ip}`;
  const current = await env.MAIL_RESULTS.get(key);
  const count = current ? parseInt(current, 10) : 0;
  if (count >= 10) return true;
  await env.MAIL_RESULTS.put(key, String(count + 1), { expirationTtl: 60 });
  return false;
}

// Validate IPv4 format
function isValidIpv4(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const n = parseInt(p, 10);
    return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p;
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = env.ALLOWED_ORIGIN || "https://mailhealth.online";

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin, allowedOrigin) });
    }

    // Only allow GET
    if (request.method !== "GET") {
      return jsonResponse({ error: "Method not allowed" }, 405, origin, allowedOrigin);
    }

    const path = url.pathname;

    // --- Health check ---
    if (path === "/health") {
      return jsonResponse({ status: "ok", time: new Date().toISOString() }, 200, origin, allowedOrigin);
    }

    // --- Mail Tester: Get result ---
    if (path === "/mail-test/result") {
      const id = url.searchParams.get("id");
      if (!id || id.length < 4 || id.length > 12) {
        return jsonResponse({ error: "Invalid ID" }, 400, origin, allowedOrigin);
      }

      const result = await env.MAIL_RESULTS.get(`mail:${id}`);
      if (!result) {
        return jsonResponse({ status: "waiting" }, 200, origin, allowedOrigin);
      }

      return jsonResponse({ status: "received", ...JSON.parse(result) }, 200, origin, allowedOrigin);
    }

    // --- Warmup Tracker: Get results ---
    if (path === "/warmup/results") {
      const session = url.searchParams.get("session");
      if (!session || session.length < 4 || session.length > 16) {
        return jsonResponse({ error: "Invalid session" }, 400, origin, allowedOrigin);
      }

      // Get meta
      const meta = await env.MAIL_RESULTS.get(`warmup:${session}:meta`);
      const metaData = meta ? JSON.parse(meta) : { received: 0, total: 50, created: Date.now() };

      // Get individual results
      const results: unknown[] = [];
      for (let i = 1; i <= 50; i++) {
        const key = `warmup:${session}:${String(i).padStart(2, "0")}`;
        const val = await env.MAIL_RESULTS.get(key);
        if (val) {
          results.push({
            address: `seed-${session}-${i}@mailhealth.online`,
            ...JSON.parse(val),
          });
        }
      }

      return jsonResponse({
        total: metaData.total,
        received: metaData.received,
        results,
      }, 200, origin, allowedOrigin);
    }

    // --- IP Reputation ---
    if (path === "/ip-reputation") {
      const ip = url.searchParams.get("ip");
      if (!ip || !isValidIpv4(ip)) {
        return jsonResponse({ error: "Invalid IPv4 address" }, 400, origin, allowedOrigin);
      }

      // Rate limiting
      const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
      if (await isRateLimited(clientIp, env)) {
        return jsonResponse({ error: "Rate limited. Max 10 requests/minute." }, 429, origin, allowedOrigin);
      }

      // Check cache first
      const cacheKey = `iprep:${ip}`;
      const cached = await env.MAIL_RESULTS.get(cacheKey);
      if (cached) {
        return jsonResponse(JSON.parse(cached), 200, origin, allowedOrigin);
      }

      // Query all blocklists in parallel
      const reversedIp = reverseIp(ip);
      const blocklistResults = await Promise.all(
        BLOCKLISTS.map(async (bl) => ({
          name: bl.name,
          listed: await checkBlocklist(reversedIp, bl.host),
        }))
      );

      // Get reverse DNS
      const reverseDns = await getReverseDns(ip);

      // Calculate score
      const listedCount = blocklistResults.filter((b) => b.listed).length;
      const score = Math.max(0, 100 - listedCount * 15);

      const result = { ip, score, reverseDns, blocklists: blocklistResults };

      // Cache for 1 hour
      await env.MAIL_RESULTS.put(cacheKey, JSON.stringify(result), { expirationTtl: 3600 });

      return jsonResponse(result, 200, origin, allowedOrigin);
    }

    // --- 404 ---
    return jsonResponse({ error: "Not found" }, 404, origin, allowedOrigin);
  },
};
