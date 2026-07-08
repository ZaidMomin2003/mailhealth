"use client";

import { useState } from "react";
import { Search, CheckCircle2, XCircle, AlertCircle, Loader2, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface ScanResult {
  category: string;
  status: "pass" | "fail" | "warning";
  details: string;
  record?: string;
}

async function queryDns(name: string, type: string): Promise<string[]> {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`;
  const res = await fetch(url, { headers: { Accept: "application/dns-json" } });
  const data = await res.json();
  if (!data.Answer) return [];
  return data.Answer.map((a: { data: string }) => a.data.replace(/"/g, ""));
}

async function scanDomain(domain: string): Promise<ScanResult[]> {
  const results: ScanResult[] = [];

  // MX
  const mxUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`;
  const mxRes = await fetch(mxUrl, { headers: { Accept: "application/dns-json" } });
  const mxData = await mxRes.json();
  if (mxData.Answer && mxData.Answer.length > 0) {
    results.push({ category: "MX Records", status: "pass", details: `${mxData.Answer.length} mail server(s) configured.`, record: mxData.Answer.map((a: { data: string }) => a.data).join(", ") });
  } else {
    results.push({ category: "MX Records", status: "fail", details: "No MX records. This domain cannot receive email." });
  }

  // SPF
  const txt = await queryDns(domain, "TXT");
  const spf = txt.find((r) => r.toLowerCase().startsWith("v=spf1"));
  results.push(spf
    ? { category: "SPF", status: "pass", details: "SPF record found.", record: spf }
    : { category: "SPF", status: "fail", details: "No SPF record. Sending authority cannot be verified." }
  );

  // DMARC
  const dmarc = await queryDns(`_dmarc.${domain}`, "TXT");
  const dmarcRec = dmarc.find((r) => r.toLowerCase().startsWith("v=dmarc1"));
  if (dmarcRec) {
    const pol = dmarcRec.match(/p=([^;]+)/i);
    const pVal = pol ? pol[1].trim().toLowerCase() : "none";
    results.push({ category: "DMARC", status: pVal === "reject" ? "pass" : "warning", details: `Policy: ${pVal}`, record: dmarcRec });
  } else {
    results.push({ category: "DMARC", status: "fail", details: "No DMARC record. No spoofing protection." });
  }

  // DKIM
  const selectors = ["google", "default", "selector1", "selector2", "dkim", "mail"];
  let dkimFound = false;
  for (const sel of selectors) {
    const recs = await queryDns(`${sel}._domainkey.${domain}`, "TXT");
    if (recs.find((r) => r.includes("v=DKIM1") || r.includes("p="))) {
      results.push({ category: "DKIM", status: "pass", details: `Found with selector "${sel}".` });
      dkimFound = true; break;
    }
  }
  if (!dkimFound) results.push({ category: "DKIM", status: "warning", details: "Not detected with common selectors." });

  // BIMI
  const bimi = await queryDns(`default._bimi.${domain}`, "TXT");
  const bimiRec = bimi.find((r) => r.toLowerCase().startsWith("v=bimi1"));
  results.push(bimiRec
    ? { category: "BIMI", status: "pass", details: "BIMI record configured.", record: bimiRec }
    : { category: "BIMI", status: "warning", details: "No BIMI record. Brand logo won't appear in clients." }
  );

  return results;
}

export default function DomainScannerPage() {
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState<ScanResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!domain.trim()) return;
    setLoading(true); setResults(null);
    try { setResults(await scanDomain(domain.trim().toLowerCase())); }
    catch { setResults([]); }
    finally { setLoading(false); }
  };

  const icon = (s: string) => {
    if (s === "pass") return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (s === "fail") return <XCircle className="w-4 h-4 text-red-400" />;
    return <AlertCircle className="w-4 h-4 text-yellow-400" />;
  };

  const badge = (s: string) => {
    const base = "text-[10px] font-medium px-2 py-0.5 rounded";
    if (s === "pass") return <span className={`${base} bg-emerald-500/10 text-emerald-400`}>Pass</span>;
    if (s === "fail") return <span className={`${base} bg-red-500/10 text-red-400`}>Fail</span>;
    return <span className={`${base} bg-yellow-500/10 text-yellow-400`}>Warn</span>;
  };

  const passCount = results?.filter((r) => r.status === "pass").length || 0;
  const total = results?.length || 0;

  return (
    <div className="max-w-[740px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <h1 className="text-[28px] font-bold text-foreground tracking-[-0.02em] mb-2">Domain Scanner</h1>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
        Comprehensive email infrastructure scan. Checks MX, SPF, DKIM, DMARC, and BIMI in one go.
      </p>

      <div className="flex gap-2 mb-8">
        <input value={domain} onChange={(e) => setDomain(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleScan()} placeholder="yourdomain.com" className="flex-1 h-10 px-4 bg-muted/50 border border-border rounded-lg text-[14px] text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground/50" />
        <button onClick={handleScan} disabled={loading || !domain.trim()} className="h-10 px-5 bg-yellow-400 hover:bg-yellow-500 text-black text-[13px] font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-40">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /> Scan</>}
        </button>
      </div>

      {results && results.length > 0 && (
        <div className="space-y-4">
          {/* Score summary */}
          <div className="p-4 border border-border rounded-lg flex items-center gap-4">
            <div className={`text-[24px] font-bold tabular-nums ${passCount === total ? "text-emerald-400" : passCount >= total / 2 ? "text-yellow-400" : "text-red-400"}`}>
              {passCount}/{total}
            </div>
            <div>
              <p className="text-[14px] font-medium text-foreground">Checks Passed</p>
              <p className="text-[12px] text-muted-foreground">{passCount === total ? "All good! Your domain is fully configured." : "Some issues need attention."}</p>
            </div>
          </div>

          {/* Results */}
          <div className="border border-border rounded-lg divide-y divide-border">
            {results.map((r) => (
              <div key={r.category} className="px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {icon(r.status)}
                    <div>
                      <span className="text-[13px] font-medium text-foreground">{r.category}</span>
                      <p className="text-[12px] text-muted-foreground">{r.details}</p>
                    </div>
                  </div>
                  {badge(r.status)}
                </div>
                {r.record && (
                  <div className="mt-2 ml-[30px] px-3 py-2 bg-muted/30 rounded-md">
                    <code className="text-[11px] font-mono text-muted-foreground break-all">{r.record}</code>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 border border-blue-500/20 bg-blue-500/5 rounded-lg">
            <p className="text-[13px] text-foreground font-medium mb-1">Fix this automatically with Cleanmails</p>
            <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">Self-hosted email infrastructure with automated DNS setup, unlimited domains, and zero monthly fees.</p>
            <a href="https://cleanmails.online" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Learn more about Cleanmails <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* SEO Content */}
      <section className="border-t border-border pt-8 mt-10 space-y-6">
        <h2 className="text-[20px] font-bold text-foreground">Complete Email Domain Health Check — What Gets Scanned</h2>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          A domain health check for email examines the full stack of DNS records that determine whether your emails reach the inbox. This scanner audits five critical components in a single request: MX records (mail server routing), SPF (sender authorization), DKIM (cryptographic signatures), DMARC (authentication policy), and BIMI (brand logo display). Each component plays a different role in the email delivery pipeline.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          MX records tell other mail servers where to deliver email destined for your domain. Without properly configured MX records, your domain can&apos;t receive replies to your outbound campaigns. SPF authorizes specific IPs and include mechanisms, while DKIM proves message integrity with public-key cryptography. DMARC brings them together with an enforcement policy, and BIMI adds visual trust signals by displaying your brand logo in supported inboxes.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          Run this email infrastructure audit before every campaign launch, after DNS changes, or when onboarding a new sending domain. The pass/fail scoring gives you an instant picture of your domain&apos;s sending readiness without needing to check each record type individually.
        </p>

        <h2 className="text-[18px] font-bold text-foreground mt-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">What score should my domain get on this scan?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Aim for 5/5 — all checks passing. At minimum, MX, SPF, and DMARC must pass for acceptable deliverability. DKIM detection depends on knowing the selector, and BIMI is optional but improves brand trust and open rates in supported clients.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Why does DKIM show as &quot;warning&quot; instead of pass or fail?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">DKIM records are published under selector-specific subdomains (e.g., google._domainkey.domain.com). The scanner checks common selectors but can&apos;t test every possible name. A warning means the record wasn&apos;t found under standard selectors — it may still exist under a custom one.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">How often should I run a domain health check?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">At minimum monthly, and always after DNS changes, adding new email services, or switching hosting providers. DNS records can be accidentally overwritten or deleted during migrations, silently breaking your email authentication.</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-[14px] font-semibold text-foreground mb-2">Related Tools</h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/tools/dns-audit" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DNS Authentication Checker</Link>
            <Link href="/tools/dmarc-checker" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DMARC Checker</Link>
            <Link href="/tools/bimi-checker" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">BIMI Checker</Link>
            <Link href="/tools/ip-reputation" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">IP Reputation Check</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
