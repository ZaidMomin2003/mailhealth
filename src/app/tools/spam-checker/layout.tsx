import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Spam Word Checker — Email Deliverability Tool | MailHealth",
  description:
    "Check your cold email for spam trigger words. Our free tool scans your email copy, highlights risky words, and suggests inbox-safe alternatives. No signup required.",
  keywords:
    "spam word checker, email spam checker, cold email spam words, deliverability checker, spam trigger words, email content checker",
  openGraph: {
    title: "Free Spam Word Checker — MailHealth",
    description:
      "Scan your cold email for spam trigger words and get inbox-safe alternatives instantly.",
    url: "https://mailhealth.dpdns.org/tools/spam-checker",
    siteName: "MailHealth",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Spam Word Checker — MailHealth",
    description:
      "Scan your cold email for spam trigger words and get inbox-safe alternatives instantly.",
  },
  alternates: {
    canonical: "https://mailhealth.dpdns.org/tools/spam-checker",
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
            name: "Spam Word Checker",
            url: "https://mailhealth.dpdns.org/tools/spam-checker",
            applicationCategory: "Email Tool",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "Free tool to check email content for spam trigger words and get inbox-safe alternatives",
          }),
        }}
      />
      {children}
    </>
  );
}
