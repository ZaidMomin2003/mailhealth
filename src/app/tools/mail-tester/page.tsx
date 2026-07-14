"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Copy, Check, RefreshCw, CheckCircle2, XCircle, AlertCircle, Share2, ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const EMAIL_DOMAIN = "mailhealth.dpdns.org";

function generateId() { return Math.random().toString(36).substring(2, 8); }

type TestStatus = "waiting" | "received" | "timeout";

interface TestResult {
  score: number;
  spf: "pass" | "fail" | "none";
  dkim: "pass" | "fail" | "none";
  dmarc: "pass" | "fail" | "none";
  details: string[];
}

export default function MailTesterPage() {
  const [testId, setTestId] = useState("");
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<TestStatus>("waiting");
  const [result, setResult] = useState<TestResult | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setTestId(generateId()); }, []);
  const testEmail = `test-${testId}@${EMAIL_DOMAIN}`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(testEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [testEmail]);

  // Timer
  useEffect(() => {
    if (status !== "waiting") return;
    const i = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(i);
  }, [status]);

  // Poll for results
  useEffect(() => {
    if (status !== "waiting" || !testId || !API_URL) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/mail-test/result?id=${testId}`);
        const data = await res.json();
        if (data.status === "received") {
          setStatus("received");
          setResult({ score: data.score, spf: data.spf, dkim: data.dkim, dmarc: data.dmarc, details: data.details });
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch { /* keep polling */ }
    }, 3000);

    // Timeout after 5 minutes
    const timeout = setTimeout(() => {
      if (pollRef.current) clearInterval(pollRef.current);
      setStatus("timeout");
    }, 300000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      clearTimeout(timeout);
    };
  }, [status, testId]);

  const handleReset = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setTestId(generateId());
    setStatus("waiting");
    setResult(null);
    setElapsed(0);
  };

  const authIcon = (s: "pass" | "fail" | "none") => {
    if (s === "pass") return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (s === "fail") return <XCircle className="w-4 h-4 text-red-400" />;
    return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
  };

  const authBadge = (s: "pass" | "fail" | "none") => {
    const base = "text-[11px] font-medium px-2 py-0.5 rounded";
    if (s === "pass") return <span className={`${base} bg-emerald-500/10 text-emerald-400`}>pass</span>;
    if (s === "fail") return <span className={`${base} bg-red-500/10 text-red-400`}>fail</span>;
    return <span className={`${base} bg-muted text-muted-foreground`}>none</span>;
  };

  return (
    <div className="max-w-[740px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <Link href="/tools/spam-checker" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> All tools
      </Link>

      <h1 className="text-[28px] font-bold text-foreground tracking-[-0.02em] mb-2">Inbox Health Mail Tester</h1>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
        Send a test email to the address below. We&apos;ll analyze headers, authentication, and content scoring in real-time.
      </p>

      {status === "waiting" && (
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-6 text-center">
            <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-wide mb-4">Send your test email to</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <code className="text-[14px] sm:text-[15px] font-mono font-semibold text-foreground bg-muted px-4 py-2.5 rounded-md break-all">{testEmail}</code>
              <button onClick={handleCopy} className="h-9 w-9 flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors shrink-0">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>
          </div>

          <div className="border border-border rounded-lg p-6 text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <span className="text-[13px] text-foreground font-medium">Waiting for your email…</span>
            </div>
            <p className="text-[12px] text-muted-foreground font-mono">{elapsed}s elapsed • polling every 3s</p>
            {!API_URL && (
              <p className="text-[11px] text-yellow-400">⚠️ API not configured — results will be simulated</p>
            )}
          </div>
        </div>
      )}

      {status === "timeout" && (
        <div className="border border-border rounded-lg p-6 text-center space-y-3">
          <p className="text-[14px] text-foreground font-medium">Timed out</p>
          <p className="text-[12px] text-muted-foreground">No email received within 5 minutes. Make sure you sent to the correct address.</p>
          <button onClick={handleReset} className="h-8 px-4 bg-yellow-400 hover:bg-yellow-500 text-black text-[12px] font-medium rounded-md transition-colors">
            Try Again
          </button>
        </div>
      )}

      {status === "received" && result && (
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-6 flex items-center gap-5">
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" className="stroke-muted" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={result.score >= 8 ? "#34d399" : result.score >= 5 ? "#facc15" : "#f87171"} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(result.score / 10) * 251} 251`} style={{ transition: "stroke-dasharray 0.4s ease" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-[16px] font-bold tabular-nums ${result.score >= 8 ? "text-emerald-400" : result.score >= 5 ? "text-yellow-400" : "text-red-400"}`}>{result.score}</span>
                <span className="text-[9px] text-muted-foreground">/10</span>
              </div>
            </div>
            <div>
              <p className="text-[14px] font-medium text-foreground">Deliverability Score</p>
              <p className="text-[12px] text-muted-foreground">Based on authentication & content analysis</p>
            </div>
          </div>

          <div className="border border-border rounded-lg divide-y divide-border">
            {(["spf", "dkim", "dmarc"] as const).map((key) => (
              <div key={key} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2.5">
                  {authIcon(result[key])}
                  <span className="text-[13px] font-medium text-foreground uppercase">{key}</span>
                </div>
                {authBadge(result[key])}
              </div>
            ))}
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-muted/30 border-b border-border">
              <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Audit Details</span>
            </div>
            <ul className="px-5 py-3 space-y-2">
              {result.details.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-muted-foreground leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 mt-[7px] shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2">
            <button onClick={handleReset} className="flex-1 h-9 border border-border rounded-md text-[13px] text-foreground font-medium hover:bg-muted flex items-center justify-center gap-1.5 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> New Test
            </button>
            <button className="flex-1 h-9 bg-yellow-400 hover:bg-yellow-500 text-black rounded-md text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors">
              <Share2 className="w-3.5 h-3.5" /> Share Report
            </button>
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
        <h2 className="text-[20px] font-bold text-foreground">How Email Deliverability Testing Works</h2>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          An email deliverability test measures how inbox providers will treat your messages by analyzing real email headers, authentication results, and content signals. When you send a test email to our address, we parse the raw headers to extract SPF, DKIM, and DMARC authentication results exactly as receiving servers see them — not just what your DNS says you&apos;ve configured, but whether the actual email passes those checks end-to-end.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          The deliverability score combines authentication pass/fail status with content analysis. Factors that lower your score include missing or failing SPF/DKIM/DMARC, sending from a new or low-reputation IP, excessive spam trigger words in your content, broken or suspicious URLs in the email body, and oversized HTML-to-text ratios. A score of 8/10 or higher indicates good inbox placement probability.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          Unlike DNS-only checks, this tool tests your actual sending infrastructure. It reveals issues like SPF alignment failures when sending through third-party services, DKIM signature problems caused by message modification in transit, or content-based flags that only appear in the context of a real email. Run this test from every sending identity and domain you use.
        </p>

        <h2 className="text-[18px] font-bold text-foreground mt-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">What&apos;s a good email deliverability score?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Aim for 8/10 or higher. A score of 9-10 means excellent deliverability with all authentication passing and clean content. Scores below 6 indicate serious issues that will likely result in spam folder placement or blocked delivery at major providers.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Why did my test email fail DKIM even though I have a DKIM record?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">DKIM can fail even with a valid DNS record if the email was modified in transit (by a mailing list, forwarding service, or email gateway), if the signing domain doesn&apos;t match the From domain (alignment failure), or if the private key on your mail server doesn&apos;t correspond to the published public key.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Should I test from my actual sending tool or just Gmail?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Always test from your actual sending infrastructure — the tool you use for campaigns, cold outreach, or transactional emails. Each sending service has different IP reputation, authentication setup, and header handling. Testing from Gmail only validates your personal inbox, not your campaign infrastructure.</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-[14px] font-semibold text-foreground mb-2">Related Tools</h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/tools/warmup-tracker" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">Warmup Tracker</Link>
            <Link href="/tools/dns-audit" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DNS Authentication Checker</Link>
            <Link href="/tools/spam-checker" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">Spam Word Checker</Link>
            <Link href="/tools/ip-reputation" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">IP Reputation Check</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
