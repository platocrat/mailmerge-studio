export * from './math'
export * from './misc'
export * from './api'
export * from './demo'

export async function fetchJson<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    const errorMessage =
      (data as any).error || `Request failed with status ${response.status}`
    throw new Error(errorMessage)
  }

  return data as T
}

