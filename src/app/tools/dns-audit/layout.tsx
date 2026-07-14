import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free SPF DKIM DMARC Checker — Email Authentication Audit | MailHealth",
  description:
    "Validate your domain's SPF, DKIM, and DMARC records instantly. Our free email authentication checker identifies misconfigurations that hurt deliverability. No signup required.",
  keywords:
    "SPF DKIM checker, email authentication checker, DNS email records, SPF record validator, DKIM lookup, email DNS audit",
  openGraph: {
    title: "Free SPF DKIM DMARC Checker — MailHealth",
    description:
      "Validate SPF, DKIM, and DMARC records for any domain. Identify authentication issues hurting your deliverability.",
    url: "https://mailhealth.dpdns.org/tools/dns-audit",
    siteName: "MailHealth",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free SPF DKIM DMARC Checker — MailHealth",
    description:
      "Validate SPF, DKIM, and DMARC records for any domain. Identify authentication issues hurting your deliverability.",
  },
  alternates: {
    canonical: "https://mailhealth.dpdns.org/tools/dns-audit",
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
            name: "DNS & Email Authentication Checker",
            url: "https://mailhealth.dpdns.org/tools/dns-audit",
            applicationCategory: "Email Tool",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "Free tool to validate SPF, DKIM, and DMARC records for email authentication",
          }),
        }}
      />
      {children}
    </>
  );
}
