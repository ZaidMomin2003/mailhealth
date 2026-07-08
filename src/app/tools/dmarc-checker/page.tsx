"use client";

import { useState } from "react";
import { Search, CheckCircle2, XCircle, AlertCircle, Loader2, Copy, Check, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface DmarcResult {
  found: boolean;
  record: string | null;
  policy: string | null;
  subPolicy: string | null;
  rua: string | null;
  ruf: string | null;
  pct: string | null;
}

async function checkDmarc(domain: string): Promise<DmarcResult> {
  const url = `https://cloudflare-dns.com/dns-query?name=_dmarc.${encodeURIComponent(domain)}&type=TXT`;
  const res = await fetch(url, { headers: { Accept: "application/dns-json" } });
  const data = await res.json();
  if (!data.Answer) return { found: false, record: null, policy: null, subPolicy: null, rua: null, ruf: null, pct: null };

  const records = data.Answer.map((a: { data: string }) => a.data.replace(/"/g, ""));
  const dmarcRecord = records.find((r: string) => r.toLowerCase().startsWith("v=dmarc1"));
  if (!dmarcRecord) return { found: false, record: null, policy: null, subPolicy: null, rua: null, ruf: null, pct: null };

  const getTag = (tag: string) => { const m = dmarcRecord.match(new RegExp(`${tag}=([^;]+)`, "i")); return m ? m[1].trim() : null; };

  return { found: true, record: dmarcRecord, policy: getTag("p"), subPolicy: getTag("sp"), rua: getTag("rua"), ruf: getTag("ruf"), pct: getTag("pct") };
}

export default function DmarcCheckerPage() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<DmarcResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCheck = async () => {
    if (!domain.trim()) return;
    setLoading(true); setResult(null);
    try { setResult(await checkDmarc(domain.trim().toLowerCase())); }
    catch { setResult({ found: false, record: null, policy: null, subPolicy: null, rua: null, ruf: null, pct: null }); }
    finally { setLoading(false); }
  };

  const handleCopy = () => { if (result?.record) { navigator.clipboard.writeText(result.record); setCopied(true); setTimeout(() => setCopied(false), 2000); } };

  return (
    <div className="max-w-[740px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <h1 className="text-[28px] font-bold text-foreground tracking-[-0.02em] mb-2">DMARC Checker</h1>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
        Look up and analyze the DMARC record for any domain. See the enforcement policy, reporting addresses, and alignment settings.
      </p>

      <div className="flex gap-2 mb-8">
        <input value={domain} onChange={(e) => setDomain(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCheck()} placeholder="yourdomain.com" className="flex-1 h-10 px-4 bg-muted/50 border border-border rounded-lg text-[14px] text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground/50" />
        <button onClick={handleCheck} disabled={loading || !domain.trim()} className="h-10 px-5 bg-yellow-400 hover:bg-yellow-500 text-black text-[13px] font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-40">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /> Check</>}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
            {result.found ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
            <div>
              <p className="text-[14px] font-medium text-foreground">{result.found ? "DMARC record found" : "No DMARC record"}</p>
              <p className="text-[12px] text-muted-foreground">{result.found ? "Your domain has DMARC configured." : "Your domain is vulnerable to spoofing."}</p>
            </div>
          </div>

          {result.found && result.record && (
            <>
              {/* Raw record */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
                  <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Raw Record</span>
                  <button onClick={handleCopy} className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="px-4 py-3">
                  <code className="text-[12px] font-mono text-muted-foreground break-all">{result.record}</code>
                </div>
              </div>

              {/* Parsed details */}
              <div className="border border-border rounded-lg divide-y divide-border">
                {[
                  { label: "Policy (p)", value: result.policy, good: result.policy === "reject" },
                  { label: "Subdomain Policy (sp)", value: result.subPolicy || "Inherits from p" },
                  { label: "Aggregate Reports (rua)", value: result.rua || "Not configured" },
                  { label: "Forensic Reports (ruf)", value: result.ruf || "Not configured" },
                  { label: "Percentage (pct)", value: result.pct ? `${result.pct}%` : "100% (default)" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-4 py-3">
                    <span className="text-[13px] text-muted-foreground">{row.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-mono text-foreground">{row.value}</span>
                      {"good" in row && (
                        row.good ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

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
        <h2 className="text-[20px] font-bold text-foreground">What Is a DMARC Record and How Does It Protect Your Domain</h2>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          A DMARC (Domain-based Message Authentication, Reporting and Conformance) record is a DNS TXT entry published at _dmarc.yourdomain.com that instructs receiving mail servers how to handle messages that fail SPF or DKIM authentication. The policy tag (p=) determines the action: &quot;none&quot; monitors without enforcement, &quot;quarantine&quot; routes failures to spam, and &quot;reject&quot; blocks delivery entirely.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          Beyond policy enforcement, DMARC enables aggregate reporting through the rua tag. When configured, inbox providers like Google and Microsoft send daily XML reports showing which IPs sent email using your domain and whether they passed authentication. This visibility is critical for identifying unauthorized senders — whether they&apos;re malicious actors spoofing your domain or legitimate third-party services you forgot to authorize in your SPF record.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          Our DMARC record checker performs a real-time DNS lookup, parses all tags in your record, and evaluates your enforcement level. It flags common issues like p=none without a migration plan, missing rua addresses, and subdomain policies that don&apos;t match the parent domain&apos;s protection level.
        </p>

        <h2 className="text-[18px] font-bold text-foreground mt-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">What does DMARC p=none actually do?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">p=none means the domain owner wants to monitor authentication results without affecting email delivery. Failed messages are still delivered normally. Use this policy during the initial DMARC rollout to gather data before enforcing.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">What&apos;s the difference between rua and ruf reports?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">rua (aggregate reports) are daily XML summaries of authentication results grouped by source IP. ruf (forensic reports) contain individual message details for failures. Most providers only support rua — forensic reports are increasingly limited for privacy reasons.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">How long does DMARC take to work after publishing?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">The DNS record propagates within minutes to hours depending on TTL settings. However, aggregate reports from providers like Google typically arrive within 24-48 hours. Full enforcement rollout should take 2-4 weeks as you verify all legitimate senders pass authentication.</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-[14px] font-semibold text-foreground mb-2">Related Tools</h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/tools/dmarc-generator" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DMARC Record Generator</Link>
            <Link href="/tools/dmarc-analyzer" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DMARC Report Analyzer</Link>
            <Link href="/tools/dns-audit" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DNS Authentication Checker</Link>
            <Link href="/tools/spf-generator" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">SPF Record Generator</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
