import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = [
    "spam-checker",
    "dns-audit",
    "dmarc-checker",
    "bimi-checker",
    "domain-scanner",
    "dns-lookup",
    "spf-generator",
    "dkim-generator",
    "dmarc-generator",
    "mail-tester",
    "warmup-tracker",
    "ip-reputation",
    "dmarc-analyzer",
    "phishing-checker",
  ];

  return [
    {
      url: "https://mailhealth.online",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://mailhealth.online/privacy",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: "https://mailhealth.online/terms",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...tools.map((t) => ({
      url: `https://mailhealth.online/tools/${t}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
