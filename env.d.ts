namespace NodeJS {
  interface ProcessEnv {
    // Client-side environment variables
    NEXT_PUBLIC_POSTMARK_SERVER_TOKEN: string
    NEXT_PUBLIC_POSTMARK_FROM_EMAIL: string
    NEXT_PUBLIC_POSTMARK_INBOUND_HASH: string
    NEXT_PUBLIC_R2_ACCOUNT_ID: string
    NEXT_PUBLIC_R2_ACCESS_KEY_ID: string
    NEXT_PUBLIC_R2_SECRET_ACCESS_KEY: string
    NEXT_PUBLIC_R2_BUCKET: string
    // Server-side environment variables
    POSTMARK_SERVER_TOKEN: string
    POSTMARK_FROM_EMAIL: string
    POSTMARK_INBOUND_HASH: string
    FIREBASE_API_KEY: string
    FIREBASE_AUTH_DOMAIN: string
    FIREBASE_PROJECT_ID: string
    FIREBASE_STORAGE_BUCKET: string
    FIREBASE_MESSAGING_SENDER_ID: string
    FIREBASE_APP_ID: string
    R2_ACCOUNT_ID: string
    R2_ACCESS_KEY_ID: string
    R2_SECRET_ACCESS_KEY: string
    R2_BUCKET: string
    OPENAI_API_KEY: string
  }
}