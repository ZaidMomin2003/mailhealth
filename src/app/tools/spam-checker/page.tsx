"use client";

import { useState, useMemo, useCallback } from "react";
import { spamWords, type SpamWord } from "@/data/spam-words";
import { Copy, Check, RotateCcw, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

interface FoundSpam {
  word: string;
  alternative: string;
  severity: SpamWord["severity"];
  index: number;
  length: number;
}

function findSpamWords(text: string): FoundSpam[] {
  const found: FoundSpam[] = [];
  const lowerText = text.toLowerCase();
  for (const entry of spamWords) {
    const regex = new RegExp(`\\b${entry.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    let match;
    while ((match = regex.exec(lowerText)) !== null) {
      found.push({ word: text.slice(match.index, match.index + match[0].length), alternative: entry.alternative, severity: entry.severity, index: match.index, length: match[0].length });
    }
  }
  return found.sort((a, b) => a.index - b.index);
}

function calculateScore(text: string, issues: FoundSpam[]): number {
  if (!text.trim()) return 100;
  let penalty = 0;
  for (const issue of issues) {
    if (issue.severity === "high") penalty += 8;
    else if (issue.severity === "medium") penalty += 4;
    else penalty += 2;
  }
  return Math.max(0, Math.min(100, 100 - penalty));
}

export default function SpamCheckerPage() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const issues = useMemo(() => findSpamWords(text), [text]);
  const score = useMemo(() => calculateScore(text, issues), [text, issues]);

  const handleReplace = useCallback((issue: FoundSpam) => {
    const before = text.slice(0, issue.index);
    const after = text.slice(issue.index + issue.length);
    setText(before + issue.alternative + after);
  }, [text]);

  const handleCopySafe = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  const scoreColor = score >= 80 ? "text-emerald-400" : score >= 50 ? "text-yellow-400" : "text-red-400";
  const ringStroke = score >= 80 ? "#34d399" : score >= 50 ? "#facc15" : "#f87171";

  return (
    <div className="max-w-[740px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
      {/* Breadcrumb */}
      <Link href="/tools/spam-checker" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> All tools
      </Link>

      {/* Title */}
      <h1 className="text-[28px] font-bold text-foreground tracking-[-0.02em] mb-2">
        Email Spam Word Checker
      </h1>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
        Paste your cold email draft below. We&apos;ll scan it for spam trigger words and score your email&apos;s deliverability risk.
      </p>

      {/* Editor */}
      <div className="mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing your cold email here..."
          className="w-full min-h-[200px] p-5 bg-muted/50 border border-border rounded-lg text-[14px] leading-[1.8] text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 placeholder:text-muted-foreground/50 transition-all"
          spellCheck={false}
        />
      </div>

      {/* Score + Actions row */}
      {text.trim() && (
        <div className="flex items-center gap-4 mb-8 p-4 bg-card border border-border rounded-lg">
          {/* Score ring */}
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" className="stroke-muted" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke={ringStroke} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 251} 251`}
                style={{ transition: "stroke-dasharray 0.4s ease" }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-[14px] font-bold tabular-nums ${scoreColor}`}>{score}</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-medium text-foreground">
              {score >= 80 ? "Looking good — inbox safe" : score >= 50 ? "Some spam triggers detected" : "High risk — many triggers found"}
            </p>
            <p className="text-[12px] text-muted-foreground">
              {issues.length} trigger{issues.length !== 1 && "s"} • {text.split(/\s+/).filter(Boolean).length} words
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setText("")}
              className="h-8 px-3 border border-border rounded-md text-[12px] text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
            <button
              onClick={handleCopySafe}
              disabled={!text.trim()}
              className="h-8 px-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-md text-[12px] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Safe Email</>}
            </button>
          </div>
        </div>
      )}

      {/* Issues */}
      {issues.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden mb-8">
          <div className="px-4 py-3 bg-muted/50 border-b border-border flex items-center justify-between">
            <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
              Spam Triggers Found
            </span>
            <span className="text-[12px] text-muted-foreground">{issues.length} total</span>
          </div>
          <div className="max-h-[280px] overflow-y-auto divide-y divide-border">
            {issues.map((issue, i) => (
              <button
                key={`${issue.word}-${issue.index}-${i}`}
                onClick={() => handleReplace(issue)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    issue.severity === "high" ? "bg-red-400" : issue.severity === "medium" ? "bg-yellow-400" : "bg-muted-foreground/40"
                  }`} />
                  <span className="text-[13px] text-muted-foreground line-through">{issue.word}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[13px] text-blue-400 font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-3 h-3" />
                  {issue.alternative}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SEO Content */}
      <section className="border-t border-border pt-8 mt-10 space-y-6">
        <h2 className="text-[20px] font-bold text-foreground">What Are Spam Trigger Words and Why They Kill Cold Email Deliverability</h2>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          Spam trigger words are specific phrases that email providers like Gmail, Outlook, and Yahoo use in their content filters to flag messages as potential spam. These words fall into categories like urgency (&quot;act now&quot;, &quot;limited time&quot;), financial promises (&quot;free money&quot;, &quot;no cost&quot;), and pressure tactics (&quot;don&apos;t delete&quot;, &quot;this isn&apos;t spam&quot;). When your cold email contains too many of these phrases, it gets routed to the spam folder even if your domain authentication (SPF, DKIM, DMARC) is configured perfectly.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          Modern email spam filters use machine learning that weighs content alongside sender reputation. A single spam word won&apos;t tank your email, but combining multiple triggers — especially in subject lines — significantly increases spam classification probability. Our email spam checker scans your draft against a database of known trigger words weighted by severity, and suggests safer alternatives that convey the same meaning without tripping content filters.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          For cold email deliverability, content is only one piece of the puzzle. Combine spam-free copy with proper DNS authentication, a warmed-up sending domain, and low bounce rates for maximum inbox placement.
        </p>

        <h2 className="text-[18px] font-bold text-foreground mt-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">How many spam words are too many in a cold email?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">There&apos;s no fixed threshold — it depends on the severity of the words and their context. A single high-severity word like &quot;free&quot; in a subject line carries more weight than three low-severity words in the body. Aim for a score above 80 in our checker for safe sending.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Does removing spam words guarantee inbox delivery?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">No. Content is one of many factors. Inbox providers also evaluate sender reputation, domain age, authentication records (SPF, DKIM, DMARC), engagement metrics, and sending volume patterns. Clean copy helps but isn&apos;t a silver bullet.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Are spam trigger words the same across all email providers?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Not exactly. Gmail, Outlook, and Yahoo each use different filtering algorithms. However, high-severity words like &quot;act now&quot;, &quot;congratulations&quot;, and &quot;guaranteed&quot; are flagged across most providers. Our database covers the common ground between major inbox providers.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Should I also check my email subject line separately?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Yes. Subject lines are weighted more heavily by spam filters because they&apos;re the first thing filters analyze. Paste your subject line alone into the checker to see its score independently from the body content.</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-[14px] font-semibold text-foreground mb-2">Related Tools</h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/tools/mail-tester" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">Email Deliverability Tester</Link>
            <Link href="/tools/dns-audit" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DNS Authentication Checker</Link>
            <Link href="/tools/warmup-tracker" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">Warmup Tracker</Link>
            <Link href="/tools/domain-scanner" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">Domain Scanner</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
