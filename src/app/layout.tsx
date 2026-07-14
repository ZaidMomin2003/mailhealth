import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TopNav } from "@/components/top-nav";
import { SidebarNav } from "@/components/sidebar-nav";
import { PromoSidebar } from "@/components/promo-sidebar";
import { BookmarkPopup } from "@/components/bookmark-popup";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "MailHealth — Free Email Deliverability Tools",
    template: "%s | MailHealth",
  },
  description:
    "14 free email deliverability tools: spam word checker, SPF/DKIM/DMARC validator, DNS auditor, inbox tester, warmup tracker, IP reputation checker. No signup, no tracking, completely free.",
  keywords: [
    "email deliverability tools",
    "spam word checker",
    "SPF checker",
    "DKIM checker",
    "DMARC checker",
    "email tester",
    "inbox placement test",
    "DNS record lookup",
    "SPF generator",
    "DKIM generator",
    "DMARC generator",
    "email warmup tracker",
    "IP reputation checker",
    "cold email tools",
    "email authentication",
    "free email tools",
  ],
  authors: [{ name: "MailHealth", url: "https://mailhealth.dpdns.org" }],
  creator: "MailHealth",
  publisher: "MailHealth",
  metadataBase: new URL("https://mailhealth.dpdns.org"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mailhealth.dpdns.org",
    siteName: "MailHealth",
    title: "MailHealth — Free Email Deliverability Tools",
    description:
      "14 free tools to check spam words, validate DNS, test inbox placement, and fix email authentication. No signup required.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "MailHealth — Free Email Deliverability Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MailHealth — Free Email Deliverability Tools",
    description:
      "14 free tools to check spam words, validate DNS, test inbox placement, and fix email authentication. No signup required.",
    images: ["/og-image.svg"],
    creator: "@mailhealth",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-5C0WVREZQC" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-5C0WVREZQC');
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "MailHealth",
              url: "https://mailhealth.dpdns.org",
              description: "Free email deliverability tools for cold email senders",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://mailhealth.dpdns.org/tools/{search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "MailHealth",
              url: "https://mailhealth.dpdns.org",
              logo: "https://mailhealth.dpdns.org/favicon.svg",
              contactPoint: {
                "@type": "ContactPoint",
                email: "help@mailhealth.dpdns.org",
                contactType: "customer support",
              },
              sameAs: [],
            }),
          }}
        />
      </head>
      <body className="h-full font-sans antialiased bg-background text-foreground">
        <ThemeProvider>
          <div className="h-full flex flex-col">
            <TopNav />
            <div className="flex-1 flex overflow-hidden">
              <SidebarNav />
              <main className="flex-1 overflow-y-auto bg-background">
                {children}
              </main>
              <PromoSidebar />
            </div>
          </div>
          <BookmarkPopup />
        </ThemeProvider>
      </body>
    </html>
  );
}
