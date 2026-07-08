# MailHealth Backend Implementation Plan (Cloudflare Edition)

**Domain:** mailhealth.online  
**Stack:** Cloudflare Workers + Email Routing + KV  
**Frontend:** Next.js on Vercel  
**Cost:** $0/month (free tier)  
**Goal:** Wire up real backends for the 3 remaining tools  

---

## Current State

| Tool | Status | Backend? |
|------|--------|----------|
| Spam Checker | ✅ Working | No — client-side |
| SPF & DKIM Checker | ✅ Working | No — Cloudflare DoH |
| DMARC Checker | ✅ Working | No — Cloudflare DoH |
| BIMI Checker | ✅ Working | No — Cloudflare DoH |
| Domain Scanner | ✅ Working | No — Cloudflare DoH |
| DNS Record Lookup | ✅ Working | No — Cloudflare DoH |
| SPF Generator | ✅ Working | No — client-side |
| DKIM Generator | ✅ Working | No — client-side |
| DMARC Generator | ✅ Working | No — client-side |
| DMARC Analyzer | ✅ Working | No — client-side XML parse |
| Phishing Checker | ✅ Working | No — client-side heuristics |
| Mail Tester | ⚠️ Simulated | **Yes — Cloudflare Email Worker** |
| Warmup Tracker | ⚠️ Simulated | **Yes — Cloudflare Email Worker** |
| IP Reputation | ⚠️ Simulated | **Yes — Cloudflare Worker** |

---

## What You Need From Cloudflare (Free Tier)

| Service | What it does | Free limit |
|---------|-------------|-----------|
| Email Routing | Receives emails on your domain, triggers Worker | Unlimited |
| Email Workers | Runs code when email arrives (parse headers, etc.) | 100k/day |
| Workers (HTTP) | API endpoints the frontend calls | 100k requests/day |
| KV | Key-value store for results | 1,000 writes/day, 100k reads/day |

---

## Pre-requisites (Your Setup Tasks)

Before any coding, you need to do this in Cloudflare dashboard:

1. **Add a receiving domain to Cloudflare** (e.g., `mailhealth.online` or buy a cheap second domain like `mhtest.email`)
2. **Enable Email Routing** for that domain in Cloudflare dashboard
3. **Set up catch-all rule** → route to an Email Worker
4. **Create a KV namespace** called `MAIL_RESULTS`
5. **Create a Workers project** (Wrangler CLI or dashboard)

That's ~15 minutes of clicking in the Cloudflare dashboard.

---

## Phase 1: Deploy Frontend (Day 1)

### Goal: Get the 11 working tools live for real users

