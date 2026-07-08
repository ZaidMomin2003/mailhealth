"use client";

import { useState } from "react";
import { Search, CheckCircle2, XCircle, Loader2, Wifi, ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface ReputationResult {
  ip: string;
  score: number;
  reverseDns: string | null;
  blocklists: { name: string; listed: boolean }[];
}

export default function IpReputationPage() {
  const [ip, setIp] = useState("");
  const [result, setResult] = useState<ReputationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!ip.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");

    try {
      if (API_URL) {
        const res = await fetch(`${API_URL}/ip-reputation?ip=${encodeURIComponent(ip.trim())}`);
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setResult(data);
        }
      } else {
        // Fallback: client-side simulation when no API configured
        await new Promise((r) => setTimeout(r, 800));
        const blocklists = [
          "Spamhaus ZEN", "Barracuda", "SpamCop", "SORBS",
          "CBL", "UCEPROTECT", "PSBL", "S5H",
        ];
        const hash = ip.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
        const listed = blocklists.map((name) => ({
          name,
          listed: (hash + name.length) % 7 === 0,
        }));
        const listedCount = listed.filter((l) => l.listed).length;
        setResult({
          ip: ip.trim(),
          score: Math.max(0, 100 - listedCount * 15),
          reverseDns: null,
          blocklists: listed,
        });
      }
    } catch {
      setError("Failed to check IP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s: number) => s >= 80 ? "text-emerald-400" : s >= 50 ? "text-yellow-400" : "text-red-400";
  const scoreStroke = (s: number) => s >= 80 ? "#34d399" : s >= 50 ? "#facc15" : "#f87171";

  return (
    <div className="max-w-[740px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <Link href="/tools/spam-checker" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> All tools
      </Link>

      <h1 className="text-[28px] font-bold text-foreground tracking-[-0.02em] mb-2">IP Reputation Check</h1>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
        Check if your sending IP is listed on major email blocklists. A clean IP is essential for inbox delivery.
      </p>

      <div className="flex gap-2 mb-8">
        <input value={ip} onChange={(e) => setIp(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCheck()} placeholder="192.168.1.1" className="flex-1 h-10 px-4 bg-muted/50 border border-border rounded-lg text-[14px] text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground/50" />
        <button onClick={handleCheck} disabled={loading || !ip.trim()} className="h-10 px-5 bg-yellow-400 hover:bg-yellow-500 text-black text-[13px] font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-40">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /> Check</>}
        </button>
      </div>

      {error && <p className="text-[13px] text-red-400 mb-4">{error}</p>}

      {result && (
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-6 flex items-center gap-5">
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" className="stroke-muted" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={scoreStroke(result.score)} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(result.score / 100) * 251} 251`} style={{ transition: "stroke-dasharray 0.4s ease" }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-[16px] font-bold tabular-nums ${scoreColor(result.score)}`}>{result.score}</span>
              </div>
            </div>
            <div>
              <p className="text-[14px] font-medium text-foreground">Reputation Score</p>
              <p className="text-[12px] text-muted-foreground">
                {result.score >= 80 ? "Clean — not on major blocklists" : result.score >= 50 ? "Some listings detected" : "High risk — listed on multiple blocklists"}
              </p>
            </div>
          </div>

          <div className="border border-border rounded-lg divide-y divide-border">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[13px] text-muted-foreground">IP Address</span>
              <code className="text-[12px] font-mono text-foreground">{result.ip}</code>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[13px] text-muted-foreground">Reverse DNS</span>
              <code className="text-[11px] font-mono text-muted-foreground">{result.reverseDns || "No PTR record"}</code>
            </div>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Blocklist Status</span>
            </div>
            <div className="divide-y divide-border">
              {result.blocklists.map((l) => (
                <div key={l.name} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[13px] text-foreground">{l.name}</span>
                  <div className="flex items-center gap-1.5">
                    {l.listed ? <XCircle className="w-3.5 h-3.5 text-red-400" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    <span className={`text-[11px] font-medium ${l.listed ? "text-red-400" : "text-emerald-400"}`}>{l.listed ? "listed" : "clean"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!API_URL && (
            <div className="px-4 py-3 bg-muted/30 rounded-lg">
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Note:</strong> Showing simulated results. Connect the API backend for real-time DNSBL queries.
              </p>
            </div>
          )}

          <div className="mt-6 p-4 border border-blue-500/20 bg-blue-500/5 rounded-lg">
            <p className="text-[13px] text-foreground font-medium mb-1">Fix this automatically with Cleanmails</p>
            <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">Deploy on clean IPs with full reputation control. Automated warmup and monitoring included.</p>
            <a href="https://cleanmails.online" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Learn more about Cleanmails <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* SEO Content */}
      <section className="border-t border-border pt-8 mt-10 space-y-6">
        <h2 className="text-[20px] font-bold text-foreground">Understanding IP Reputation and Email Blocklists</h2>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          Your sending IP&apos;s reputation is one of the strongest signals inbox providers use to decide whether your email reaches the inbox or gets blocked. IP reputation is built over time based on sending volume, bounce rates, spam complaints, and whether recipients engage with your messages. A clean IP with no blocklist entries and a history of legitimate sending will have far better deliverability than one that&apos;s been flagged for abuse.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          Blocklists (also called blacklists or DNSBLs) are databases maintained by organizations like Spamhaus, Barracuda, and SpamCop that track IP addresses associated with spam or abuse. When an inbox provider checks incoming mail, it queries these blocklists — if your IP is listed, your email is likely to be rejected outright or sent to spam. Different blocklists have different impacts: Spamhaus ZEN is the most influential, while smaller lists may only affect specific providers.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          Our IP reputation checker queries 8 major blocklists simultaneously and checks for a reverse DNS (PTR) record. Missing PTR records are a red flag for many providers — they expect the IP&apos;s reverse DNS to resolve to a hostname that matches your sending domain. If you find your IP listed, most blocklists have a delisting process that involves fixing the underlying abuse issue and requesting removal.
        </p>

        <h2 className="text-[18px] font-bold text-foreground mt-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">How do I get delisted from a blocklist?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Each blocklist has its own delisting process. Spamhaus requires you to visit their lookup page and request removal. Barracuda has an automated removal form. First, fix the issue that caused the listing (spam complaints, compromised server, open relay). Then submit the delisting request. Most removals take 24-72 hours.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Should I use a dedicated IP or shared IP for sending?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Dedicated IPs give you full control over reputation but require consistent volume (10,000+ emails/month) to maintain. Shared IPs pool reputation across senders — good if you send low volume, risky if other senders on the IP misbehave. For cold outreach at scale, dedicated IPs with proper warmup are preferred.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">What is a PTR record and why does it matter for email?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">A PTR (pointer) record is the reverse DNS lookup that maps an IP address back to a hostname. Email servers expect sending IPs to have a PTR record that resolves to a legitimate hostname matching the sending domain. Missing PTR records are treated as a spam indicator because legitimate mail servers always have properly configured reverse DNS.</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-[14px] font-semibold text-foreground mb-2">Related Tools</h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/tools/warmup-tracker" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">Warmup Tracker</Link>
            <Link href="/tools/mail-tester" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">Email Deliverability Tester</Link>
            <Link href="/tools/dns-audit" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DNS Authentication Checker</Link>
            <Link href="/tools/domain-scanner" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">Domain Scanner</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
