"use client";

import { useState } from "react";
import { ArrowUpRight, Star, X, ArrowLeft } from "lucide-react";

const testimonials = [
  { name: "Alex R.", role: "SaaS Founder", text: "Saved me $400/month. Setup took 20 minutes." },
  { name: "Jordan K.", role: "Agency Owner", text: "50k emails/day, 30 domains. Zero monthly fees." },
  { name: "Priya S.", role: "Growth Lead", text: "Same results as Instantly, fraction of the cost." },
  { name: "Marcus T.", role: "B2B Consultant", text: "Deliverability went from 60% to 94%." },
  { name: "Sarah L.", role: "Email Marketer", text: "Self-hosted was scary. Cleanmails made it easy." },
];

export function PromoSidebar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside className="shrink-0 hidden xl:flex flex-col h-[calc(100vh-48px)] sticky top-12">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-[40px] h-full border-l border-border bg-yellow-400 hover:bg-yellow-500 transition-colors flex items-center justify-center cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 -rotate-90 whitespace-nowrap">
            <ArrowLeft className="w-3 h-3 text-black/50 group-hover:text-black transition-colors rotate-90" />
            <span className="text-[11px] font-bold text-black tracking-wide">
              Ditch Instantly — Send unlimited emails for lifetime
            </span>
          </div>
        </button>
      ) : (
        <div className="w-[300px] border-l border-border dark:bg-white dark:text-black bg-[#111] text-white flex flex-col h-full">
          {/* Close */}
          <button
            onClick={() => setExpanded(false)}
            className="flex items-center justify-end h-10 px-4 shrink-0 opacity-40 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Hero */}
          <div className="px-6 pb-6 shrink-0">
            <h2 className="text-[22px] font-bold leading-tight tracking-[-0.02em]">
              Send cold emails.
              <br />
              <span className="dark:text-blue-600 text-blue-400">Never pay monthly.</span>
            </h2>
            <p className="text-[13px] opacity-50 mt-3 leading-relaxed">
              One payment, One command. Your own servers. Unlimited everything for life with free Updates.
            </p>
          </div>

          {/* Key points — minimal */}
          <div className="px-6 pb-6 shrink-0">
            <div className="space-y-3">
              {[
                "Unlimited domains & mailboxes",
                "Inbuilt warmup & rotation",
                "Unified inbox + agency dashboard",
                "No per-seat or per-email fees",
              ].map((item) => (
                <p key={item} className="text-[12px] opacity-70 flex items-center gap-2.5">
                  <span className="w-4 h-px dark:bg-black/20 bg-white/20 shrink-0" />
                  {item}
                </p>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="px-6 pb-6 shrink-0">
            <a
              href="https://cleanmails.online"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-10 bg-yellow-400 hover:bg-yellow-500 text-black text-[13px] font-bold rounded-lg transition-colors"
            >
              See how it works
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <p className="text-[10px] opacity-30 text-center mt-2">One-time $199 — no recurring fees</p>
          </div>

          {/* Separator */}
          <div className="mx-6 h-px dark:bg-black/10 bg-white/10" />

          {/* Testimonials — scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {testimonials.map((t) => (
              <div key={t.name}>
                <div className="flex items-center gap-0.5 mb-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-[12px] opacity-60 leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
                <p className="text-[11px] opacity-30 mt-1.5">
                  {t.name} — {t.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
