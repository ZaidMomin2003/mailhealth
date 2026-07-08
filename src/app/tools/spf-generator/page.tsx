"use client";

import { useState } from "react";
import { Copy, Check, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

type Mechanism = { type: "include" | "ip4" | "ip6" | "a" | "mx"; value: string };

export default function SpfGeneratorPage() {
  const [mechanisms, setMechanisms] = useState<Mechanism[]>([{ type: "include", value: "" }]);
  const [policy, setPolicy] = useState<"~all" | "-all" | "?all">("~all");
  const [copied, setCopied] = useState(false);

  const addMechanism = () => setMechanisms([...mechanisms, { type: "include", value: "" }]);
  const removeMechanism = (i: number) => setMechanisms(mechanisms.filter((_, idx) => idx !== i));
  const updateMechanism = (i: number, field: "type" | "value", val: string) => {
    const updated = [...mechanisms];
    updated[i] = { ...updated[i], [field]: val };
    setMechanisms(updated);
  };

  const generateRecord = () => {
    const parts = ["v=spf1"];
    for (const m of mechanisms) {
      if (!m.value.trim()) continue;
      if (m.type === "include") parts.push(`include:${m.value.trim()}`);
      else if (m.type === "a") parts.push(`a:${m.value.trim()}`);
      else if (m.type === "mx") parts.push(`mx:${m.value.trim()}`);
      else parts.push(`${m.type}:${m.value.trim()}`);
    }
    parts.push(policy);
    return parts.join(" ");
  };

  const record = generateRecord();

  const handleCopy = () => {
    navigator.clipboard.writeText(record);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-[740px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <h1 className="text-[28px] font-bold text-foreground tracking-[-0.02em] mb-2">SPF Record Generator</h1>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
        Build a valid SPF record for your domain. Add your mail server IPs, include statements, and select an enforcement policy.
      </p>

      {/* Mechanisms */}
      <div className="space-y-3 mb-6">
        <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Authorized Senders</label>
        {mechanisms.map((m, i) => (
          <div key={i} className="flex items-center gap-2">
            <select
              value={m.type}
              onChange={(e) => updateMechanism(i, "type", e.target.value)}
              className="h-9 px-3 bg-muted/50 border border-border rounded-md text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
            >
              <option value="include">include</option>
              <option value="ip4">ip4</option>
              <option value="ip6">ip6</option>
              <option value="a">a</option>
              <option value="mx">mx</option>
            </select>
            <input
              value={m.value}
              onChange={(e) => updateMechanism(i, "value", e.target.value)}
              placeholder={m.type === "include" ? "_spf.google.com" : m.type === "ip4" ? "192.168.1.0/24" : "example.com"}
              className="flex-1 h-9 px-3 bg-muted/50 border border-border rounded-md text-[13px] text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground/50"
            />
            {mechanisms.length > 1 && (
              <button onClick={() => removeMechanism(i)} className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        <button onClick={addMechanism} className="flex items-center gap-1.5 text-[12px] text-blue-400 hover:text-blue-300 font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add sender
        </button>
      </div>

      {/* Policy */}
      <div className="mb-8">
        <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Failure Policy</label>
        <div className="flex gap-2">
          {([
            { value: "~all", label: "Soft Fail (~all)", desc: "Recommended" },
            { value: "-all", label: "Hard Fail (-all)", desc: "Strict" },
            { value: "?all", label: "Neutral (?all)", desc: "Testing" },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPolicy(opt.value)}
              className={`flex-1 px-3 py-2.5 rounded-md border text-left transition-colors ${
                policy === opt.value ? "border-blue-500/50 bg-blue-500/5" : "border-border hover:bg-muted/50"
              }`}
            >
              <span className="text-[13px] font-medium text-foreground block">{opt.label}</span>
              <span className="text-[11px] text-muted-foreground">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Output */}
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

      <div className="mt-4 px-4 py-3 bg-muted/30 rounded-lg">
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          <strong className="text-foreground">How to add:</strong> Create a TXT record for your domain with the value above. DNS propagation may take up to 48 hours.
        </p>
      </div>

      {/* SEO Content */}
      <section className="border-t border-border pt-8 mt-10 space-y-6">
        <h2 className="text-[20px] font-bold text-foreground">How to Create an SPF Record That Actually Works</h2>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          An SPF (Sender Policy Framework) record is a DNS TXT entry that lists every server authorized to send email from your domain. When a receiving server gets an email claiming to be from your domain, it checks your SPF record to verify the sending IP is authorized. The record uses mechanisms like &quot;include:&quot; (to authorize third-party services), &quot;ip4:&quot; and &quot;ip6:&quot; (for specific addresses), and &quot;a:&quot; or &quot;mx:&quot; (to authorize your domain&apos;s own servers).
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          The policy at the end (&quot;~all&quot;, &quot;-all&quot;, or &quot;?all&quot;) tells receivers what to do with unauthorized senders. Soft fail (~all) is the recommended default — it marks unauthorized emails as suspicious without blocking them outright. Hard fail (-all) is stricter and can cause legitimate emails to bounce if you haven&apos;t listed all sending services. Keep in mind the 10 DNS lookup limit: each &quot;include:&quot; mechanism counts as a lookup, and exceeding 10 causes SPF to fail entirely.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          Common services to include: _spf.google.com (Google Workspace), spf.protection.outlook.com (Microsoft 365), sendgrid.net (SendGrid), amazonses.com (Amazon SES), and mailgun.org (Mailgun). Only add services you actually use — every unnecessary include wastes your 10-lookup budget.
        </p>

        <h2 className="text-[18px] font-bold text-foreground mt-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">What happens if I exceed the 10 DNS lookup limit?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">When an SPF record requires more than 10 DNS lookups (including nested includes), the entire SPF check returns a &quot;permerror&quot; result. This means receiving servers treat your email as if you have no SPF record at all, significantly hurting deliverability. Use ip4/ip6 mechanisms or SPF flattening services to stay under the limit.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Should I use ~all (soft fail) or -all (hard fail)?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Start with ~all (soft fail) until you&apos;re confident all legitimate senders are listed. Hard fail (-all) provides stronger protection against spoofing but will cause delivery failures if any authorized service is missing from your record. Most email deliverability experts recommend ~all combined with DMARC enforcement for the best balance.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Can I have multiple SPF records on one domain?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">No. RFC 7208 specifies that a domain must have at most one SPF record. Multiple SPF TXT records cause a permerror, invalidating all SPF checks. If you need to authorize multiple services, combine them in a single record using multiple include: or ip4: mechanisms.</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-[14px] font-semibold text-foreground mb-2">Related Tools</h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/tools/dns-audit" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DNS Authentication Checker</Link>
            <Link href="/tools/dkim-generator" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DKIM Record Generator</Link>
            <Link href="/tools/dmarc-generator" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DMARC Record Generator</Link>
            <Link href="/tools/domain-scanner" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">Domain Scanner</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
