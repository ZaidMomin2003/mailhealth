import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free DKIM Record Generator — DKIM DNS Setup | MailHealth",
  description:
    "Generate a DKIM DNS TXT record from your public key. Supports RSA and Ed25519 key types. Get the correct DNS name and record value to add to your domain. No signup required.",
  keywords:
    "DKIM record generator, DKIM setup, DKIM DNS record, generate DKIM key, DKIM TXT record, DKIM selector setup",
  openGraph: {
    title: "Free DKIM Record Generator — MailHealth",
    description:
      "Generate a DKIM DNS TXT record from your public key. Supports RSA and Ed25519. Copy and add to DNS.",
    url: "https://mailhealth.dpdns.org/tools/dkim-generator",
    siteName: "MailHealth",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free DKIM Record Generator — MailHealth",
    description:
      "Generate a DKIM DNS TXT record from your public key. Supports RSA and Ed25519. Copy and add to DNS.",
  },
  alternates: {
    canonical: "https://mailhealth.dpdns.org/tools/dkim-generator",
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
            name: "DKIM Record Generator",
            url: "https://mailhealth.dpdns.org/tools/dkim-generator",
            applicationCategory: "Email Tool",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "Free DKIM record generator to create DNS TXT records from RSA or Ed25519 public keys",
          }),
        }}
      />
      {children}
    </>
  );
}
