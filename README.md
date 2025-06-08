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
- [11. Architecture Overview](#11-architecture-overview)
- [12. Running example scripts](#12-running-example-scripts)
- [13. Creating `iv` and `key` for `ClientCrypto` functions](#13-creating-iv-and-key-for-clientcrypto-functions) 
- [14. Koyeb](#13-koyeb)
   - [14.1. Using the Koyeb CLI](#141-using-the-koyeb-cli)
- [15. lambda-email-processor](#15-lambda-email-processor)
   - [15.1. High-Level Flow](#151-high-level-flow)
   - [15.2. Repo Structure](#152-repo-structure)
   - [15.3 Environment Variables](#153-environment-variables)
   - [15.4 Build & Deploy (zip-based)](#154-build--deploy-zip-based)
   - [15.5. Smoke Tests](#155-smoke-tests)
      - [15.5.1 Local](#1551-local)
      - [15.5.2 Lambda Console](#1552-lambda-console)
   - [15.6. Key Points & Gotchas](#156-key-points--gotchas)
   - [15.7. Todo / Ideas](#157-todo--ideas)

## 2. Originated from ChatGPT prompt and Bolt.new

Much of the MailMerge Studio project was conceived from a chat with the [Bolt.new](https://bolt.new) tool which generated a base of the project from scratch.

Many changes have been made to that base project that Bolt generated, but only after many consultations with [ChatGPT](https://chatgpt.com) and [Cursor](https://cursor.com)

A link to the discussion of the ChatGPT prompt where much of the current state of project originated from can be found below:

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
   - Cloudflare R2 for attachment storage; Amazon SES is *not* required thanks to Postmark outbound API.
   - The [lambda-email-processor](#14-lambda-email-processor) Lambda worker is responsible for ingesting inbound messages, running data extraction and analysis, and storing outputs in DynamoDB and Cloudflare R2.

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
- **Automated, Serverless Processing**: All emails and attachments are parsed and analyzed automatically by our [lambda-email-processor](#14-lambda-email-processor) worker (AWS Lambda, SQS, OpenAI, R2, DynamoDB)
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
│   └── services/    # Core services (DynamoDB, R2, etc.)
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

- **Frontend:** Next.js, React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend/Data Pipeline:**  
  - [lambda-email-processor](#14-lambda-email-processor) (AWS Lambda, Node.js 22.x)  
  - AWS SQS, DynamoDB  
  - Cloudflare R2 (attachments)  
  - OpenAI (data analysis, summary, chart gen)

## 11. Architecture Overview

```
[User Email]
     │
     ▼
[Postmark Inbound Webhook (Next.js)]
     │
     ▼
[SQS Queue: mailmerge-studio-emails]
     │
     ▼
[lambda-email-processor (AWS Lambda)]
     │
 ┌───────┬──────────┬─────────────┐
 │       │          │             │
 ▼       ▼          ▼             ▼
OpenAI  DynamoDB   R2        [Outgoing Dashboard Email]
                   (attachments, charts, summary.txt)
```

*See [lambda-email-processor](#15-lambda-email-processor) for details on the automated backend pipeline.*

## 12. Running example scripts

To run the example scripts on the command line, run the following command:

```zsh
npx ts-node -O '{"module":"commonjs"}' scripts/filename.ts
```

## 13. Creating `iv` and `key` for `ClientCrypto` functions

The `encryptCompressEncode()` and `decodeDecompressDecrypt()` functions of the `ClientCrypto` (i.e. Client-Side Crypto) class are used to encrypt a shareable ID string which is used in shareable links. To encrypt strings on the client, create an initialization vector, i.e. `iv`, and an asymmetric encryption `key`.

You will need an `iv` and `key` to encrypt the `str` argument:

1. Note that we we are generating a 128-bit key length because it results in a shorter shareable ID string that we place in a shareable URL. (You can generate a key with a 256-bit key length by using a 32-byte initialization vector, i.e. `iv`.):

   ```ts
   // 1. Set the size of the key to 16 bytes
   const bytesSize = new Uint8Array(16)
   
   // 2. Create an initialization vector of 128 bit-length
   const iv = crypto.getRandomValues(bytesSize).toString()
   console.log(`iv:`, iv)

   // 3. Generate a new asymmetric key
   const key = await crypto.subtle.generateKey(
   {
         name: 'AES-GCM',
         length: 128
   },
   true,
   ['encrypt', 'decrypt']
   )

   // 4. Export the `CryptoKey`
   const jwk = await crypto.subtle.exportKey('jwk', key)
   const serializedJwk = JSON.stringify(jwk)
   console.log(`serializedJwk:`, serializedJwk)
   ```

2. Copy the logged `iv` and `serializedJwk` values.
3. Set these values in your `.env.local` like so:

   ```zsh
   // The values below are merely an example
   NEXT_PUBLIC_SHARE_RESULTS_ENCRYPTION_KEY="{"alg":"A128GCM","ext":true,"k":"8_kB0wHsI43JNuUhoXPu5g","key_ops":["encrypt","decrypt"],"kty":"oct"}"
   NEXT_PUBLIC_SHARE_RESULTS_ENCRYPTION_IV="129,226,226,155,222,189,77,19,14,94,116,195,86,198,192,117"
   ```

4. For cloud-development, make sure to add the `NEXT_PUBLIC_SHARE_RESULTS_ENCRYPTION_KEY` and `NEXT_PUBLIC_SHARE_RESULTS_ENCRYPTION_IV` variables as GitHub Secrets to the GitHub repository or as new parameters in the AWS Parameter Store.


## 14. Koyeb

What Koyeb is (from their [company website](https://koyeb.com))...

> KOYEB IS A DEVELOPER-FRIENDLY SERVERLESS PLATFORM TO DEPLOY APPS GLOBALLY. NO-OPS, SERVERS, OR INFRASTRUCTURE MANAGEMENT.

It is a web services provider like [Fly.io](https://fly.io), but we're only using it to host our service worker.

### 14.1. Using the Koyeb CLI

**1. Create an application**

   To create a new application on the CLI, run the following command:

   ```bash
   koyeb app create application-name
   ```

**2. Deploy a service**

   To deploy a service on the CLI, run the following command:

   ```bash
   koyeb deploy application-name/service-name \
   --type worker \
   --instance-type free \
   --regions fra \
   ```

   and add any other other flags that you may need.
   
   For example, I am using a Dockerfile to build my service and using CloudAQMP in it. Thus, I added the `--archive-builder`, `--archive-docker-dockerfile`, and `env` flags to build the application from a local Dockerfile:

   ```bash
   koyeb deploy . postmark-email-worker/worker \
      --type worker \
      --instance-type free \
      --regions fra \
      --env CLOUDAMQP_URL=$CLOUDAMQP_URL \
      --archive-builder docker \
      --archive-docker-dockerfile Dockerfile
   ```

**3. Verify the service worker is consuming messages**

   ```bash
   koyeb logs worker               # live stdout/stderr
   koyeb service describe worker   # status, instance type, restarts
   ```

   You should see the Node process log something like `Connected to AMQP… Waiting for jobs`.

**4. Automatic redeploys on every git push**

   By default, any new commit to the branch you selected (here `main`) triggers:

   ```bash
   clone → docker build → push → rollout
   ```

   If you’d rather pin a specific tag or deploy manually, redeploy with

   ```bash
   koyeb service redeploy worker --git-ref v1.2.3
   ```

**5. Environment changes without downtime**

   ```bash
   koyeb service env set worker CLOUDAMQP_URL=amqps://user:pass@host/vhost
   ```

   Koyeb rolls a new deployment, waits for health checks to pass, then swaps traffic.

## 15. lambda-email-processor

MailMerge Studio’s backend email-to-dashboard pipeline is powered by a robust serverless worker: **`[lambda-email-processor](https://github.com/platocrat/lambda-email-processor)`**.

This Lambda function **ingests Postmark inbound-email events, processes them with OpenAI, stores artefacts in Cloudflare R2, and persists metadata to DynamoDB**. It is triggered automatically by messages arriving on an Amazon SQS queue (`mailmerge‑studio‑emails`) and runs inside AWS Lambda’s Node 22.x runtime on the free tier.

### 15.1. High-Level Flow

```
Postmark Webhook (Next.js) ─► SQS Standard queue
│
▼
AWS Lambda (emailProcessor)
│
┌─────────────────────────┴──────────────────────────┐
│                                                    │
▸ OpenAI chat/completions                        Cloudflare R2
▸ Generate summary & charts                ▸ Store original attachments
▸ Store summary.txt + charts
│
▼
DynamoDB Projects table
```

### 15.2. Repo Structure

```
.
├─ index.js                    # Lambda handler (CommonJS)
├─ node_modules/               # Node package dependencies
├─ lib/
│  ├─ constants.js             # NON‑secret config
│  └─ dynamodb.js              # DynamoDBDocumentClient factory
├─ services/
│  ├─ dataProcessing.js        # High-level orchestration
│  ├─ dynamo.js                # DynamoDB helpers
│  ├─ openai.js                # OpenAI wrapper
│  └─ r2.js                    # Cloudflare R2 wrapper
├─ utils.js                    # Logging helpers, misc
├─ sample-inbound-email.json   # Example event
├─ package.json
└─ package-lock.json
```

### 15.3. Environment Variables

Environment variables are set in **Lambda → Configuration → Environment Variables**:

| Variable                                    | Purpose                                     |
| ------------------------------------------- | ------------------------------------------- |
| `OPENAI_API_KEY`                            | Secret key for OpenAI API                   |
| `R2_ACCOUNT_ID`                             | Cloudflare R2 account ID                    |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | R2 API credentials                          |
| `R2_BUCKET_NAME`                            | Name of the R2 bucket                       |
| `AWS_REGION`                                | Auto-injected by Lambda (e.g., `us-east-1`) |

*(The Lambda execution role supplies AWS SDK credentials for DynamoDB & SQS.)*

### 15.4. Build & Deploy (zip-based)

```bash
# 1. Install dependencies
npm ci

# 2. Bundle code + node_modules
zip -r lambda-email-processor.zip \
    index.js node_modules lib/ services/ utils.js \
    package.json package-lock.json

# 3. Upload to Lambda
aws lambda update-function-code \
  --function-name emailProcessor \
  --zip-file fileb://lambda-email-processor.zip
```

You may also use the AWS console UI for deployment.

### 15.5. Smoke Tests

#### 15.5.1. Local

```bash
node -e "import('./index.js').then(m =>
  m.handler({ Records:[{ messageId:'1', body: JSON.stringify({subject:'hi', textBody:'hello'}) }] })
)"
```

#### 15.5.2 Lambda Console

* **Lambda Console** → **Test** → select SQS event template → paste:

  ```json
  {
    "Records": [{
      "messageId": "1",
      "body": "{\"subject\":\"hello\",\"textBody\":\"hi\"}"
    }]
  }
  ```

* Expect a green success banner and no `batchItemFailures`.

* Send a real email to your Postmark inbound address.

* In SQS Console, message count rises and returns to 0 when processed.

* CloudWatch Logs: Look for `emailProcessor` stream entries confirming a run.

### 15.6. Key Points & Gotchas

1. **CommonJS vs ESM:** Lambda defaults to CommonJS; either stick with `require()`/`module.exports` or add `"type":"module"` in `package.json`.
2. **Dependencies:** Always zip and upload `node_modules` with your code.
3. **Partial-Batch Response:** `index.js` returns `{ batchItemFailures: [...] }` so one bad email doesn’t poison the whole batch.
4. **Dead-letter Queue:** Use an SQS DLQ (`mailmerge‑studio‑emails‑dlq`) and set MaxReceiveCount = 5 on the main queue.
5. **Free-Tier Safe:**

   * Lambda ≤ 1M invocations/month
   * SQS ≤ 1M requests/month
   * DynamoDB charges only on actual usage

### 15.7. Todo / Ideas

* **Unit tests** for [`services/openai.js`](./services/openai.js) and [`services/r2.js`](./services/r2.js)
* **CloudFormation / SAM template** for provisioning infra in one command
* **Chunked attachment upload** for files > 5 MB

---

**The lambda-email-processor is the heart of MailMerge Studio’s automation: scalable, event-driven, and extensible for future AI-powered data processing.**

## License

MIT

## Authors

[@platocrat](https://github.com/platocrat)