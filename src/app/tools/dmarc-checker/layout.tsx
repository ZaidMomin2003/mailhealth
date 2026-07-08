import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free DMARC Record Checker & Lookup Tool | MailHealth",
  description:
    "Look up and analyze any domain's DMARC record. See the enforcement policy, reporting addresses, subdomain policy, and alignment settings. Free DMARC lookup — no signup required.",
  keywords:
    "DMARC record checker, DMARC lookup, DMARC policy checker, DMARC validator, check DMARC record, DMARC analyzer",
  openGraph: {
    title: "Free DMARC Record Checker — MailHealth",
    description:
      "Look up and analyze DMARC records for any domain. See enforcement policy, reporting, and alignment settings.",
    url: "https://mailhealth.online/tools/dmarc-checker",
    siteName: "MailHealth",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free DMARC Record Checker — MailHealth",
    description:
      "Look up and analyze DMARC records for any domain. See enforcement policy, reporting, and alignment settings.",
  },
  alternates: {
    canonical: "https://mailhealth.online/tools/dmarc-checker",
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
            name: "DMARC Record Checker",
            url: "https://mailhealth.online/tools/dmarc-checker",
            applicationCategory: "Email Tool",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "Free DMARC record lookup and analysis tool for any domain",
          }),
        }}
      />
      {children}
    </>
  );
}
