export const LOG_INDEX_RANGE = 10_000

export function isValidEmail(email: string): boolean {
  return /^[^@]+@[^@]+\.[^@]+$/.test(email)
}