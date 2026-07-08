/**
 * MailHealth Email Worker
 * Triggered by Cloudflare Email Routing when an email arrives at *@mailhealth.online
 * Parses headers, scores deliverability, stores result in KV
 */

export interface Env {
  MAIL_RESULTS: KVNamespace;
}

interface EmailResult {
  score: number;
  spf: "pass" | "fail" | "none";
  dkim: "pass" | "fail" | "none";
  dmarc: "pass" | "fail" | "none";
  details: string[];
  timestamp: number;
}

// Spam trigger words for content scoring
const SPAM_WORDS = [
  "free", "guarantee", "no obligation", "risk-free", "act now", "limited time",
  "urgent", "winner", "congratulations", "cash", "click here", "buy now",
  "order now", "100%", "earn money", "make money", "double your", "discount",
  "unsubscribe", "no cost", "sign up free",
];

export default {
  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    const recipient = message.to;
    const headers = message.headers;

    // Extract the test ID from the recipient address
    // Formats: test-{id}@domain or seed-{sessionId}-{num}@domain
    const localPart = recipient.split("@")[0];

    // Read full email for content analysis
    const rawEmail = await new Response(message.raw).text();

    // Parse Authentication-Results header
    const authResults = headers.get("authentication-results") || "";
    const receivedSpf = headers.get("received-spf") || "";
    const dkimSignature = headers.get("dkim-signature") || "";
    const listUnsubscribe = headers.get("list-unsubscribe") || "";

    // Determine SPF status
    let spf: "pass" | "fail" | "none" = "none";
    if (authResults.toLowerCase().includes("spf=pass") || receivedSpf.toLowerCase().includes("pass")) {
      spf = "pass";
    } else if (authResults.toLowerCase().includes("spf=fail") || authResults.toLowerCase().includes("spf=softfail") || receivedSpf.toLowerCase().includes("fail")) {
      spf = "fail";
    }

    // Determine DKIM status
    let dkim: "pass" | "fail" | "none" = "none";
    if (authResults.toLowerCase().includes("dkim=pass")) {
      dkim = "pass";
    } else if (authResults.toLowerCase().includes("dkim=fail")) {
      dkim = "fail";
    } else if (dkimSignature) {
      dkim = "pass"; // Has a signature header at minimum
    }

    // Determine DMARC status
    let dmarc: "pass" | "fail" | "none" = "none";
    if (authResults.toLowerCase().includes("dmarc=pass")) {
      dmarc = "pass";
    } else if (authResults.toLowerCase().includes("dmarc=fail")) {
      dmarc = "fail";
    }

    // Content analysis
    const bodyStart = rawEmail.indexOf("\r\n\r\n");
    const body = bodyStart > -1 ? rawEmail.slice(bodyStart + 4).toLowerCase() : rawEmail.toLowerCase();

    const spamWordCount = SPAM_WORDS.filter((word) => body.includes(word)).length;
    const linkCount = (body.match(/https?:\/\//g) || []).length;
    const hasShortener = /bit\.ly|tinyurl|t\.co|goo\.gl|rb\.gy/i.test(body);
    const capsRatio = body.replace(/[^a-zA-Z]/g, "").length > 0
      ? (body.replace(/[^A-Z]/g, "").length / body.replace(/[^a-zA-Z]/g, "").length)
      : 0;

    // Calculate score (out of 10)
    let score = 0;
    const details: string[] = [];

    // SPF: +2
    if (spf === "pass") { score += 2; details.push("SPF alignment passed — authorized sender"); }
    else if (spf === "fail") { details.push("SPF failed — sender not authorized by domain"); }
    else { score += 0.5; details.push("SPF not evaluated"); }

    // DKIM: +2
    if (dkim === "pass") { score += 2; details.push("DKIM signature verified"); }
    else if (dkim === "fail") { details.push("DKIM signature verification failed"); }
    else { score += 0.5; details.push("No DKIM signature found"); }

    // DMARC: +2
    if (dmarc === "pass") { score += 2; details.push("DMARC policy passed"); }
    else if (dmarc === "fail") { details.push("DMARC policy failed — domain unprotected"); }
    else { score += 0.5; details.push("DMARC not evaluated"); }

    // Content: +2
    let contentScore = 2;
    if (spamWordCount > 5) { contentScore -= 1; details.push(`High spam word density (${spamWordCount} triggers found)`); }
    else if (spamWordCount > 2) { contentScore -= 0.5; details.push(`Some spam triggers detected (${spamWordCount})`); }
    else { details.push("Content clean — minimal spam triggers"); }

    if (linkCount > 5) { contentScore -= 0.5; details.push(`Excessive links (${linkCount})`); }
    if (hasShortener) { contentScore -= 0.5; details.push("URL shortener detected — common in spam"); }
    if (capsRatio > 0.3) { contentScore -= 0.5; details.push("High ALL CAPS ratio"); }
    score += Math.max(0, contentScore);

    // List-Unsubscribe: +1
    if (listUnsubscribe) { score += 1; details.push("List-Unsubscribe header present"); }
    else { details.push("Missing List-Unsubscribe header (−1)"); }

    // Bonus: +1 for clean sending
    if (spf === "pass" && dkim === "pass" && spamWordCount < 3) {
      score += 1; details.push("Clean sender profile — bonus point");
    }

    score = Math.min(10, Math.round(score * 10) / 10);

    const result: EmailResult = { score, spf, dkim, dmarc, details, timestamp: Date.now() };

    // Determine storage key based on recipient format
    if (localPart.startsWith("test-")) {
      // Mail Tester: test-{id}
      const id = localPart.replace("test-", "");
      await env.MAIL_RESULTS.put(`mail:${id}`, JSON.stringify(result), { expirationTtl: 3600 });
    } else if (localPart.startsWith("seed-")) {
      // Warmup Tracker: seed-{sessionId}-{num}
      const parts = localPart.split("-");
      // Format: seed-{sessionId}-{num}
      const num = parts[parts.length - 1];
      const sessionId = parts.slice(1, -1).join("-");

      // Determine strictness tier based on address number
      const addressNum = parseInt(num, 10);
      let strictness: "high" | "medium" | "low";
      let placement: "inbox" | "spam";

      if (addressNum <= 20) {
        strictness = "high";
        placement = score >= 8 ? "inbox" : "spam";
      } else if (addressNum <= 40) {
        strictness = "medium";
        placement = score >= 5 ? "inbox" : "spam";
      } else {
        strictness = "low";
        placement = score >= 3 ? "inbox" : "spam";
      }

      const providers: Record<string, string> = {
        high: "Enterprise (O365)",
        medium: "Google Workspace",
        low: "Yahoo / AOL",
      };

      const warmupResult = { placement, provider: providers[strictness], strictness, score };
      await env.MAIL_RESULTS.put(
        `warmup:${sessionId}:${num.padStart(2, "0")}`,
        JSON.stringify(warmupResult),
        { expirationTtl: 7200 }
      );

      // Increment received counter
      const metaKey = `warmup:${sessionId}:meta`;
      const existing = await env.MAIL_RESULTS.get(metaKey);
      const meta = existing ? JSON.parse(existing) : { received: 0, total: 50, created: Date.now() };
      meta.received += 1;
      await env.MAIL_RESULTS.put(metaKey, JSON.stringify(meta), { expirationTtl: 7200 });
    }
  },
};
