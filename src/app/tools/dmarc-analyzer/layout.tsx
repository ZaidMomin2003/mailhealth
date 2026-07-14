import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free DMARC Report Analyzer — XML Aggregate Report Viewer | MailHealth",
  description:
    "Upload a DMARC aggregate report XML file and visualize authentication results. See pass/fail rates, source IPs, SPF and DKIM status, and policy actions at a glance. Free tool.",
  keywords:
    "DMARC report analyzer, DMARC XML parser, aggregate report viewer, DMARC report reader, DMARC forensic report, DMARC visualization",
  openGraph: {
    title: "Free DMARC Report Analyzer — MailHealth",
    description:
      "Upload DMARC aggregate XML reports and visualize authentication results, source IPs, and policy actions.",
    url: "https://mailhealth.dpdns.org/tools/dmarc-analyzer",
    siteName: "MailHealth",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free DMARC Report Analyzer — MailHealth",
    description:
      "Upload DMARC aggregate XML reports and visualize authentication results, source IPs, and policy actions.",
  },
  alternates: {
    canonical: "https://mailhealth.dpdns.org/tools/dmarc-analyzer",
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
            name: "DMARC Report Analyzer",
            url: "https://mailhealth.dpdns.org/tools/dmarc-analyzer",
            applicationCategory: "Email Tool",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "Free DMARC aggregate report analyzer — upload XML and visualize email authentication data",
          }),
        }}
      />
      {children}
    </>
  );
}
