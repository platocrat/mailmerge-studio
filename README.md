# MailMerge Studio

Transform your emails into beautiful, interactive dashboards — no coding required. MailMerge Studio is an accessible, low-code data visualizer driven entirely by email.

## 1. Table of Contents

- [2. Originated from ChatGPT Prompt](#2-originated-from-chatgpt-prompt)
  - [2.1. ChatGPT's Full Response](#21-chatgpts-full-response)
    - [2.1.1. Concept & Impact](#211conceptimpact)
    - [2.1.2. How We Leverage Postmark Features](#212how-we-leverage-postmark-features)
    - [2.1.3. User Experience Walk‑Through](#213-user-experience-walkthrough)
    - [2.1.4. Accessibility Highlights](#214accessibility-highlights)
    - [2.1.5. Testing Instructions (Judge‑Ready)](#215testing-instructions-judgeready)
    - [2.1.6. Implementation Notes](#216implementation-notes)
    - [2.1.7. Why It Wins](#217why-it-wins)
- [3. Features](#3-features)
- [4. Getting Started](#4-getting-started)
- [5. Project Structure](#5-project-structure)
- [6. Available Scripts](#6-available-scripts)
- [7. Testing the Application](#7-testing-the-application)
- [8. Email Commands](#8-email-commands)
- [9. Accessibility](#9-accessibility)
- [10. Technologies](#10-technologies)
- [11. License](#11-license)

## 2. Originated from ChatGPT prompt

A link to the discussion of the ChatGPT prompt can be found below:

- <https://chatgpt.com/share/68322dc2-40dc-8011-9b17-72fdb33da240>

### 2.1. ChatGPT's Full Response

Project Pitch: **MailMerge Studio – Accessible, Low-Code Data Visualizer Driven Entirely by Email**

---

#### 2.1.1. Concept & Impact

**MailMerge Studio** turns any inbox into a data pipeline: users forward structured or free‑form emails (receipts, IoT alerts, CSV/JSON attachments, etc.) to a unique address and instantly receive interactive dashboards summarizing the data in Postmark‑generated emails or a public share link. Small nonprofits, classrooms, or field‑research teams can now build live reports without logging in to a web UI or writing code—just send an email.

*Why it matters*: Many communities still rely on email as their sole digital tool. By meeting them where they already work, MailMerge Studio unlocks data‑driven insight while preserving accessibility (screen‑reader‑friendly HTML email reports; keyboard‑only navigation).

---

#### 2.1.2. How We Leverage Postmark Features

| Postmark capability                                                                     | How MailMerge Studio uses it                                                                                                |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Inbound address** (`POSTMARK_INBOUND_HASH@inbound.postmarkapp.com`) | Single inbound server for all email processing (Source: [Postmark Developer User-Guide: Sample Inbound Workflow](https://postmarkapp.com/developer/user-guide/inbound/sample-inbound-workflow))                        |
| **Inbound webhook JSON**                                                                | Parses `TextBody`, `HtmlBody`, `Attachments[]`, `Headers[]`, and spam score to feed our ETL queue (Source: [Postmark Developer Documentation: Inbound webhook](https://postmarkapp.com/developer/webhooks/inbound-webhook))     |
| **SpamAssassin headers**                                                                | Auto‑drops obvious junk; raises integrity score for judging criteria (Source: [Postmark Developer Documentation: Inbound webhook](https://postmarkapp.com/developer/webhooks/inbound-webhook))                                  |
| **MailboxHash** + webhook retry logic                                                   | Guarantees idempotent processing and easy threading of follow‑up emails (Source: [Postmark Developer User-Guide: Sample Inbound Workflow](https://postmarkapp.com/developer/user-guide/inbound/sample-inbound-workflow))                               |
| **Single server, dual streams**                                                         | One **inbound** stream for capture, one **outbound** stream for sending HTML dashboards back to users (Source: [Postmark Developer User-Guide: Configure an inbound server](https://postmarkapp.com/developer/user-guide/inbound/configure-an-inbound-server)) |

The project therefore scores highly for **"Utilization of Postmark features."**

---

#### 2.1.3. User Experience Walk‑Through

1. **Create project**

   - Visit `app.mailmerge.studio/projects/new` (or reply "NEW {ProjectName}").
   - Receive a confirmation email containing your dedicated inbound address.

2. **Send data**

   - Forward emails or send new messages/attachments (CSV, JSON, images).
   - Optionally tag the subject line with commands like `#sum revenue by month`.

3. **Processing**

   - Postmark posts the parsed JSON to `/webhooks/inbound`.
   - Our worker validates the `X-Spam-Score`, extracts structured data, stores attachments in S3, and runs lightweight aggregate queries or AI summaries.

4. **Results**

   - Within seconds users receive a responsive HTML email (dark‑mode friendly) with:

     - Key metrics cards
     - An embedded bar/line chart image (for clients that block JS)
     - A "View live dashboard" link (fully WCAG 2.1 AA).

5. **Iterate by email**

   - Reply "FILTER last 30d" or attach an updated CSV—MailMerge Studio re‑renders and replies.

---

#### 2.1.4. Accessibility Highlights

- **Email‑first workflow** means screen‑reader users never have to leave the inbox.
- All HTML emails meet contrast & heading‑order guidelines.
- Charts include alt text plus an inline table version beneath the image.
- Public dashboards use semantic HTML with ARIA landmarks and can be navigated entirely via keyboard.

---

#### 2.1.5. Testing Instructions (Judge‑Ready)

| Persona             | Credential / Steps                                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Judge**           | 1) Send any email (or attachment) to **[POSTMARK_INBOUND_HASH@inbound.postmarkapp.com](mailto:POSTMARK_INBOUND_HASH@inbound.postmarkapp.com)**.<br>2) Within \~15 s you'll receive a metrics email. |
| **Low‑vision user** | Same as above; open in high‑contrast mode to verify accessibility.                                                                                                                                |
| **Developer**       | cURL simulation:<br>`curl -X POST "https://demo.mailmerge.studio/webhooks/inbound" -H "Content-Type: application/json" -d '@sample-inbound.json'` (sample file attached in repo).                 |

No login is required; all demo data auto‑purges after 24 s.

---

#### 2.1.6. Implementation Notes

1. **Configure Postmark**

   - Create a server → enable *Inbound* stream and copy `InboundHash`.
   - Set `InboundHookUrl` to `https://demo.mailmerge.studio/webhooks/inbound`. (Source: [Postmark Developer User-Guide: Configure an inbound server](https://postmarkapp.com/developer/user-guide/inbound/configure-an-inbound-server))

2. **Security**

   - Webhook endpoint enforces Basic Auth (`POSTMARK` / env secret).
   - Signature header verification planned for production.

3. **Stack**

   - Next.js (API routes) + Prisma + SQLite (demo)
   - D3 & `@vercel/og` for server‑rendered chart images (no client JS needed).
   - AWS S3 for attachment storage; Amazon SES is *not* required thanks to Postmark outbound API.

4. **Rate & size limits** (≤ 10 MB per email; attachments filtered as per Postmark's forbidden types list). (Source: [Postmark Developer User-Guide: Sending an email with API](https://postmarkapp.com/developer/user-guide/send-email-with-api))

---

#### 2.1.7. Why It Wins

- **Creative use case** – democratizes data‑viz through the ubiquity of email.
- **Deep Postmark integration** – leverages inbound plus addressing, spam scoring, retries, dual streams, and JSON parsing.
- **Accessibility‑first** – usable entirely via email, with compliant HTML reports.
- **Clarity & testing ease** – one email to test, no setup friction.

---

**MailMerge Studio** proves you can build a fully‑featured, inclusive data product with nothing but Postmark's inbound email parsing and a bit of imagination.

## 3. Features

- **Email-Driven Data Pipeline**: Forward structured or free-form emails to generate instant dashboards
- **Interactive Visualizations**: Beautiful, accessible charts and metrics from your data
- **Attachment Processing**: Support for CSV, JSON, and image attachments
- **Command-Based Analysis**: Use email subject line commands like `#sum` or `#filter`
- **Accessibility First**: Screen-reader friendly, keyboard navigation support
- **Real-Time Updates**: Instant dashboard generation and email notifications

## 4. Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser to the provided URL

## 5. Project Structure

```
├── src/              # Source code
│   ├── app/         # Next.js app directory (pages and layouts)
│   ├── components/  # Reusable UI components
│   └── services/    # Core services (Firebase, R2, etc.)
├── public/          # Static assets
├── sample-data/     # Sample data for testing
├── bash/           # Shell scripts
└── [config files]   # Configuration files (next.config.ts, tsconfig.json, etc.)
```

## 6. Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 7. Testing the Application

1. Visit the homepage to see available projects
2. Navigate to the Webhook Simulator to test email processing
3. Try different data formats and commands
4. View generated dashboards and visualizations

## 8. Email Commands

Include these hashtags in your email subject line:

- `#csv` - Process CSV attachments
- `#json` - Process JSON data
- `#filter` - Apply data filters
- `#sum` - Calculate summaries

Example: `Weekly Sales Report #csv #sum revenue by month`

## 9. Accessibility

- Screen-reader optimized
- Keyboard navigation support
- High contrast mode
- WCAG 2.1 AA compliant
- Semantic HTML structure

## 10. Technologies

- React 18
- Vite
- TypeScript
- Tailwind CSS
- Firebase/Firestore
- Cloudflare R2
- Chart.js
- Lucide Icons

## 11. License

MIT

## Authors

[@platocrat](https://github.com/platocrat)
