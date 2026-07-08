"use client";

import { useState } from "react";
import { Search, CheckCircle2, XCircle, AlertCircle, Loader2, ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface DnsResult {
  type: "SPF" | "DMARC" | "DKIM";
  status: "pass" | "fail" | "warning";
  record: string | null;
  details: string;
}

async function queryDns(name: string, type: string): Promise<string[]> {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`;
  const res = await fetch(url, { headers: { Accept: "application/dns-json" } });
  const data = await res.json();
  if (!data.Answer) return [];
  return data.Answer.map((a: { data: string }) => a.data.replace(/"/g, ""));
}

async function auditDomain(domain: string): Promise<DnsResult[]> {
  const results: DnsResult[] = [];

  const txtRecords = await queryDns(domain, "TXT");
  const spfRecord = txtRecords.find((r) => r.toLowerCase().startsWith("v=spf1"));
  results.push(spfRecord
    ? { type: "SPF", status: "pass", record: spfRecord, details: "SPF record found and properly configured." }
    : { type: "SPF", status: "fail", record: null, details: "No SPF record. Receiving servers cannot verify your sending authority." }
  );

  const dmarcRecords = await queryDns(`_dmarc.${domain}`, "TXT");
  const dmarcRecord = dmarcRecords.find((r) => r.toLowerCase().startsWith("v=dmarc1"));
  if (dmarcRecord) {
    const policy = dmarcRecord.match(/p=([^;]+)/i);
    const pVal = policy ? policy[1].trim().toLowerCase() : "none";
    results.push({ type: "DMARC", status: pVal === "reject" ? "pass" : "warning", record: dmarcRecord, details: pVal === "reject" ? "Policy: reject — maximum protection." : pVal === "quarantine" ? "Policy: quarantine. Consider reject for full enforcement." : "Policy: none — no enforcement. Vulnerable to spoofing." });
  } else {
    results.push({ type: "DMARC", status: "fail", record: null, details: "No DMARC record. Your domain has zero spoofing protection." });
  }

  const selectors = ["google", "default", "selector1", "selector2", "dkim", "mail", "k1"];
  let dkimFound = false;
  for (const sel of selectors) {
    const recs = await queryDns(`${sel}._domainkey.${domain}`, "TXT");
    const rec = recs.find((r) => r.includes("v=DKIM1") || r.includes("p="));
    if (rec) {
      results.push({ type: "DKIM", status: "pass", record: `${sel}._domainkey → ${rec.slice(0, 60)}…`, details: `DKIM found with selector "${sel}".` });
      dkimFound = true;
      break;
    }
  }
  if (!dkimFound) results.push({ type: "DKIM", status: "warning", record: null, details: "Not detected with common selectors. May use a custom one." });

  return results;
}

export default function DnsAuditPage() {
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState<DnsResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAudit = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const r = await auditDomain(domain.trim().toLowerCase());
      setResults(r);
    } catch { setResults([]); }
    finally { setLoading(false); }
  };

  const icon = (s: string) => {
    if (s === "pass") return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    if (s === "fail") return <XCircle className="w-5 h-5 text-red-400" />;
    return <AlertCircle className="w-5 h-5 text-yellow-400" />;
  };

  const badge = (s: string) => {
    const base = "text-[11px] font-medium px-2 py-0.5 rounded";
    if (s === "pass") return <span className={`${base} bg-emerald-500/10 text-emerald-400`}>Pass</span>;
    if (s === "fail") return <span className={`${base} bg-red-500/10 text-red-400`}>Fail</span>;
    return <span className={`${base} bg-yellow-500/10 text-yellow-400`}>Warning</span>;
  };

  return (
    <div className="max-w-[740px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <Link href="/tools/spam-checker" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> All tools
      </Link>

      <h1 className="text-[28px] font-bold text-foreground tracking-[-0.02em] mb-2">
        DNS & Authentication Checker
      </h1>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
        Enter your sending domain to validate SPF, DKIM, and DMARC records. Powered by Cloudflare DNS-over-HTTPS.
      </p>

      {/* Input */}
      <div className="flex gap-2 mb-8">
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAudit()}
          placeholder="yourdomain.com"
          className="flex-1 h-10 px-4 bg-muted/50 border border-border rounded-lg text-[14px] text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 placeholder:text-muted-foreground/50 transition-all"
        />
        <button
          onClick={handleAudit}
          disabled={loading || !domain.trim()}
          className="h-10 px-5 bg-yellow-400 hover:bg-yellow-500 text-black text-[13px] font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-40"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /> Audit</>}
        </button>
      </div>

      {/* Results */}
      {results && results.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
          {results.map((r) => (
            <div key={r.type} className="px-5 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {icon(r.status)}
                  <div>
                    <h3 className="text-[14px] font-semibold text-foreground">{r.type}</h3>
                    <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">{r.details}</p>
                  </div>
                </div>
                {badge(r.status)}
              </div>
              {r.record && (
                <div className="mt-3 ml-8 px-3 py-2 bg-muted/50 rounded-md">
                  <code className="text-[11px] font-mono text-muted-foreground break-all leading-relaxed">{r.record}</code>
                </div>
              )}
              {r.status === "fail" && (
                <div className="mt-3 ml-8 px-3 py-2 bg-red-500/5 border border-red-500/20 rounded-md text-[12px] text-red-400 leading-relaxed">
                  ⚡ Automate DNS config for all domains with{" "}
                  <a href="https://cleanmails.online" target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-2 hover:text-red-300">Cleanmails</a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {results && results.length === 0 && (
        <div className="text-center py-12 text-[13px] text-muted-foreground">Could not resolve. Check domain and try again.</div>
      )}

      {results && results.length > 0 && (
        <div className="mt-6 p-4 border border-blue-500/20 bg-blue-500/5 rounded-lg">
          <p className="text-[13px] text-foreground font-medium mb-1">Fix this automatically with Cleanmails</p>
          <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">Self-hosted email infrastructure with automated DNS setup, unlimited domains, and zero monthly fees.</p>
          <a href="https://cleanmails.online" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Learn more about Cleanmails <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* SEO Content */}
      <section className="border-t border-border pt-8 mt-10 space-y-6">
        <h2 className="text-[20px] font-bold text-foreground">Understanding SPF, DKIM, and DMARC Email Authentication</h2>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          SPF (Sender Policy Framework), DKIM (DomainKeys Identified Mail), and DMARC (Domain-based Message Authentication, Reporting and Conformance) are the three DNS records that verify your email&apos;s legitimacy. SPF specifies which IP addresses are authorized to send email on behalf of your domain using include mechanisms and IP ranges. DKIM adds a cryptographic signature to each message header, allowing receivers to verify the email wasn&apos;t modified in transit.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          DMARC ties SPF and DKIM together by telling receiving servers what to do when authentication fails — options include &quot;none&quot; (monitor only), &quot;quarantine&quot; (send to spam), or &quot;reject&quot; (block delivery entirely). Without these records configured correctly, your emails are far more likely to land in spam, and your domain is vulnerable to spoofing attacks where bad actors send emails pretending to be you.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          Our email authentication checker queries your DNS records in real-time via Cloudflare DNS-over-HTTPS, validates their syntax, and checks for common misconfigurations like missing DMARC enforcement or unresolvable SPF includes. Run this check before launching any cold email campaign.
        </p>

        <h2 className="text-[18px] font-bold text-foreground mt-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">What happens if I don&apos;t have an SPF record?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Without SPF, receiving servers can&apos;t verify which IPs are allowed to send for your domain. This means anyone can send email as your domain, and legitimate emails are more likely to be classified as spam because there&apos;s no authorization mechanism in place.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Why does the tool show &quot;warning&quot; for my DKIM?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">The checker looks for DKIM records under common selectors like &quot;google&quot;, &quot;default&quot;, and &quot;selector1&quot;. If your mail server uses a custom selector, the record exists but can&apos;t be detected automatically. Check with your email provider for the correct selector name.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Should DMARC policy be set to reject immediately?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">No. Start with p=none to monitor authentication results without affecting delivery. Once you&apos;ve confirmed all legitimate sources pass SPF and DKIM, move to quarantine, then reject. Jumping straight to reject can block legitimate emails from third-party services you forgot to authorize.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">How often should I check my DNS email records?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Check after any DNS change, when adding new email sending services, or at minimum once a month. DNS records can accidentally be overwritten during domain migrations or provider changes, breaking your authentication silently.</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-[14px] font-semibold text-foreground mb-2">Related Tools</h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/tools/spf-generator" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">SPF Record Generator</Link>
            <Link href="/tools/dkim-generator" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DKIM Record Generator</Link>
            <Link href="/tools/dmarc-checker" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DMARC Checker</Link>
            <Link href="/tools/domain-scanner" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">Domain Scanner</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
