"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShareModal } from "@/components/share-modal";
import { Heart, ArrowUpRight, Share2, Menu, X, MessageSquareWarning, Shield, Mail, Activity, FileText, Key, Lock, Search, Globe, AlertOctagon, BarChart3, Wifi, CheckSquare, Layers } from "lucide-react";

const allTools = [
  { name: "Spam Checker", href: "/tools/spam-checker", icon: MessageSquareWarning },
  { name: "SPF & DKIM Checker", href: "/tools/dns-audit", icon: Shield },
  { name: "DMARC Checker", href: "/tools/dmarc-checker", icon: Lock },
  { name: "BIMI Checker", href: "/tools/bimi-checker", icon: CheckSquare },
  { name: "Domain Scanner", href: "/tools/domain-scanner", icon: Globe },
  { name: "DNS Lookup", href: "/tools/dns-lookup", icon: Search },
  { name: "SPF Generator", href: "/tools/spf-generator", icon: FileText },
  { name: "DKIM Generator", href: "/tools/dkim-generator", icon: Key },
  { name: "DMARC Generator", href: "/tools/dmarc-generator", icon: Layers },
  { name: "Mail Tester", href: "/tools/mail-tester", icon: Mail },
  { name: "Warmup Tracker", href: "/tools/warmup-tracker", icon: Activity },
  { name: "IP Reputation", href: "/tools/ip-reputation", icon: Wifi },
  { name: "DMARC Analyzer", href: "/tools/dmarc-analyzer", icon: BarChart3 },
  { name: "Phishing Checker", href: "/tools/phishing-checker", icon: AlertOctagon },
];

export function TopNav() {
  const [shareOpen, setShareOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 sm:px-5 sticky top-0 z-40">
        {/* Left */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          <Link href="/tools/spam-checker" className="text-[14px] font-semibold text-foreground hover:opacity-80 transition-opacity">
            MailHealth
          </Link>
          <span className="text-muted-foreground text-[14px] hidden sm:inline">/</span>
          <span className="text-[14px] text-muted-foreground hidden sm:inline">Tools</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/privacy" className="text-[12px] text-muted-foreground hover:text-foreground font-medium transition-colors hidden sm:block">
            Privacy
          </Link>
          <button
            onClick={() => setShareOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <ThemeToggle />
          <a
            href="https://cleanmails.online"
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 px-3 sm:px-3.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-[12px] font-semibold rounded-md flex items-center gap-1.5 transition-colors"
          >
            <span className="hidden sm:inline">Get Cleanmails</span>
            <span className="sm:hidden">Cleanmails</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-12 z-30">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-[280px] h-full bg-card border-r border-border overflow-y-auto">
            <nav className="p-3 space-y-0.5">
              {allTools.map((tool) => {
                const isActive = pathname === tool.href;
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[13px] font-medium">{tool.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-border">
              <Link href="/privacy" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-[12px] text-muted-foreground hover:text-foreground">Privacy Policy</Link>
              <Link href="/terms" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-[12px] text-muted-foreground hover:text-foreground">Terms of Service</Link>
            </div>
          </div>
        </div>
      )}

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  );
}
