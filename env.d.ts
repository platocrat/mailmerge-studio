namespace NodeJS {
  interface ProcessEnv {
    // Client-side environment variables
    // ----------------------------- Postmark ----------------------------------
    NEXT_PUBLIC_POSTMARK_SERVER_TOKEN: string
    NEXT_PUBLIC_POSTMARK_FROM_EMAIL: string
    NEXT_PUBLIC_POSTMARK_INBOUND_HASH: string
    // --------------------------- Cloudflare R2 -------------------------------
    NEXT_PUBLIC_R2_ACCOUNT_ID: string
    NEXT_PUBLIC_R2_ACCESS_KEY_ID: string
    NEXT_PUBLIC_R2_SECRET_ACCESS_KEY: string
    NEXT_PUBLIC_R2_BUCKET: string
    // ----------------------------- OpenAI ------------------------------------
    NEXT_PUBLIC_OPENAI_API_KEY: string
    // Server-side environment variables
    // ----------------------------- Postmark ----------------------------------
    POSTMARK_SERVER_TOKEN: string
    POSTMARK_FROM_EMAIL: string
    POSTMARK_INBOUND_HASH: string
    // ----------------------------- Firebase ----------------------------------
    FIREBASE_API_KEY: string
    FIREBASE_AUTH_DOMAIN: string
    FIREBASE_PROJECT_ID: string
    FIREBASE_STORAGE_BUCKET: string
    FIREBASE_MESSAGING_SENDER_ID: string
    FIREBASE_APP_ID: string
    // --------------------------- Cloudflare R2 -------------------------------
    R2_ACCOUNT_ID: string
    R2_ACCESS_KEY_ID: string
    R2_SECRET_ACCESS_KEY: string
    R2_BUCKET: string
    // ----------------------------- OpenAI ------------------------------------
    OPENAI_API_KEY: string
  }
}