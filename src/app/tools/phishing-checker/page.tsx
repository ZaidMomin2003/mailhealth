"use client";

import { useState } from "react";
import { Search, AlertOctagon, CheckCircle2, XCircle, Shield } from "lucide-react";
import Link from "next/link";

interface PhishingResult {
  url: string;
  safe: boolean;
  reasons: string[];
  domain: string;
  ssl: boolean;
  redirects: boolean;
  suspicious: boolean;
}

function analyzeUrl(url: string): PhishingResult {
  const reasons: string[] = [];
  let suspicious = false;

  // Basic client-side heuristics
  const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
  const domain = parsed.hostname;

  // Check for IP-based URLs
  if (/^\d+\.\d+\.\d+\.\d+/.test(domain)) { reasons.push("Uses IP address instead of domain name"); suspicious = true; }

  // Check for suspicious TLDs
  const suspiciousTlds = [".xyz", ".top", ".club", ".work", ".click", ".link", ".info"];
  if (suspiciousTlds.some((tld) => domain.endsWith(tld))) { reasons.push(`Suspicious TLD: ${domain.split(".").pop()}`); suspicious = true; }

  // Check for excessive subdomains
  if (domain.split(".").length > 3) { reasons.push("Excessive subdomains (possible obfuscation)"); suspicious = true; }

  // Check for lookalike characters
  if (/[0oO]/.test(domain) && /[1lI]/.test(domain)) { reasons.push("Contains lookalike characters"); }

  // Check for common brand impersonation
  const brands = ["google", "microsoft", "apple", "paypal", "amazon", "facebook", "netflix"];
  const domainBase = domain.replace(/\.[^.]+$/, "").replace(/\.[^.]+$/, "");
  if (brands.some((b) => domainBase.includes(b) && !domain.endsWith(`.${b}.com`))) { reasons.push("Possible brand impersonation"); suspicious = true; }

  // Check for URL shorteners
  const shorteners = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "rb.gy"];
  if (shorteners.some((s) => domain === s)) { reasons.push("URL shortener detected — hides true destination"); suspicious = true; }

  // SSL check (basic)
  const ssl = parsed.protocol === "https:";
  if (!ssl) { reasons.push("No HTTPS — connection is not encrypted"); suspicious = true; }

  if (reasons.length === 0) reasons.push("No obvious phishing indicators detected");

  return { url, safe: !suspicious, reasons, domain, ssl, redirects: false, suspicious };
}

