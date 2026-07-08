import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free BIMI Record Checker & Logo Lookup | MailHealth",
  description:
    "Check if a domain has a BIMI record configured. See the brand logo URL, VMC certificate, and preview how your logo appears in email clients like Gmail and Yahoo. Free tool — no signup.",
  keywords:
    "BIMI record checker, BIMI lookup, brand logo email, BIMI validator, BIMI DNS record, email brand indicators",
  openGraph: {
    title: "Free BIMI Record Checker — MailHealth",
    description:
      "Check if your domain has BIMI configured. Preview your brand logo as it appears in Gmail and Yahoo inboxes.",
    url: "https://mailhealth.online/tools/bimi-checker",
    siteName: "MailHealth",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free BIMI Record Checker — MailHealth",
    description:
      "Check if your domain has BIMI configured. Preview your brand logo as it appears in Gmail and Yahoo inboxes.",
  },
  alternates: {
    canonical: "https://mailhealth.online/tools/bimi-checker",
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
            name: "BIMI Record Checker",
            url: "https://mailhealth.online/tools/bimi-checker",
            applicationCategory: "Email Tool",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "Free tool to check BIMI DNS records and preview brand logos in email clients",
          }),
        }}
      />
      {children}
    </>
  );
}
