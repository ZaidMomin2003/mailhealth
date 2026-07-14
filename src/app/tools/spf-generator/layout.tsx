import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free SPF Record Generator & Builder | MailHealth",
  description:
    "Generate a valid SPF record for your domain. Add include mechanisms, IP addresses, and select a failure policy. Copy the DNS TXT record and add it to your domain. No signup required.",
  keywords:
    "SPF record generator, create SPF record, SPF record builder, SPF syntax generator, SPF include generator, email authentication setup",
  openGraph: {
    title: "Free SPF Record Generator — MailHealth",
    description:
      "Build a valid SPF record with include statements, IP addresses, and policy settings. Copy and paste into DNS.",
    url: "https://mailhealth.dpdns.org/tools/spf-generator",
    siteName: "MailHealth",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free SPF Record Generator — MailHealth",
    description:
      "Build a valid SPF record with include statements, IP addresses, and policy settings. Copy and paste into DNS.",
  },
  alternates: {
    canonical: "https://mailhealth.dpdns.org/tools/spf-generator",
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
            name: "SPF Record Generator",
            url: "https://mailhealth.dpdns.org/tools/spf-generator",
            applicationCategory: "Email Tool",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "Free SPF record generator to build valid SPF TXT records with include mechanisms and IP authorization",
          }),
        }}
      />
      {children}
    </>
  );
}
