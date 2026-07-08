"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquareWarning,
  Shield,
  Mail,
  Activity,
  FileText,
  Key,
  Lock,
  Search,
  Globe,
  AlertOctagon,
  BarChart3,
  Wifi,
  CheckSquare,
  Layers,
  ChevronsRight,
  ChevronsLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const toolGroups = [
  {
    label: "Checkers",
    tools: [
      { name: "Spam Checker", href: "/tools/spam-checker", icon: MessageSquareWarning, iconBg: "bg-amber-500/15", iconColor: "text-amber-400" },
      { name: "SPF & DKIM", href: "/tools/dns-audit", icon: Shield, iconBg: "bg-blue-500/15", iconColor: "text-blue-400" },
      { name: "DMARC Checker", href: "/tools/dmarc-checker", icon: Lock, iconBg: "bg-purple-500/15", iconColor: "text-purple-400" },
      { name: "BIMI Checker", href: "/tools/bimi-checker", icon: CheckSquare, iconBg: "bg-teal-500/15", iconColor: "text-teal-400" },
      { name: "Domain Scanner", href: "/tools/domain-scanner", icon: Globe, iconBg: "bg-cyan-500/15", iconColor: "text-cyan-400" },
      { name: "DNS Lookup", href: "/tools/dns-lookup", icon: Search, iconBg: "bg-indigo-500/15", iconColor: "text-indigo-400" },
    ],
  },
  {
    label: "Generators",
    tools: [
      { name: "SPF Generator", href: "/tools/spf-generator", icon: FileText, iconBg: "bg-green-500/15", iconColor: "text-green-400" },
      { name: "DKIM Generator", href: "/tools/dkim-generator", icon: Key, iconBg: "bg-orange-500/15", iconColor: "text-orange-400" },
      { name: "DMARC Generator", href: "/tools/dmarc-generator", icon: Layers, iconBg: "bg-pink-500/15", iconColor: "text-pink-400" },
    ],
  },
  {
    label: "Testing",
    tools: [
      { name: "Mail Tester", href: "/tools/mail-tester", icon: Mail, iconBg: "bg-emerald-500/15", iconColor: "text-emerald-400" },
      { name: "Warmup Tracker", href: "/tools/warmup-tracker", icon: Activity, iconBg: "bg-violet-500/15", iconColor: "text-violet-400" },
      { name: "IP Reputation", href: "/tools/ip-reputation", icon: Wifi, iconBg: "bg-rose-500/15", iconColor: "text-rose-400" },
    ],
  },
  {
    label: "Analyzers",
    tools: [
      { name: "DMARC Analyzer", href: "/tools/dmarc-analyzer", icon: BarChart3, iconBg: "bg-sky-500/15", iconColor: "text-sky-400" },
      { name: "Phishing Checker", href: "/tools/phishing-checker", icon: AlertOctagon, iconBg: "bg-red-500/15", iconColor: "text-red-400" },
    ],
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <aside
      className={cn(
        "shrink-0 border-r border-border bg-card h-[calc(100vh-48px)] sticky top-12 overflow-y-auto hidden lg:flex flex-col transition-all duration-200",
        collapsed ? "w-[56px]" : "w-[240px]"
      )}
    >
      {/* Toggle button at top */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "flex items-center h-9 border-b border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0",
          collapsed ? "justify-center" : "justify-end px-3"
        )}
      >
        {collapsed ? <ChevronsRight className="w-3.5 h-3.5" /> : <ChevronsLeft className="w-3.5 h-3.5" />}
      </button>
      <div className="flex-1 py-2 overflow-y-auto">
        {toolGroups.map((group) => (
          <div key={group.label} className="mb-1">
            {!collapsed && (
              <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {group.label}
              </p>
            )}
            {collapsed && <div className="h-px bg-border mx-2 my-1.5 first:hidden" />}
            <nav className={cn("space-y-0.5", collapsed ? "px-1.5" : "px-2")}>
              {group.tools.map((tool) => {
                const isActive = pathname === tool.href;
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    title={collapsed ? tool.name : undefined}
                    className={cn(
                      "flex items-center rounded-md transition-colors duration-75 group relative",
                      collapsed ? "justify-center p-2" : "gap-2.5 px-3 py-2",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <div className={cn("w-6 h-6 rounded flex items-center justify-center shrink-0", tool.iconBg)}>
                      <Icon className={cn("w-3.5 h-3.5", tool.iconColor)} />
                    </div>
                    {!collapsed && (
                      <span className="text-[13px] font-medium truncate">
                        {tool.name}
                      </span>
                    )}
                    {/* Tooltip for collapsed state */}
                    {collapsed && (
                      <span className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-[11px] font-medium rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                        {tool.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

    </aside>
  );
}
