"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import Link from "next/link";

export default function DkimGeneratorPage() {
  const [selector, setSelector] = useState("default");
  const [keyType, setKeyType] = useState<"rsa" | "ed25519">("rsa");
  const [publicKey, setPublicKey] = useState("");
  const [copied, setCopied] = useState(false);

  const generateRecord = () => {
    if (!publicKey.trim()) return "v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY_HERE";
    const cleanKey = publicKey.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n|\r|\s/g, "");
    return `v=DKIM1; k=${keyType}; p=${cleanKey}`;
  };

  const record = generateRecord();
  const dnsName = `${selector}._domainkey.yourdomain.com`;

  const handleCopy = () => {
    navigator.clipboard.writeText(record);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-[740px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <h1 className="text-[28px] font-bold text-foreground tracking-[-0.02em] mb-2">DKIM Record Generator</h1>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
        Generate a DKIM DNS TXT record from your public key. You&apos;ll need the public key from your mail server&apos;s DKIM configuration.
      </p>

      <div className="space-y-5 mb-8">
        {/* Selector */}
        <div>
          <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Selector</label>
          <input
            value={selector}
            onChange={(e) => setSelector(e.target.value)}
            placeholder="default"
            className="w-full h-9 px-3 bg-muted/50 border border-border rounded-md text-[13px] text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground/50"
          />
          <p className="text-[11px] text-muted-foreground mt-1">Common: google, default, selector1, mail</p>
        </div>

        {/* Key type */}
        <div>
          <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Key Type</label>
          <div className="flex gap-2">
            {(["rsa", "ed25519"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setKeyType(k)}
                className={`px-4 py-2 rounded-md border text-[13px] font-medium transition-colors ${
                  keyType === k ? "border-blue-500/50 bg-blue-500/5 text-foreground" : "border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {k.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Public key */}
        <div>
          <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Public Key</label>
          <textarea
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            placeholder="Paste your public key here (PEM format or raw base64)"
            className="w-full min-h-[120px] p-3 bg-muted/50 border border-border rounded-md text-[12px] text-foreground font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* DNS Name */}
      <div className="border border-border rounded-lg overflow-hidden mb-3">
        <div className="px-4 py-3 bg-muted/30 border-b border-border">
          <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">DNS Record Name</span>
        </div>
        <div className="px-4 py-3">
          <code className="text-[13px] font-mono text-foreground">{dnsName}</code>
        </div>
      </div>

      {/* Output */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
          <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">TXT Record Value</span>
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
        <h2 className="text-[20px] font-bold text-foreground">How DKIM Works and Why Every Sending Domain Needs It</h2>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          DKIM (DomainKeys Identified Mail) is an email authentication method that adds a cryptographic signature to your outgoing messages. Your mail server signs each email with a private key, and the corresponding public key is published as a DNS TXT record under selector._domainkey.yourdomain.com. When a receiving server gets your email, it retrieves the public key from DNS and verifies the signature — confirming the message wasn&apos;t altered in transit and genuinely originated from your domain.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          The selector is a label you choose (like &quot;google&quot;, &quot;default&quot;, or &quot;mail&quot;) that allows you to have multiple DKIM keys for different services on the same domain. Each email service you use (Google Workspace, SendGrid, Mailgun, etc.) typically provides its own DKIM key pair with a recommended selector name. The k= tag specifies the key algorithm — RSA (2048-bit recommended) is the most widely supported, while Ed25519 offers better performance but has limited support.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          This generator formats your public key into the correct DKIM DNS record syntax. Paste the PEM-encoded public key from your mail server, select the algorithm, and specify the selector. The tool strips headers, newlines, and whitespace to produce a clean p= value ready for your DNS configuration.
        </p>

        <h2 className="text-[18px] font-bold text-foreground mt-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">What selector name should I use for DKIM?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Use the selector provided by your email service. Google Workspace uses &quot;google&quot;, Microsoft 365 uses &quot;selector1&quot; and &quot;selector2&quot;, and self-hosted servers typically use &quot;default&quot; or &quot;mail&quot;. The selector name is arbitrary — what matters is that the DNS record matches what your mail server signs with.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Should I use RSA or Ed25519 for DKIM?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">RSA with 2048-bit keys is the safe default — supported by all email providers. Ed25519 keys are smaller and faster but not universally supported yet. Some administrators publish both (using different selectors) for forward compatibility. If in doubt, use RSA.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Can I have multiple DKIM records for different services?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Yes — that&apos;s exactly what selectors are for. Each service gets its own selector and key pair. For example, you might have google._domainkey for Gmail and sendgrid._domainkey for SendGrid, each with its own public key in DNS. There&apos;s no limit on the number of DKIM selectors.</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-[14px] font-semibold text-foreground mb-2">Related Tools</h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/tools/dns-audit" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DNS Authentication Checker</Link>
            <Link href="/tools/spf-generator" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">SPF Record Generator</Link>
            <Link href="/tools/dmarc-generator" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DMARC Record Generator</Link>
            <Link href="/tools/domain-scanner" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">Domain Scanner</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
