"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Copy, Check, RefreshCw, Inbox, AlertTriangle, XCircle, ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const EMAIL_DOMAIN = "mailhealth.online";
const SEED_COUNT = 50;

type Placement = "inbox" | "spam" | "missing";
interface SeedResult { address: string; placement: Placement; provider: string; strictness: "high" | "medium" | "low"; score?: number; }

function generateSessionId() { return Math.random().toString(36).substring(2, 10); }

function generateSeedList(sessionId: string): string[] {
  return Array.from({ length: SEED_COUNT }, (_, i) => `seed-${sessionId}-${i + 1}@${EMAIL_DOMAIN}`);
}

export default function WarmupTrackerPage() {
  const [sessionId, setSessionId] = useState(() => generateSessionId());
  const [seeds, setSeeds] = useState<string[]>(() => generateSeedList(sessionId));
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<"idle" | "waiting" | "done">("idle");
  const [results, setResults] = useState<SeedResult[]>([]);
  const [received, setReceived] = useState(0);
  const [filter, setFilter] = useState<Placement | "all">("all");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleCopyAll = useCallback(() => {
    navigator.clipboard.writeText(seeds.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (status === "idle") setStatus("waiting");
  }, [seeds, status]);

  // Poll for results
  useEffect(() => {
    if (status !== "waiting" || !API_URL) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/warmup/results?session=${sessionId}`);
        const data = await res.json();
        setReceived(data.received || 0);
        if (data.results && data.results.length > 0) {
          setResults(data.results);
        }
        // Stop polling when all received or after 10 minutes
        if (data.received >= SEED_COUNT) {
          setStatus("done");
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch { /* keep polling */ }
    }, 3000);

    const timeout = setTimeout(() => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (results.length > 0) setStatus("done");
    }, 600000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      clearTimeout(timeout);
    };
  }, [status, sessionId, results.length]);

  const handleReset = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    const newId = generateSessionId();
    setSessionId(newId);
    setSeeds(generateSeedList(newId));
    setStatus("idle");
    setResults([]);
    setReceived(0);
    setFilter("all");
  };

  const markDone = () => setStatus("done");

  const inboxCount = results.filter((r) => r.placement === "inbox").length;
  const spamCount = results.filter((r) => r.placement === "spam").length;
  const missingCount = SEED_COUNT - results.length;
  const inboxRate = results.length > 0 ? Math.round((inboxCount / results.length) * 100) : 0;

  const byStrictness = {
    high: results.filter((r) => r.strictness === "high"),
    medium: results.filter((r) => r.strictness === "medium"),
    low: results.filter((r) => r.strictness === "low"),
  };
  const tierRate = (items: SeedResult[]) => items.length > 0 ? Math.round((items.filter((r) => r.placement === "inbox").length / items.length) * 100) : 0;
  const filteredResults = filter === "all" ? results : results.filter((r) => r.placement === filter);

  const placementIcon = (p: Placement) => {
    if (p === "inbox") return <Inbox className="w-3.5 h-3.5 text-emerald-400" />;
    if (p === "spam") return <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />;
    return <XCircle className="w-3.5 h-3.5 text-red-400" />;
  };

  const placementLabel = (p: Placement) => {
    const base = "text-[10px] font-medium px-1.5 py-0.5 rounded";
    if (p === "inbox") return <span className={`${base} bg-emerald-500/10 text-emerald-400`}>inbox</span>;
    if (p === "spam") return <span className={`${base} bg-yellow-500/10 text-yellow-400`}>spam</span>;
    return <span className={`${base} bg-red-500/10 text-red-400`}>missing</span>;
  };

  return (
    <div className="max-w-[740px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <Link href="/tools/spam-checker" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> All tools
      </Link>

      <h1 className="text-[28px] font-bold text-foreground tracking-[-0.02em] mb-2">Seed List Warmup Tracker</h1>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
        Copy the {SEED_COUNT} seed addresses, send your warmup campaign, and see exactly where each email lands.
      </p>

      {(status === "idle" || status === "waiting") && (
        <div className="space-y-4">
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
              <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">{SEED_COUNT} addresses</span>
              <button onClick={handleCopyAll} className="h-7 px-3 bg-yellow-400 hover:bg-yellow-500 text-black text-[11px] font-medium rounded flex items-center gap-1.5 transition-colors">
                {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy All</>}
              </button>
            </div>
            <div className="max-h-[160px] overflow-y-auto p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
                {seeds.map((s) => <code key={s} className="text-[10px] sm:text-[11px] font-mono text-muted-foreground py-0.5 truncate">{s}</code>)}
              </div>
            </div>
          </div>

          {status === "waiting" && (
            <div className="border border-border rounded-lg p-6 text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                </span>
                <span className="text-[13px] text-foreground font-medium">Awaiting campaign data… ({received}/{SEED_COUNT} received)</span>
              </div>
              <p className="text-[12px] text-muted-foreground">Send your campaign then wait. Results appear as emails arrive.</p>
              {received > 0 && (
                <button onClick={markDone} className="h-8 px-4 bg-yellow-400 hover:bg-yellow-500 text-black text-[12px] font-medium rounded-md transition-colors">
                  View Results Now ({received} received)
                </button>
              )}
              {!API_URL && (
                <p className="text-[11px] text-yellow-400">⚠️ API not configured — connect backend to see real results</p>
              )}
            </div>
          )}
        </div>
      )}

      {status === "done" && (
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-6 flex items-center gap-5">
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" className="stroke-muted" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={inboxRate >= 90 ? "#34d399" : inboxRate >= 60 ? "#facc15" : "#f87171"} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(inboxRate / 100) * 251} 251`} style={{ transition: "stroke-dasharray 0.4s ease" }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-[16px] font-bold tabular-nums ${inboxRate >= 90 ? "text-emerald-400" : inboxRate >= 60 ? "text-yellow-400" : "text-red-400"}`}>{inboxRate}%</span>
              </div>
            </div>
            <div>
              <p className="text-[14px] font-medium text-foreground">Global Inbox Rate</p>
              <p className="text-[12px] text-muted-foreground">
                <span className="text-emerald-400">{inboxCount} inbox</span> · <span className="text-yellow-400">{spamCount} spam</span> · <span className="text-red-400">{missingCount} missing</span>
              </p>
            </div>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-muted/30 border-b border-border">
              <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">By Provider Strictness</span>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: "High — Enterprise (O365)", data: byStrictness.high, color: "#f87171" },
                { label: "Medium — Google Workspace", data: byStrictness.medium, color: "#facc15" },
                { label: "Low — Yahoo / AOL", data: byStrictness.low, color: "#34d399" },
              ].map((tier) => {
                const rate = tierRate(tier.data);
                return (
                  <div key={tier.label}>
                    <div className="flex items-center justify-between text-[12px] mb-1.5">
                      <span className="text-muted-foreground">{tier.label}</span>
                      <span className="text-foreground font-medium tabular-nums">{rate}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${rate}%`, backgroundColor: tier.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
              <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">All Results</span>
              <div className="flex gap-0.5">
                {(["all", "inbox", "spam", "missing"] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${filter === f ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="max-h-[260px] overflow-y-auto divide-y divide-border">
              {filteredResults.map((r) => (
                <div key={r.address} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    {placementIcon(r.placement)}
                    <code className="text-[10px] sm:text-[11px] font-mono text-muted-foreground truncate">{r.address}</code>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-muted-foreground hidden sm:block">{r.provider}</span>
                    {placementLabel(r.placement)}
                  </div>
                </div>
              ))}
              {filteredResults.length === 0 && (
                <div className="px-4 py-8 text-center text-[12px] text-muted-foreground">No results in this category</div>
              )}
            </div>
          </div>

          <button onClick={handleReset} className="w-full h-9 border border-border rounded-md text-[13px] text-foreground font-medium hover:bg-muted flex items-center justify-center gap-1.5 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Run New Test
          </button>

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
        <h2 className="text-[20px] font-bold text-foreground">What Is Email Warmup and How to Track Inbox Placement</h2>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          Email warmup is the process of gradually increasing sending volume on a new or cold domain/IP to build sender reputation with inbox providers. When you first set up a domain for cold outreach, providers like Gmail and Outlook have no history to evaluate your trustworthiness. Sending too many emails too quickly triggers spam filters, while a slow, steady ramp-up with positive engagement signals (opens, replies, not-spam actions) builds trust over time.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          The warmup tracker works by providing you with seed addresses hosted across different email providers with varying strictness levels. By sending your campaign to these seeds and monitoring where each email lands — inbox, spam, or missing — you get a real-time picture of your sender reputation across the provider ecosystem. High-strictness providers (enterprise Outlook/O365) are the hardest to reach, while lower-strictness providers (Yahoo, AOL) are more forgiving.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          Track your inbox placement rate daily during warmup. A healthy warmup shows rates climbing from 40-60% in week one to 80-95% by week three or four. If rates plateau or drop, investigate authentication issues, IP reputation, or content problems. The breakdown by provider strictness tier helps you identify which providers specifically are throttling your emails.
        </p>

        <h2 className="text-[18px] font-bold text-foreground mt-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">How long does email warmup typically take?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">For a new domain, expect 2-4 weeks of gradual volume increase before reaching full sending capacity. Start with 5-10 emails per day and increase by 20-30% daily if inbox rates stay above 80%. Rushed warmups lead to permanent reputation damage that&apos;s much harder to fix than a slow start.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">What inbox placement rate should I aim for during warmup?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Target 90%+ overall inbox rate before scaling volume. For strict providers (O365/enterprise), 70%+ is acceptable during early warmup. If your global rate drops below 60%, pause sending and investigate — you&apos;re likely building negative reputation that will get harder to reverse.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">What causes &quot;missing&quot; status for seed addresses?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Missing means the email never arrived — not in inbox or spam. This typically indicates a hard bounce (invalid address), a block at the server level (IP or domain blacklisted), or rate limiting by the provider. Check your sending logs for bounce codes and verify your IP isn&apos;t on major blocklists.</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-[14px] font-semibold text-foreground mb-2">Related Tools</h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/tools/mail-tester" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">Email Deliverability Tester</Link>
            <Link href="/tools/ip-reputation" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">IP Reputation Check</Link>
            <Link href="/tools/dns-audit" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DNS Authentication Checker</Link>
            <Link href="/tools/spam-checker" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">Spam Word Checker</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
