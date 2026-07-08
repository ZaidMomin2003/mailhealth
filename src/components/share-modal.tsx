"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";

const SITE_URL = "https://mailhealth.online";
const SHARE_TEXT = "Just found this free email deliverability toolkit — checks spam words, DNS, DMARC, inbox placement & more. No signup needed.";

const platforms = [
  {
    name: "X",
    logo: { light: "/logos/x-light.svg", dark: "/logos/x-dark.svg" },
    getUrl: () => `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SITE_URL)}`,
  },
  {
    name: "Reddit",
    logo: "/logos/reddit.svg",
    getUrl: () => `https://reddit.com/submit?url=${encodeURIComponent(SITE_URL)}&title=${encodeURIComponent("Free email deliverability tools — no signup, no tracking")}`,
  },
  {
    name: "LinkedIn",
    logo: "/logos/linkedin.svg",
    getUrl: () => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`,
  },
  {
    name: "Facebook",
    logo: "/logos/facebook-icon.svg",
    getUrl: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`,
  },
  {
    name: "WhatsApp",
    logo: "/logos/whatsapp-icon.svg",
    getUrl: () => `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + " " + SITE_URL)}`,
  },
  {
    name: "Telegram",
    logo: "/logos/telegram.svg",
    getUrl: () => `https://t.me/share/url?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(SHARE_TEXT)}`,
  },
  {
    name: "Email",
    logo: "/logos/gmail.svg",
    getUrl: () => `mailto:?subject=${encodeURIComponent("Check out these free email tools")}&body=${encodeURIComponent(SHARE_TEXT + "\n\n" + SITE_URL)}`,
  },
];

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShareModal({ open, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  if (!open) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(SITE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogoSrc = (logo: string | { light: string; dark: string }) => {
    if (typeof logo === "string") return logo;
    return theme === "dark" ? logo.dark : logo.light;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl w-full max-w-[360px] p-6 shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-[17px] font-semibold text-foreground mb-1">Share MailHealth</h3>
        <p className="text-[13px] text-muted-foreground mb-5">Help others discover these free tools</p>

        <div className="grid grid-cols-4 gap-3 mb-5">
          {platforms.map((p) => (
            <a
              key={p.name}
              href={p.getUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="w-9 h-9 flex items-center justify-center">
                <Image
                  src={getLogoSrc(p.logo)}
                  alt={p.name}
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{p.name}</span>
            </a>
          ))}
        </div>

        {/* Copy link */}
        <div className="flex gap-2">
          <input
            readOnly
            value={SITE_URL}
            className="flex-1 h-9 px-3 bg-muted/50 border border-border rounded-lg text-[12px] text-muted-foreground font-mono"
          />
          <button
            onClick={handleCopyLink}
            className="h-9 px-4 bg-yellow-400 hover:bg-yellow-500 text-black text-[12px] font-semibold rounded-lg transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
