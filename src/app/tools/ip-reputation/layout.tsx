import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free IP Reputation Checker — Email IP Blocklist Lookup | MailHealth",
  description:
    "Check if your sending IP is listed on major email blocklists like Spamhaus, Barracuda, SpamCop, and SORBS. Get a reputation score and identify blacklist issues. No signup required.",
  keywords:
    "IP reputation checker, email IP blocklist check, IP blacklist lookup, IP reputation score, DNSBL checker, email IP address check",
  openGraph: {
    title: "Free IP Reputation Checker — MailHealth",
    description:
      "Check your sending IP against Spamhaus, Barracuda, SpamCop, and 5 more blocklists instantly.",
    url: "https://mailhealth.dpdns.org/tools/ip-reputation",
    siteName: "MailHealth",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free IP Reputation Checker — MailHealth",
    description:
      "Check your sending IP against Spamhaus, Barracuda, SpamCop, and 5 more blocklists instantly.",
  },
  alternates: {
    canonical: "https://mailhealth.dpdns.org/tools/ip-reputation",
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
            name: "IP Reputation Checker",
            url: "https://mailhealth.dpdns.org/tools/ip-reputation",
            applicationCategory: "Email Tool",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "Free IP reputation checker — scan sending IPs against major email blocklists",
          }),
        }}
      />
      {children}
    </>
  );
}
