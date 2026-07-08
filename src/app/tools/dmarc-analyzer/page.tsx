"use client";

import { useState } from "react";
import { Upload, FileText, BarChart3, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

interface DmarcReport {
  org: string;
  dateRange: string;
  domain: string;
  totalMessages: number;
  passCount: number;
  failCount: number;
  records: { sourceIp: string; count: number; spf: string; dkim: string; disposition: string }[];
}

function parseXml(xmlText: string): DmarcReport | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, "text/xml");

    const org = doc.querySelector("report_metadata > org_name")?.textContent || "Unknown";
    const dateBegin = doc.querySelector("report_metadata > date_range > begin")?.textContent || "";
    const dateEnd = doc.querySelector("report_metadata > date_range > end")?.textContent || "";
    const domain = doc.querySelector("policy_published > domain")?.textContent || "Unknown";

    const dateRange = dateBegin && dateEnd
      ? `${new Date(Number(dateBegin) * 1000).toLocaleDateString()} — ${new Date(Number(dateEnd) * 1000).toLocaleDateString()}`
      : "Unknown";

    const recordNodes = doc.querySelectorAll("record");
    const records: DmarcReport["records"] = [];
    let totalMessages = 0, passCount = 0, failCount = 0;

    recordNodes.forEach((node) => {
      const count = Number(node.querySelector("row > count")?.textContent || "0");
      const sourceIp = node.querySelector("row > source_ip")?.textContent || "Unknown";
      const disposition = node.querySelector("row > policy_evaluated > disposition")?.textContent || "none";
      const dkim = node.querySelector("row > policy_evaluated > dkim")?.textContent || "fail";
      const spf = node.querySelector("row > policy_evaluated > spf")?.textContent || "fail";

      totalMessages += count;
      if (dkim === "pass" && spf === "pass") passCount += count;
      else failCount += count;

      records.push({ sourceIp, count, spf, dkim, disposition });
    });

    return { org, dateRange, domain, totalMessages, passCount, failCount, records };
  } catch {
    return null;
  }
}

