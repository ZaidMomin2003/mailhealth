import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Phishing Link Checker — URL Safety Scanner | MailHealth",
  description:
    "Analyze any URL for phishing indicators. Checks for suspicious TLDs, brand impersonation, IP-based URLs, URL shorteners, and missing HTTPS. Free phishing detection tool — no signup.",
  keywords:
    "phishing link checker, URL safety checker, phishing detection tool, phishing URL scanner, suspicious link checker, email link safety",
  openGraph: {
    title: "Free Phishing Link Checker — MailHealth",
    description:
      "Analyze URLs for phishing indicators including suspicious TLDs, brand impersonation, and missing HTTPS.",
    url: "https://mailhealth.online/tools/phishing-checker",
    siteName: "MailHealth",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Phishing Link Checker — MailHealth",
    description:
      "Analyze URLs for phishing indicators including suspicious TLDs, brand impersonation, and missing HTTPS.",
  },
  alternates: {
    canonical: "https://mailhealth.online/tools/phishing-checker",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Phishing Link Checker",
            url: "https://mailhealth.online/tools/phishing-checker",
            applicationCategory: "Security Tool",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "Free phishing link detection tool — analyze URLs for suspicious TLDs, brand impersonation, and security issues",
          }),
        }}
      />
      {children}
    </>
  );
}
