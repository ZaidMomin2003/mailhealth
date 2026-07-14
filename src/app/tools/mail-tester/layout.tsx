import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Email Deliverability Tester — Inbox Placement Test | MailHealth",
  description:
    "Send a test email and get a deliverability score instantly. Checks SPF, DKIM, DMARC authentication and content scoring. See exactly how inbox providers will treat your email. No signup.",
  keywords:
    "email deliverability tester, inbox placement test, email score checker, mail tester, email authentication test, deliverability score",
  openGraph: {
    title: "Free Email Deliverability Tester — MailHealth",
    description:
      "Send a test email and get your deliverability score. SPF, DKIM, DMARC checks plus content analysis.",
    url: "https://mailhealth.dpdns.org/tools/mail-tester",
    siteName: "MailHealth",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Email Deliverability Tester — MailHealth",
    description:
      "Send a test email and get your deliverability score. SPF, DKIM, DMARC checks plus content analysis.",
  },
  alternates: {
    canonical: "https://mailhealth.dpdns.org/tools/mail-tester",
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
            name: "Email Deliverability Tester",
            url: "https://mailhealth.dpdns.org/tools/mail-tester",
            applicationCategory: "Email Tool",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "Free email deliverability tester — send an email and get authentication and content scoring results",
          }),
        }}
      />
      {children}
    </>
  );
}
