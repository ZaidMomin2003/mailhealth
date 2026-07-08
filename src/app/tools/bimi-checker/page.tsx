"use client";

import { useState } from "react";
import { Search, CheckCircle2, XCircle, Loader2, Image, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface BimiResult {
  found: boolean;
  record: string | null;
  logoUrl: string | null;
  vmcUrl: string | null;
}

async function checkBimi(domain: string): Promise<BimiResult> {
  const url = `https://cloudflare-dns.com/dns-query?name=default._bimi.${encodeURIComponent(domain)}&type=TXT`;
  const res = await fetch(url, { headers: { Accept: "application/dns-json" } });
  const data = await res.json();
  if (!data.Answer) return { found: false, record: null, logoUrl: null, vmcUrl: null };

  const records = data.Answer.map((a: { data: string }) => a.data.replace(/"/g, ""));
  const bimiRecord = records.find((r: string) => r.toLowerCase().startsWith("v=bimi1"));
  if (!bimiRecord) return { found: false, record: null, logoUrl: null, vmcUrl: null };

  const logoMatch = bimiRecord.match(/l=([^;]+)/i);
  const vmcMatch = bimiRecord.match(/a=([^;]+)/i);

  return { found: true, record: bimiRecord, logoUrl: logoMatch ? logoMatch[1].trim() : null, vmcUrl: vmcMatch ? vmcMatch[1].trim() : null };
}

export default function BimiCheckerPage() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<BimiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!domain.trim()) return;
    setLoading(true); setResult(null);
    try { setResult(await checkBimi(domain.trim().toLowerCase())); }
    catch { setResult({ found: false, record: null, logoUrl: null, vmcUrl: null }); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-[740px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <h1 className="text-[28px] font-bold text-foreground tracking-[-0.02em] mb-2">BIMI Checker</h1>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
        Check if a domain has a BIMI (Brand Indicators for Message Identification) record configured. BIMI displays your logo in email clients.
      </p>

      <div className="flex gap-2 mb-8">
        <input value={domain} onChange={(e) => setDomain(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCheck()} placeholder="yourdomain.com" className="flex-1 h-10 px-4 bg-muted/50 border border-border rounded-lg text-[14px] text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground/50" />
        <button onClick={handleCheck} disabled={loading || !domain.trim()} className="h-10 px-5 bg-yellow-400 hover:bg-yellow-500 text-black text-[13px] font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-40">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /> Check</>}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
            {result.found ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
            <div>
              <p className="text-[14px] font-medium text-foreground">{result.found ? "BIMI record found" : "No BIMI record"}</p>
              <p className="text-[12px] text-muted-foreground">{result.found ? "Your brand logo can appear in email clients." : "Configure BIMI to show your logo in Gmail, Yahoo, etc."}</p>
            </div>
          </div>

          {result.found && (
            <>
              {result.record && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border">
                    <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Record</span>
                  </div>
                  <div className="px-4 py-3">
                    <code className="text-[12px] font-mono text-muted-foreground break-all">{result.record}</code>
                  </div>
                </div>
              )}

              <div className="border border-border rounded-lg divide-y divide-border">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[13px] text-muted-foreground">Logo URL</span>
                  <span className="text-[12px] font-mono text-foreground max-w-[300px] truncate">{result.logoUrl || "Not specified"}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[13px] text-muted-foreground">VMC Certificate</span>
                  <span className="text-[12px] font-mono text-foreground max-w-[300px] truncate">{result.vmcUrl || "Not specified"}</span>
                </div>
              </div>

              {result.logoUrl && (
                <div className="border border-border rounded-lg p-6 flex flex-col items-center gap-3">
                  <Image className="w-5 h-5 text-muted-foreground" />
                  <p className="text-[12px] text-muted-foreground">Logo preview (SVG required by BIMI)</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result.logoUrl} alt="BIMI logo" className="w-20 h-20 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
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
        <h2 className="text-[20px] font-bold text-foreground">What Is BIMI and How Does It Display Your Brand Logo in Email</h2>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          BIMI (Brand Indicators for Message Identification) is a DNS-based standard that allows organizations to display their verified brand logo next to emails in supporting inboxes. When a recipient opens their Gmail, Yahoo Mail, or Apple Mail inbox, they see your company&apos;s logo instead of a generic avatar — increasing brand recognition and trust at the point of delivery.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          To implement BIMI, you publish a TXT record at default._bimi.yourdomain.com containing two key tags: l= (the URL to your SVG logo in BIMI-specific Tiny PS format) and a= (an optional VMC — Verified Mark Certificate — from a certificate authority like DigiCert or Entrust). Gmail requires a VMC for logo display, while Yahoo and Apple Mail show logos without one. Your domain must also have DMARC enforcement (p=quarantine or p=reject) as a prerequisite.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          Our BIMI record checker performs a DNS lookup against the default._bimi subdomain, extracts the logo URL and VMC reference, and attempts to preview the SVG logo. Use it to verify your BIMI configuration is correct before expecting logo display in recipient inboxes.
        </p>

        <h2 className="text-[18px] font-bold text-foreground mt-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Do I need a VMC certificate for BIMI to work?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">It depends on the email client. Gmail requires a VMC (Verified Mark Certificate) purchased from DigiCert or Entrust, which costs around $1,500/year and requires a registered trademark. Yahoo Mail and Apple Mail display BIMI logos without a VMC.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">What format does the BIMI logo need to be?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">The logo must be an SVG file in the SVG Tiny Portable/Secure (SVG Tiny PS) profile. It should be square, centered, and hosted on HTTPS. Standard SVG files with JavaScript, animations, or external references will be rejected by email clients.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Why does BIMI require DMARC enforcement?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">BIMI requires DMARC with p=quarantine or p=reject to ensure only authenticated emails display your logo. Without enforcement, a spoofer could send emails as your domain and display your brand logo, defeating the purpose of visual trust indicators.</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-[14px] font-semibold text-foreground mb-2">Related Tools</h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/tools/dmarc-checker" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DMARC Checker</Link>
            <Link href="/tools/dmarc-generator" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DMARC Generator</Link>
            <Link href="/tools/domain-scanner" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">Domain Scanner</Link>
            <Link href="/tools/dns-audit" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DNS Authentication Checker</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
