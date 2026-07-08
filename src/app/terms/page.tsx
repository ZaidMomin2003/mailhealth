import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="max-w-[740px] mx-auto px-8 py-10">
      <Link href="/tools/spam-checker" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to tools
      </Link>

      <h1 className="text-[28px] font-bold text-foreground tracking-[-0.02em] mb-2">Terms of Service</h1>
      <p className="text-[13px] text-muted-foreground mb-8">Last updated: July 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-[14px] text-muted-foreground leading-[1.8]">
        <section>
          <h2 className="text-[16px] font-semibold text-foreground mb-2">Overview</h2>
          <p>
            MailHealth (mailhealth.online) provides free email deliverability tools. By using our tools, you agree to these terms. It&apos;s simple — use the tools for free, don&apos;t abuse them.
          </p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-foreground mb-2">Service Description</h2>
          <p>
            MailHealth provides free, no-signup email deliverability tools including spam word checking, DNS record validation, SPF/DKIM/DMARC generation, inbox testing, and more.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>All tools are provided free of charge</li>
            <li>No account or registration is required</li>
            <li>No personal data is collected or stored</li>
            <li>Service availability is provided on a best-effort basis</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-foreground mb-2">Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Use automated scripts to make excessive requests to our tools</li>
            <li>Attempt to exploit, hack, or disrupt our services</li>
            <li>Use our tools to facilitate spam, phishing, or other malicious activities</li>
            <li>Resell access to our tools or rebrand them as your own</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-foreground mb-2">Disclaimer</h2>
          <p>
            Our tools are provided &ldquo;as is&rdquo; without warranty of any kind. While we strive for accuracy, DNS lookups and deliverability analysis are informational only and should not be considered professional advice. We are not responsible for any actions taken based on our tool results.
          </p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-foreground mb-2">Limitation of Liability</h2>
          <p>
            MailHealth shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
          </p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-foreground mb-2">Changes</h2>
          <p>
            We may update these terms at any time. Continued use of the service constitutes acceptance of any changes.
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
