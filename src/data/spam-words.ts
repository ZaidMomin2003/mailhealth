export interface SpamWord {
  word: string;
  alternative: string;
  severity: "high" | "medium" | "low";
}

export const spamWords: SpamWord[] = [
  // High severity — almost always triggers filters
  { word: "free", alternative: "complimentary", severity: "high" },
  { word: "guarantee", alternative: "assurance", severity: "high" },
  { word: "no obligation", alternative: "no commitment needed", severity: "high" },
  { word: "risk-free", alternative: "worry-free", severity: "high" },
  { word: "act now", alternative: "get started today", severity: "high" },
  { word: "limited time", alternative: "available this week", severity: "high" },
  { word: "urgent", alternative: "time-sensitive", severity: "high" },
  { word: "winner", alternative: "selected participant", severity: "high" },
  { word: "congratulations", alternative: "great news", severity: "high" },
  { word: "cash", alternative: "funds", severity: "high" },
  { word: "earn money", alternative: "generate revenue", severity: "high" },
  { word: "make money", alternative: "build income", severity: "high" },
  { word: "double your", alternative: "grow your", severity: "high" },
  { word: "click here", alternative: "learn more", severity: "high" },
  { word: "buy now", alternative: "get access", severity: "high" },
  { word: "order now", alternative: "reserve your spot", severity: "high" },
  { word: "sign up free", alternative: "create your account", severity: "high" },
  { word: "no cost", alternative: "included", severity: "high" },
  { word: "100%", alternative: "fully", severity: "high" },
  { word: "unsubscribe", alternative: "manage preferences", severity: "high" },

  // Medium severity — context-dependent triggers
  { word: "discount", alternative: "savings", severity: "medium" },
  { word: "offer", alternative: "opportunity", severity: "medium" },
  { word: "deal", alternative: "arrangement", severity: "medium" },
  { word: "promotion", alternative: "initiative", severity: "medium" },
  { word: "special", alternative: "exclusive", severity: "medium" },
  { word: "bonus", alternative: "additional benefit", severity: "medium" },
  { word: "cheap", alternative: "affordable", severity: "medium" },
  { word: "lowest price", alternative: "competitive pricing", severity: "medium" },
  { word: "save big", alternative: "reduce costs", severity: "medium" },
  { word: "limited offer", alternative: "current availability", severity: "medium" },
  { word: "exclusive deal", alternative: "priority access", severity: "medium" },
  { word: "incredible", alternative: "noteworthy", severity: "medium" },
  { word: "amazing", alternative: "impressive", severity: "medium" },
  { word: "opportunity", alternative: "possibility", severity: "medium" },
  { word: "instant", alternative: "immediate", severity: "medium" },
  { word: "no strings attached", alternative: "straightforward", severity: "medium" },
  { word: "call now", alternative: "schedule a call", severity: "medium" },
  { word: "apply now", alternative: "submit your application", severity: "medium" },
  { word: "don't miss", alternative: "worth exploring", severity: "medium" },
  { word: "hurry", alternative: "reach out soon", severity: "medium" },

  // Low severity — mild flags
  { word: "please read", alternative: "for your review", severity: "low" },
  { word: "dear friend", alternative: "hi there", severity: "low" },
  { word: "as seen on", alternative: "featured in", severity: "low" },
  { word: "best price", alternative: "strong value", severity: "low" },
  { word: "compare", alternative: "evaluate", severity: "low" },
  { word: "no hidden", alternative: "transparent", severity: "low" },
  { word: "satisfaction", alternative: "confidence", severity: "low" },
  { word: "tremendous", alternative: "significant", severity: "low" },
  { word: "while supplies last", alternative: "based on availability", severity: "low" },
  { word: "you've been selected", alternative: "you qualify", severity: "low" },
];
