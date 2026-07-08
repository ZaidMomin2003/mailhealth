import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Email Warmup Tracker — Inbox Placement Rate Test | MailHealth",
  description:
    "Test your email warmup progress with 50 seed addresses. See inbox vs spam placement rates across providers like Gmail, Outlook, and Yahoo. Track your sender reputation in real time. Free tool.",
  keywords:
    "email warmup test, inbox placement rate, email warmup checker, seed list tester, email warmup tracker, sender reputation test",
  openGraph: {
    title: "Free Email Warmup Tracker — MailHealth",
    description:
      "Send to 50 seed addresses and see where your emails land — inbox, spam, or missing. Track warmup progress.",
    url: "https://mailhealth.online/tools/warmup-tracker",
    siteName: "MailHealth",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Email Warmup Tracker — MailHealth",
    description:
      "Send to 50 seed addresses and see where your emails land — inbox, spam, or missing. Track warmup progress.",
  },
  alternates: {
    canonical: "https://mailhealth.online/tools/warmup-tracker",
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
            name: "Email Warmup Tracker",
            url: "https://mailhealth.online/tools/warmup-tracker",
            applicationCategory: "Email Tool",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "Free email warmup tracker — test inbox placement rates across providers with seed addresses",
          }),
        }}
      />
      {children}
    </>
  );
}