**Tasks:**
1. Push frontend code to GitHub
2. Connect repo to Vercel
3. Set custom domain `mailhealth.online` in Vercel
4. Configure DNS in Cloudflare:
   - `mailhealth.online` → Vercel (CNAME or A records Vercel provides)
   - Keep Cloudflare as DNS provider (you'll need it for email routing anyway)
5. Set env var in Vercel: `NEXT_PUBLIC_API_URL=https://api.mailhealth.online`

**Deliverable:** `mailhealth.online` is live with 11 fully working tools + 3 tools showing "Coming Soon" or "(Demo)" state

---

## Phase 2: Mail Tester via Cloudflare Email Workers (Day 2-4)

### Goal: User sends real email → gets real deliverability report

**Architecture:**
```
User sends email to test-abc123@mailhealth.online
    ↓
Cloudflare Email Routing catches it (MX → Cloudflare)
    ↓
Email Worker triggers, receives full email (headers + body)
    ↓
Worker parses: Authentication-Results, Received-SPF, DKIM-Signature, body content
    ↓
Worker scores the email and writes result to KV: key = "mail:abc123"
    ↓
Frontend polls HTTP Worker: GET /api/mail-test/result?id=abc123
    ↓
HTTP Worker reads KV, returns result JSON
```

**What the Email Worker parses:**
- `Authentication-Results` header → SPF pass/fail, DKIM pass/fail, DMARC pass/fail
- `Received-SPF` header → SPF details
- Check for `List-Unsubscribe` header (bonus points)
- Check for `DKIM-Signature` header presence
- Basic content analysis:
  - Link count (too many = spammy)
  - Image-to-text ratio
  - Spam word scan (reuse client-side dictionary)
  - URL shorteners presence
  - ALL CAPS percentage

**Scoring (out of 10):**
- SPF pass: +2
- DKIM pass: +2  
- DMARC pass: +2
- Content score good: +2
- Has List-Unsubscribe: +1
- No URL shorteners: +1

**Workers needed:**
1. `email-worker` — triggered by Email Routing, parses email, writes to KV
2. `api-worker` — HTTP endpoint, reads from KV, returns results

**KV structure:**
```
Key: "mail:abc123"
Value: { score: 7.2, spf: "pass", dkim: "pass", dmarc: "fail", details: [...], timestamp: 1720000000 }
TTL: 3600 (1 hour, auto-cleanup)
```

**Frontend changes:**
- On page load: generate random ID client-side (no API call needed)
- Display email: `test-{id}@mailhealth.online`
- Poll: `GET https://api.mailhealth.online/mail-test/result?id={id}` every 3 seconds
- When result found → render report

---

## Phase 3: Warmup Tracker via Cloudflare Email Workers (Day 5-7)

### Goal: User sends to 50 addresses, sees per-address placement results

**Architecture:**
```
Same Email Worker as Phase 2, but handles batch addresses
```

**How it works:**
- Frontend generates a session ID and 50 addresses:
  - `seed-{sessionId}-01@mailhealth.online` through `seed-{sessionId}-50@mailhealth.online`
- User copies all 50 and sends their campaign
- Same Email Worker catches each email:
  - Extracts session ID and address number from recipient
  - Parses headers + content (same as Phase 2)
  - Assigns "placement" based on score + simulated strictness tier:
    - Addresses 01-20: High strictness (score must be > 8 for "inbox")
    - Addresses 21-40: Medium (score > 5 for "inbox")
    - Addresses 41-50: Low (score > 3 for "inbox")
  - Writes to KV: `warmup:{sessionId}:{addressNum}` = result JSON

**Frontend polling:**
- `GET https://api.mailhealth.online/warmup/results?session={id}`
- HTTP Worker reads all keys matching `warmup:{sessionId}:*` from KV
- Returns array of results received so far
- Frontend renders progressively as emails arrive

**KV structure:**
```
Key: "warmup:xyz789:01"  →  { placement: "inbox", provider: "Enterprise", score: 8.5 }
Key: "warmup:xyz789:02"  →  { placement: "spam", provider: "Google", score: 4.2 }
...
Key: "warmup:xyz789:meta" → { total: 50, created: 1720000000 }
TTL: 7200 (2 hours)
```

**Note:** KV writes = 50 per warmup session. At 1,000 writes/day free tier = 20 sessions/day. More than enough to start.

---

## Phase 4: IP Reputation via Cloudflare Workers (Day 8-9)

### Goal: Real blocklist lookups for any IP

**Architecture:**
```
Frontend calls: GET https://api.mailhealth.online/ip-reputation?ip=1.2.3.4
    ↓
HTTP Worker reverses IP → queries 8 blocklists via DNS-over-HTTPS
    ↓
Returns real listing status
```

**How DNSBL queries work via DoH (no port 25 needed):**
- Reverse the IP: `1.2.3.4` → `4.3.2.1`
- For each blocklist, query Cloudflare DoH:
  ```
  https://cloudflare-dns.com/dns-query?name=4.3.2.1.zen.spamhaus.org&type=A
  ```
- If response has an answer (127.0.0.x) → IP is listed
- If NXDOMAIN / no answer → IP is clean

**Blocklists to check:**
1. zen.spamhaus.org
2. b.barracudacentral.org
3. bl.spamcop.net
4. dnsbl.sorbs.net
5. cbl.abuseat.org
6. dnsbl-1.uceprotect.net
7. psbl.surriel.com
8. all.s5h.net

**All 8 queries run in parallel** (Workers support concurrent fetch).

**Reverse DNS:**
- Query PTR via DoH: `https://cloudflare-dns.com/dns-query?name=4.3.2.1.in-addr.arpa&type=PTR`

**Rate limiting:**
- Use KV to track requests per IP: `ratelimit:{clientIp}` with TTL of 60s
- Max 10 lookups/minute per client

**Frontend changes:**
- Replace `simulateReputation()` with `fetch(API_URL + "/ip-reputation?ip=" + ip)`
- Same UI, real data

---

## Phase 5: Polish & Production (Day 10-12)

### Tasks:

1. **Error handling**
   - Email Worker: gracefully handle malformed emails
   - HTTP Worker: validate input (domain format, IP format)
   - Return proper error responses with helpful messages

2. **CORS setup**
   - Allow only `mailhealth.online` and `www.mailhealth.online`
   - Block direct API access from other origins

3. **Custom domain for API**
   - Set up `api.mailhealth.online` as a Workers custom domain (free)
   - Or use `mailhealth.online/api/*` route pattern

4. **Frontend integration**
   - Add `NEXT_PUBLIC_API_URL` to Vercel env vars
   - Update Mail Tester page: remove "Simulate (Demo)" button, use real polling
   - Update Warmup Tracker page: generate real addresses, poll real API
   - Update IP Reputation page: call real API instead of local simulation

5. **Monitoring**
   - Cloudflare Workers analytics (built-in, free) — shows request count, errors, latency
   - Set up email alert if error rate spikes (Cloudflare dashboard)

6. **Cache optimization**
   - IP Reputation results: cache in KV for 1 hour (same IP = same result)
   - Prevents re-querying blocklists for popular IPs

---

## Final Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    mailhealth.online                      │
│                   (Vercel - Next.js)                      │
│                                                          │
│  11 tools → run 100% in browser (Cloudflare DoH)        │
│  3 tools  → call api.mailhealth.online                   │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudflare Workers (Free)                    │
│                                                          │
│  HTTP Worker (api.mailhealth.online)                     │
│  ├── GET /mail-test/result?id=xxx    → reads KV         │
│  ├── GET /warmup/results?session=xxx → reads KV         │
│  └── GET /ip-reputation?ip=x.x.x.x  → DoH queries      │
│                                                          │
│  Email Worker (triggered by Email Routing)               │
│  └── Parses email → writes result to KV                  │
│                                                          │
│  KV Namespace: MAIL_RESULTS                              │
│  └── Stores test results with TTL auto-cleanup           │
└─────────────────────────────────────────────────────────┘
                         ▲
                         │ Email (SMTP via Cloudflare MX)
                         │
              ┌──────────┴──────────┐
              │   User sends test   │
              │   email from their  │
              │   mail server       │
              └─────────────────────┘
```

---

## Timeline Summary

| Phase | Duration | What Ships |
|-------|----------|-----------|
| Phase 1 | 1 day | Frontend live on Vercel (11 tools working) |
| Phase 2 | 3 days | Real Mail Tester (email → report) |
| Phase 3 | 3 days | Real Warmup Tracker (50 emails → dashboard) |
| Phase 4 | 2 days | Real IP Reputation (DNSBL lookups) |
| Phase 5 | 3 days | Polish, error handling, production readiness |

**Total: ~12 days**

---

## Cost Summary

| Service | Cost |
|---------|------|
| Cloudflare (Email Routing + Workers + KV) | $0 |
| Vercel (frontend hosting) | $0 |
| Domain (mailhealth.online) | Already owned |
| **Total monthly** | **$0** |

Upgrade to Cloudflare Workers Paid ($5/month) only if you exceed 1,000 KV writes/day (= 1,000 mail tests or 20 warmup sessions/day).

---

## Your Setup Checklist (No Code)

Before I build the Workers code, you need to:

- [ ] Cloudflare account with `mailhealth.online` added as a zone
- [ ] Email Routing enabled on the domain
- [ ] Catch-all email rule created (route to Worker)
- [ ] KV namespace created (`MAIL_RESULTS`)
- [ ] Wrangler CLI installed (`npm install -g wrangler`)
- [ ] `wrangler login` authenticated
- [ ] Frontend pushed to GitHub and deployed on Vercel
- [ ] `api.mailhealth.online` subdomain created (CNAME to Workers)

Once you check these off, I write all the Worker code and you deploy with `wrangler deploy`. Done.
