import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Email Domain Scanner — Domain Health Check | MailHealth",
  description:
    "Run a comprehensive email infrastructure audit on any domain. Checks MX, SPF, DKIM, DMARC, and BIMI in one scan. Get a complete domain health report instantly. No signup required.",
  keywords:
    "email domain scanner, domain health check, email infrastructure audit, domain email checker, MX record checker, email domain validator",
  openGraph: {
    title: "Free Email Domain Scanner — MailHealth",
    description:
      "Comprehensive email infrastructure scan. Checks MX, SPF, DKIM, DMARC, and BIMI in one go.",
    url: "https://mailhealth.online/tools/domain-scanner",
    siteName: "MailHealth",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Email Domain Scanner — MailHealth",
    description:
      "Comprehensive email infrastructure scan. Checks MX, SPF, DKIM, DMARC, and BIMI in one go.",
  },
  alternates: {
    canonical: "https://mailhealth.online/tools/domain-scanner",
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
            name: "Email Domain Scanner",
            url: "https://mailhealth.online/tools/domain-scanner",
            applicationCategory: "Email Tool",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "Free comprehensive email domain health checker — scans MX, SPF, DKIM, DMARC, and BIMI",
          }),
        }}
      />
      {children}
    </>
  );
}
