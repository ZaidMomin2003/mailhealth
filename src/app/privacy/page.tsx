import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-[740px] mx-auto px-8 py-10">
      <Link href="/tools/spam-checker" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to tools
      </Link>

      <h1 className="text-[28px] font-bold text-foreground tracking-[-0.02em] mb-2">Privacy Policy</h1>
      <p className="text-[13px] text-muted-foreground mb-8">Last updated: July 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-[14px] text-muted-foreground leading-[1.8]">
        <section>
          <h2 className="text-[16px] font-semibold text-foreground mb-2">The Short Version</h2>
          <p>
            MailHealth is a collection of free email deliverability tools. <strong className="text-foreground">We do not collect, store, or process any personal information.</strong> No accounts. No cookies. No tracking. No databases.
          </p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-foreground mb-2">What Data We Collect</h2>
          <p><strong className="text-foreground">None.</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>We do not require signup or login</li>
            <li>We do not store any email content you paste into our tools</li>
            <li>We do not store domain names you look up</li>
            <li>We do not use cookies or tracking pixels</li>
            <li>We do not use analytics services (no Google Analytics, no Mixpanel, nothing)</li>
            <li>We do not store IP addresses</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-foreground mb-2">How Our Tools Work</h2>
          <p>
            All DNS lookups are performed client-side via Cloudflare&apos;s public DNS-over-HTTPS API. Your browser makes these requests directly — our server never sees them. The Spam Word Checker runs entirely in your browser using a local dictionary. Nothing leaves your machine.
          </p>
          <p>
            For tools that require a backend (Mail Tester, Warmup Tracker), emails sent to our test addresses are processed in memory, results are delivered, and then permanently deleted. No email content is stored.
          </p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-foreground mb-2">Third-Party Services</h2>
          <p>
            The only external service our tools communicate with is Cloudflare&apos;s public DNS resolver (1.1.1.1) for DNS record lookups. We do not share any data with advertisers, data brokers, or analytics providers.
          </p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-foreground mb-2">Contact</h2>
          <p>
            Questions? Email us at{" "}
            <a href="mailto:help@mailhealth.online" className="text-blue-400 hover:underline">help@mailhealth.online</a>
          </p>
        </section>
      </div>
    </div>
  );
}
