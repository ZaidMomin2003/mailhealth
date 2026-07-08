"use client";

import { useState, useEffect } from "react";
import { Bookmark, X } from "lucide-react";

export function BookmarkPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("bookmark-dismissed");
    if (dismissed) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !sessionStorage.getItem("bookmark-dismissed")) {
        setShow(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem("bookmark-dismissed", "true");
  };

  if (!show) return null;

  const isMac = typeof navigator !== "undefined" && navigator.platform.includes("Mac");
  const shortcut = isMac ? "⌘ + D" : "Ctrl + D";

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="bg-card border border-border rounded-xl p-4 shadow-lg flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
          <Bookmark className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-foreground">Bookmark this page</p>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[11px] font-mono text-foreground">{shortcut}</kbd> to save these tools for later
          </p>
        </div>
        <button onClick={handleDismiss} className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
