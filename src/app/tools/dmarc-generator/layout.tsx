import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free DMARC Record Generator — DMARC Policy Builder | MailHealth",
  description:
    "Generate a DMARC DNS record with custom policy, subdomain handling, aggregate & forensic reporting, alignment, and percentage settings. Free DMARC generator — no signup required.",
  keywords:
    "DMARC record generator, DMARC policy generator, create DMARC record, DMARC builder, DMARC setup tool, DMARC configuration",
  openGraph: {
    title: "Free DMARC Record Generator — MailHealth",
    description:
      "Configure your DMARC policy with reporting, alignment, and percentage options. Copy the TXT record for your DNS.",
    url: "https://mailhealth.dpdns.org/tools/dmarc-generator",
    siteName: "MailHealth",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free DMARC Record Generator — MailHealth",
    description:
      "Configure your DMARC policy with reporting, alignment, and percentage options. Copy the TXT record for your DNS.",
  },
  alternates: {
    canonical: "https://mailhealth.dpdns.org/tools/dmarc-generator",
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
            name: "DMARC Record Generator",
            url: "https://mailhealth.dpdns.org/tools/dmarc-generator",
            applicationCategory: "Email Tool",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "Free DMARC record generator with policy, reporting, alignment, and percentage configuration",
          }),
        }}
      />
      {children}
    </>
  );
}