export default function PhishingCheckerPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<PhishingResult | null>(null);

  const handleCheck = () => {
    if (!url.trim()) return;
    try { setResult(analyzeUrl(url.trim())); }
    catch { setResult(null); }
  };

  return (
    <div className="max-w-[740px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <h1 className="text-[28px] font-bold text-foreground tracking-[-0.02em] mb-2">Phishing Link Checker</h1>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
        Analyze a URL for common phishing indicators. Checks for suspicious TLDs, brand impersonation, IP-based URLs, and more.
      </p>

      <div className="flex gap-2 mb-8">
        <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCheck()} placeholder="https://suspicious-link.example.com/login" className="flex-1 h-10 px-4 bg-muted/50 border border-border rounded-lg text-[14px] text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground/50" />
        <button onClick={handleCheck} disabled={!url.trim()} className="h-10 px-5 bg-yellow-400 hover:bg-yellow-500 text-black text-[13px] font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-40">
          <Search className="w-4 h-4" /> Analyze
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Verdict */}
          <div className={`flex items-center gap-3 p-5 border rounded-lg ${result.safe ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
            {result.safe ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <AlertOctagon className="w-6 h-6 text-red-400" />}
            <div>
              <p className="text-[15px] font-semibold text-foreground">{result.safe ? "Likely Safe" : "Potentially Dangerous"}</p>
              <p className="text-[13px] text-muted-foreground">{result.safe ? "No obvious phishing indicators detected." : "This URL shows signs of phishing or malicious intent."}</p>
            </div>
          </div>

          {/* Details */}
          <div className="border border-border rounded-lg divide-y divide-border">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[13px] text-muted-foreground">Domain</span>
              <code className="text-[12px] font-mono text-foreground">{result.domain}</code>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[13px] text-muted-foreground">HTTPS</span>
              <div className="flex items-center gap-1.5">
                {result.ssl ? <Shield className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                <span className="text-[12px] text-foreground">{result.ssl ? "Encrypted" : "Not encrypted"}</span>
              </div>
            </div>
          </div>

          {/* Findings */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-muted/30 border-b border-border">
              <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Findings</span>
            </div>
            <ul className="px-4 py-3 space-y-2">
              {result.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-muted-foreground leading-relaxed">
                  <span className={`w-1.5 h-1.5 rounded-full mt-[7px] shrink-0 ${result.safe ? "bg-emerald-400" : "bg-red-400"}`} />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="px-4 py-3 bg-muted/30 rounded-lg">
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Note:</strong> This is a client-side heuristic check. For comprehensive phishing detection, URL reputation APIs and real-time scanning are required.
            </p>
          </div>
        </div>
      )}

      {/* SEO Content */}
      <section className="border-t border-border pt-8 mt-10 space-y-6">
        <h2 className="text-[20px] font-bold text-foreground">How Phishing Link Detection Works</h2>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          Phishing attacks use deceptive URLs to trick recipients into visiting fake login pages, downloading malware, or revealing sensitive information. Attackers employ several techniques: registering domains with suspicious TLDs (.xyz, .top, .click), using IP addresses instead of domain names, creating excessive subdomains to obscure the real destination (e.g., accounts.google.com.evil-site.xyz), and impersonating well-known brands with lookalike domain names.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          Our phishing link checker analyzes URLs using client-side heuristics that identify common attack patterns. It checks for suspicious TLDs popular with phishers, detects brand impersonation attempts (domains containing &quot;google&quot;, &quot;paypal&quot;, or &quot;microsoft&quot; that aren&apos;t the official domains), flags URL shorteners that hide the true destination, identifies IP-based URLs that bypass domain reputation checks, and verifies HTTPS encryption status.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          For email senders, checking your own links is equally important. Including URLs with suspicious characteristics in your emails (even legitimate ones on unusual TLDs) can trigger spam filters. Email providers scan links in outgoing and incoming mail — a URL that looks phishing-like to our tool will look the same to Gmail&apos;s safety scanners, potentially hurting your deliverability.
        </p>

        <h2 className="text-[18px] font-bold text-foreground mt-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Can this tool detect all phishing links?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">No. This tool uses heuristic analysis that catches common patterns but can&apos;t detect sophisticated phishing on clean-looking domains or zero-day attacks. For comprehensive protection, combine this with URL reputation APIs (like Google Safe Browsing), real-time page content analysis, and security awareness training.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Why do URL shorteners flag as suspicious?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">URL shorteners (bit.ly, tinyurl.com, rb.gy) hide the true destination from the recipient. While often used legitimately, phishers heavily rely on them to bypass URL-based filtering. Most email security scanners expand shortened URLs before analysis, and some providers penalize emails containing them.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Should I avoid putting links in my cold emails entirely?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Not entirely, but minimize them. Use only links to your own well-established domain, avoid URL shorteners, ensure all links use HTTPS, and never include links on suspicious TLDs. First-touch cold emails with zero links actually have the best deliverability, but follow-ups can include 1-2 clean links.</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-[14px] font-semibold text-foreground mb-2">Related Tools</h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/tools/spam-checker" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">Spam Word Checker</Link>
            <Link href="/tools/domain-scanner" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">Domain Scanner</Link>
            <Link href="/tools/ip-reputation" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">IP Reputation Check</Link>
            <Link href="/tools/mail-tester" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">Email Deliverability Tester</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
