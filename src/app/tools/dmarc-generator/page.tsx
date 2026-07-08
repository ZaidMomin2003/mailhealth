"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import Link from "next/link";

export default function DmarcGeneratorPage() {
  const [policy, setPolicy] = useState<"none" | "quarantine" | "reject">("none");
  const [subPolicy, setSubPolicy] = useState<"none" | "quarantine" | "reject">("none");
  const [ruaEmail, setRuaEmail] = useState("");
  const [rufEmail, setRufEmail] = useState("");
  const [percentage, setPercentage] = useState("100");
  const [alignment, setAlignment] = useState<"relaxed" | "strict">("relaxed");
  const [copied, setCopied] = useState(false);

  const generateRecord = () => {
    const parts = [`v=DMARC1; p=${policy}`];
    if (subPolicy !== policy) parts.push(`sp=${subPolicy}`);
    if (ruaEmail.trim()) parts.push(`rua=mailto:${ruaEmail.trim()}`);
    if (rufEmail.trim()) parts.push(`ruf=mailto:${rufEmail.trim()}`);
    if (percentage !== "100") parts.push(`pct=${percentage}`);
    if (alignment === "strict") parts.push("adkim=s; aspf=s");
    return parts.join("; ");
  };

  const record = generateRecord();

  const handleCopy = () => {
    navigator.clipboard.writeText(record);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-[740px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <h1 className="text-[28px] font-bold text-foreground tracking-[-0.02em] mb-2">DMARC Record Generator</h1>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
        Configure your DMARC policy. This record tells receiving servers what to do when emails fail authentication.
      </p>

      <div className="space-y-6 mb-8">
        {/* Policy */}
        <div>
          <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Domain Policy</label>
          <div className="grid grid-cols-3 gap-2">
            {(["none", "quarantine", "reject"] as const).map((p) => (
              <button key={p} onClick={() => setPolicy(p)} className={`px-3 py-2.5 rounded-md border text-left transition-colors ${policy === p ? "border-blue-500/50 bg-blue-500/5" : "border-border hover:bg-muted/50"}`}>
                <span className="text-[13px] font-medium text-foreground block capitalize">{p}</span>
                <span className="text-[10px] text-muted-foreground">{p === "none" ? "Monitor only" : p === "quarantine" ? "Send to spam" : "Block delivery"}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sub-domain policy */}
        <div>
          <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Subdomain Policy</label>
          <select value={subPolicy} onChange={(e) => setSubPolicy(e.target.value as typeof subPolicy)} className="h-9 px-3 bg-muted/50 border border-border rounded-md text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20">
            <option value="none">none</option>
            <option value="quarantine">quarantine</option>
            <option value="reject">reject</option>
          </select>
        </div>

        {/* Reports */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Aggregate Reports (rua)</label>
            <input value={ruaEmail} onChange={(e) => setRuaEmail(e.target.value)} placeholder="dmarc@yourdomain.com" className="w-full h-9 px-3 bg-muted/50 border border-border rounded-md text-[13px] text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground/50" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Forensic Reports (ruf)</label>
            <input value={rufEmail} onChange={(e) => setRufEmail(e.target.value)} placeholder="forensic@yourdomain.com" className="w-full h-9 px-3 bg-muted/50 border border-border rounded-md text-[13px] text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground/50" />
          </div>
        </div>

        {/* Percentage & Alignment */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Percentage (pct)</label>
            <input value={percentage} onChange={(e) => setPercentage(e.target.value)} type="number" min="1" max="100" className="w-full h-9 px-3 bg-muted/50 border border-border rounded-md text-[13px] text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring/20" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Alignment</label>
            <select value={alignment} onChange={(e) => setAlignment(e.target.value as typeof alignment)} className="w-full h-9 px-3 bg-muted/50 border border-border rounded-md text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20">
              <option value="relaxed">Relaxed</option>
              <option value="strict">Strict</option>
            </select>
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="border border-border rounded-lg overflow-hidden mb-3">
        <div className="px-4 py-3 bg-muted/30 border-b border-border">
          <span className="text-[12px] font-medium text-muted-foreground">Add this TXT record to <code className="font-mono">_dmarc.yourdomain.com</code></span>
        </div>
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
          <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Generated Record</span>
          <button onClick={handleCopy} className="h-7 px-2.5 bg-yellow-400 hover:bg-yellow-500 text-black text-[11px] font-medium rounded flex items-center gap-1.5 transition-colors">
            {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
          </button>
        </div>
        <div className="px-4 py-3">
          <code className="text-[13px] font-mono text-foreground break-all leading-relaxed">{record}</code>
        </div>
      </div>

      {/* SEO Content */}
      <section className="border-t border-border pt-8 mt-10 space-y-6">
        <h2 className="text-[20px] font-bold text-foreground">How to Generate a DMARC Record — Policy, Reporting, and Alignment</h2>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          A DMARC record is a DNS TXT entry published at _dmarc.yourdomain.com that tells receiving servers how to handle emails failing SPF or DKIM checks. The three policy levels — none, quarantine, and reject — give you incremental control. Start with p=none for monitoring, review your aggregate reports to identify all legitimate senders, then progressively move to quarantine and finally reject for full enforcement.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          The rua tag is essential — it specifies where aggregate reports are delivered. These daily XML reports from providers like Google and Yahoo show every IP that sent email using your domain, along with SPF/DKIM pass or fail results. Without rua configured, you&apos;re flying blind. The pct tag lets you roll out enforcement gradually — setting pct=25 means only 25% of failing messages get the policy applied, with the rest treated as p=none.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          Alignment (adkim and aspf) determines how strictly the domain in the From header must match the domains used in DKIM signing and SPF checks. Relaxed alignment (default) allows subdomains to pass, while strict requires exact domain matches. Use strict alignment when you want to prevent subdomains from inheriting authentication from the parent domain.
        </p>

        <h2 className="text-[18px] font-bold text-foreground mt-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">What DMARC policy should I start with?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Always start with p=none and configure rua reporting. Monitor reports for 2-4 weeks to identify all legitimate email sources. Once you&apos;ve confirmed all senders pass authentication, move to p=quarantine, then p=reject. Skipping this process risks blocking legitimate emails.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">What email should I use for rua reports?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Use a dedicated mailbox like dmarc@yourdomain.com or a third-party DMARC reporting service. Aggregate reports are XML files that arrive daily from every provider that processes your email — the volume can be significant for domains with heavy sending. A parsing tool makes these reports actionable.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Do I need a subdomain policy (sp=) if I don&apos;t send from subdomains?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Yes — set sp=reject if you don&apos;t send email from subdomains. Without an explicit sp= tag, subdomains inherit the parent domain&apos;s policy. If your main domain is p=none during monitoring, attackers could spoof subdomain@yourdomain.com with no enforcement. Setting sp=reject blocks this vector.</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-[14px] font-semibold text-foreground mb-2">Related Tools</h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/tools/dmarc-checker" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DMARC Checker</Link>
            <Link href="/tools/dmarc-analyzer" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DMARC Report Analyzer</Link>
            <Link href="/tools/spf-generator" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">SPF Record Generator</Link>
            <Link href="/tools/dkim-generator" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DKIM Record Generator</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