export default function DmarcAnalyzerPage() {
  const [report, setReport] = useState<DmarcReport | null>(null);
  const [error, setError] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseXml(text);
      if (parsed) setReport(parsed);
      else setError("Could not parse DMARC report. Ensure it's a valid XML aggregate report.");
    };
    reader.readAsText(file);
  };

  const passRate = report ? Math.round((report.passCount / report.totalMessages) * 100) : 0;

  return (
    <div className="max-w-[740px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <h1 className="text-[28px] font-bold text-foreground tracking-[-0.02em] mb-2">DMARC Report Analyzer</h1>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
        Upload a DMARC aggregate report (XML) to visualize authentication results, failing sources, and policy actions.
      </p>

      {/* Upload */}
      {!report && (
        <label className="flex flex-col items-center gap-3 p-10 border-2 border-dashed border-border rounded-lg hover:border-muted-foreground/30 hover:bg-muted/20 transition-colors cursor-pointer">
          <Upload className="w-8 h-8 text-muted-foreground" />
          <div className="text-center">
            <p className="text-[14px] font-medium text-foreground">Upload DMARC XML Report</p>
            <p className="text-[12px] text-muted-foreground mt-1">Drag & drop or click to select (.xml)</p>
          </div>
          <input type="file" accept=".xml" onChange={handleFileUpload} className="hidden" />
        </label>
      )}

      {error && <p className="text-[13px] text-red-400 mt-4">{error}</p>}

      {report && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-border rounded-lg p-4 text-center">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Total Messages</p>
              <p className="text-[22px] font-bold text-foreground tabular-nums">{report.totalMessages}</p>
            </div>
            <div className="border border-border rounded-lg p-4 text-center">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Pass Rate</p>
              <p className={`text-[22px] font-bold tabular-nums ${passRate >= 90 ? "text-emerald-400" : passRate >= 60 ? "text-yellow-400" : "text-red-400"}`}>{passRate}%</p>
            </div>
            <div className="border border-border rounded-lg p-4 text-center">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Failed</p>
              <p className="text-[22px] font-bold text-red-400 tabular-nums">{report.failCount}</p>
            </div>
          </div>

          {/* Meta */}
          <div className="border border-border rounded-lg divide-y divide-border">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[13px] text-muted-foreground">Reporting Org</span>
              <span className="text-[13px] font-medium text-foreground">{report.org}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[13px] text-muted-foreground">Domain</span>
              <code className="text-[12px] font-mono text-foreground">{report.domain}</code>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[13px] text-muted-foreground">Date Range</span>
              <span className="text-[12px] text-foreground">{report.dateRange}</span>
            </div>
          </div>

          {/* Records table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Source Details</span>
            </div>
            <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
              {report.records.map((r, i) => (
                <div key={i} className="px-4 py-3 grid grid-cols-[1fr_60px_60px_60px_80px] gap-2 items-center text-[12px]">
                  <code className="font-mono text-muted-foreground truncate">{r.sourceIp}</code>
                  <span className="text-foreground font-medium text-center tabular-nums">{r.count}</span>
                  <span className="flex items-center justify-center">{r.spf === "pass" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}</span>
                  <span className="flex items-center justify-center">{r.dkim === "pass" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}</span>
                  <span className={`text-center font-medium ${r.disposition === "none" ? "text-muted-foreground" : r.disposition === "reject" ? "text-red-400" : "text-yellow-400"}`}>{r.disposition}</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 bg-muted/30 border-t border-border grid grid-cols-[1fr_60px_60px_60px_80px] gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              <span>Source IP</span>
              <span className="text-center">Count</span>
              <span className="text-center">SPF</span>
              <span className="text-center">DKIM</span>
              <span className="text-center">Action</span>
            </div>
          </div>

          {/* Reset */}
          <button onClick={() => setReport(null)} className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            <FileText className="w-3.5 h-3.5" /> Upload different report
          </button>
        </div>
      )}

      {/* SEO Content */}
      <section className="border-t border-border pt-8 mt-10 space-y-6">
        <h2 className="text-[20px] font-bold text-foreground">How to Read and Analyze DMARC Aggregate Reports</h2>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          DMARC aggregate reports are XML files sent daily by email providers (like Google, Microsoft, Yahoo) to the address specified in your DMARC record&apos;s rua tag. Each report covers a 24-hour window and contains authentication results for every email received claiming to be from your domain. The data includes source IP addresses, message counts, SPF and DKIM pass/fail status, and what action was taken based on your DMARC policy.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          Reading raw XML reports is impractical at scale — a single domain sending 1,000 emails daily might receive 20+ separate report files. Our DMARC report analyzer parses the XML structure, extracts the key data points, and presents them visually. The pass rate metric shows what percentage of emails successfully authenticated via both SPF and DKIM. The source IP breakdown reveals which servers are sending email as your domain — both legitimate services you recognize and potentially unauthorized sources.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.8]">
          When analyzing reports, focus on failing source IPs. If they&apos;re IPs you recognize (like a CRM or marketing tool), you need to authorize them in your SPF record or configure DKIM signing. If they&apos;re unknown IPs, someone may be attempting to spoof your domain — which is exactly what DMARC enforcement is designed to block. Use this data to make informed decisions about when to tighten your DMARC policy from &quot;none&quot; to &quot;quarantine&quot; or &quot;reject&quot;.
        </p>

        <h2 className="text-[18px] font-bold text-foreground mt-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Where do I find my DMARC aggregate reports?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Reports arrive at the email address specified in your DMARC record&apos;s rua tag (e.g., rua=mailto:dmarc@yourdomain.com). They typically come as .xml.gz compressed attachments from addresses like noreply-dmarc-support@google.com. Check this mailbox daily — reports start arriving within 24-48 hours of publishing your DMARC record.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">What does a &quot;disposition: none&quot; mean in the report?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Disposition &quot;none&quot; means the receiving server delivered the email normally, even if authentication failed. This happens when your DMARC policy is p=none (monitoring mode). &quot;Quarantine&quot; means it went to spam, and &quot;reject&quot; means it was blocked entirely.</p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">How do I identify unauthorized senders in my DMARC report?</h3>
            <p className="text-[13px] text-muted-foreground leading-[1.7] mt-1">Look for source IPs that fail both SPF and DKIM and that you don&apos;t recognize. Cross-reference the IPs with your authorized services. Legitimate senders you forgot to authorize (like a helpdesk tool or newsletter platform) should be added to your SPF record. Unknown IPs sending high volumes are likely spoofers — move to p=reject to block them.</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-[14px] font-semibold text-foreground mb-2">Related Tools</h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/tools/dmarc-checker" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DMARC Checker</Link>
            <Link href="/tools/dmarc-generator" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DMARC Generator</Link>
            <Link href="/tools/dns-audit" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">DNS Authentication Checker</Link>
            <Link href="/tools/domain-scanner" className="text-[12px] text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-blue-500/5 rounded-md">Domain Scanner</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
