"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";

interface DnsRecord {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

const RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SOA", "SRV", "PTR"];

async function lookupDns(domain: string, type: string): Promise<DnsRecord[]> {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`;
  const res = await fetch(url, { headers: { Accept: "application/dns-json" } });
  const data = await res.json();
  if (!data.Answer) return [];
  return data.Answer.map((a: DnsRecord) => ({ ...a, data: a.data.replace(/"/g, "") }));
}

export default function DnsLookupPage() {
  const [domain, setDomain] = useState("");
  const [recordType, setRecordType] = useState("A");
  const [results, setResults] = useState<DnsRecord[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!domain.trim()) return;
    setLoading(true); setResults(null);
    try { setResults(await lookupDns(domain.trim().toLowerCase(), recordType)); }
    catch { setResults([]); }
    finally { setLoading(false); }
  };

  const typeLabel = (t: number) => {
    const map: Record<number, string> = { 1: "A", 28: "AAAA", 5: "CNAME", 15: "MX", 16: "TXT", 2: "NS", 6: "SOA", 33: "SRV", 12: "PTR" };
    return map[t] || String(t);
  };

  return (
    <div className="max-w-[740px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <h1 className="text-[28px] font-bold text-foreground tracking-[-0.02em] mb-2">DNS Record Lookup</h1>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
        Query any DNS record type for any domain. Powered by Cloudflare DNS-over-HTTPS for fast, accurate results.
      </p>

      <div className="flex gap-2 mb-8">
        <input value={domain} onChange={(e) => setDomain(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLookup()} placeholder="example.com" className="flex-1 h-10 px-4 bg-muted/50 border border-border rounded-lg text-[14px] text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground/50" />
        <select value={recordType} onChange={(e) => setRecordType(e.target.value)} className="h-10 px-3 bg-muted/50 border border-border rounded-lg text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20">
          {RECORD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={handleLookup} disabled={loading || !domain.trim()} className="h-10 px-5 bg-yellow-400 hover:bg-yellow-500 text-black text-[13px] font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-40">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /> Lookup</>}
        </button>
      </div>

      {results !== null && (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
            <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">{results.length} record{results.length !== 1 && "s"} found</span>
          </div>
          {results.length > 0 ? (
            <div className="divide-y divide-border">
              {results.map((r, i) => (
                <div key={i} className="px-4 py-3 grid grid-cols-[60px_60px_1fr] gap-4 items-start">
                  <span className="text-[11px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-center">{typeLabel(r.type)}</span>
                  <span className="text-[11px] font-mono text-muted-foreground">TTL {r.TTL}</span>
                  <code className="text-[12px] font-mono text-foreground break-all leading-relaxed">{r.data}</code>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-[13px] text-muted-foreground">No records found for this query.</div>
          )}
        </div>
      )}

      {/* SEO Content */}
      <section className="border-t border-border pt-8 mt-10 space-y-6">
        <h2 className="text-[20px] font-bold text-foreground">How DNS Record Lookup Works for Email Deliverability</h2>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          DNS (Domain Name System) records are the foundation of email routing and authentication. When you send an email, receiving servers perform multiple DNS queries against your domain: MX records determine which servers handle your mail, TXT records contain SPF authorization rules and DKIM public keys, and A/AAAA records resolve your mail server hostnames to IP addresses. Understanding what&apos;s published in your DNS is the first step to diagnosing deliverability issues.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          This DNS checker tool queries Cloudflare&apos;s DNS-over-HTTPS resolver for fast, accurate results without caching delays. You can look up any record type — A records for IPv4 addresses, AAAA for IPv6, CNAME for aliases, MX for mail routing, TXT for authentication strings (SPF, DKIM, DMARC, domain verification), NS for nameservers, and SOA for zone authority information.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          For email-specific troubleshooting, start with TXT record lookups for your domain (to find SPF), _dmarc.yourdomain.com (for DMARC), and selector._domainkey.yourdomain.com (for DKIM). The TTL values show how long records are cached, which affects propagation speed after changes.
        </p>

        <h2 className="text-[18px] font-bold text-foreground mt-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Why do my DNS changes take time to propagate?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">DNS records are cached by resolvers worldwide based on the TTL (Time to Live) value. If your record has a TTL of 3600, resolvers will serve the cached version for up to one hour before checking for updates. Lower your TTL before making changes if you need faster propagation.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">What TXT records should I look for regarding email?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Look for records starting with &quot;v=spf1&quot; (SPF authorization), then check _dmarc.domain for &quot;v=DMARC1&quot; records, and selector._domainkey.domain for &quot;v=DKIM1&quot; records. Also check for domain verification TXT records from services like Google Workspace or Microsoft 365.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">What does it mean if no records are found?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Either the record type doesn&apos;t exist for that domain, the domain itself isn&apos;t registered, or DNS propagation hasn&apos;t completed yet. For email records, a missing TXT record means authentication isn&apos;t configured for that specific check (SPF, DKIM, or DMARC).</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-[14px] font-semibold text-foreground mb-2">Related Tools</h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/tools/dns-audit" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DNS Authentication Checker</Link>
            <Link href="/tools/domain-scanner" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">Domain Scanner</Link>
            <Link href="/tools/spf-generator" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">SPF Record Generator</Link>
            <Link href="/tools/dkim-generator" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DKIM Record Generator</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
