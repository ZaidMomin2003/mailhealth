import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free DNS Record Lookup — DNS Checker Tool | MailHealth",
  description:
    "Query any DNS record type for any domain — A, AAAA, CNAME, MX, TXT, NS, SOA, SRV, and PTR. Fast results powered by Cloudflare DNS-over-HTTPS. Free DNS lookup — no signup.",
  keywords:
    "DNS record lookup, DNS checker, DNS TXT record lookup, DNS query tool, MX record lookup, DNS propagation checker",
  openGraph: {
    title: "Free DNS Record Lookup — MailHealth",
    description:
      "Query any DNS record type instantly. A, AAAA, MX, TXT, CNAME, NS — all powered by Cloudflare DoH.",
    url: "https://mailhealth.online/tools/dns-lookup",
    siteName: "MailHealth",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free DNS Record Lookup — MailHealth",
    description:
      "Query any DNS record type instantly. A, AAAA, MX, TXT, CNAME, NS — all powered by Cloudflare DoH.",
  },
  alternates: {
    canonical: "https://mailhealth.online/tools/dns-lookup",
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
            name: "DNS Record Lookup",
            url: "https://mailhealth.online/tools/dns-lookup",
            applicationCategory: "Network Tool",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "Free DNS lookup tool to query A, AAAA, MX, TXT, CNAME, NS, SOA, SRV, and PTR records",
          }),
        }}
      />
      {children}
    </>
  );
}
