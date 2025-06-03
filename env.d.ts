namespace NodeJS {
  interface ProcessEnv {
    // Client-side environment variables
    // ----------------------------- Postmark ----------------------------------
    NEXT_PUBLIC_POSTMARK_SERVER_TOKEN: string
    NEXT_PUBLIC_POSTMARK_FROM_EMAIL: string
    NEXT_PUBLIC_POSTMARK_INBOUND_HASH: string
    // Server-side environment variables
    // ----------------------------- Postmark ----------------------------------
    POSTMARK_SERVER_TOKEN: string
    POSTMARK_FROM_EMAIL: string
    POSTMARK_INBOUND_HASH: string
    // --------------------------- Cloudflare R2 -------------------------------
    R2_ACCOUNT_ID: string
    R2_ACCESS_KEY_ID: string
    R2_SECRET_ACCESS_KEY: string
    R2_BUCKET: string
    // ----------------------------- OpenAI ------------------------------------
    OPENAI_API_KEY: string
    // ----------------------------- AWS ---------------------------------------
    AWS_REGION: string
    AWS_ACCESS_KEY_ID: string
    AWS_SECRET_ACCESS_KEY: string
    AWS_SESSION_TOKEN: string
    // ----------------------------- Crypto ------------------------------------
    NEXT_PUBLIC_SHARE_DASHBOARD_ENCRYPTION_KEY: string
    NEXT_PUBLIC_SHARE_DASHBOARD_ENCRYPTION_IV: string
    // ----------------------------- HCaptcha ----------------------------------
    NEXT_PUBLIC_HCAPTCHA_SITE_KEY: string
  }
}