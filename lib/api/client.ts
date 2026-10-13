import type { ApiErrorBody, ApiSuccess } from '@/types/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function parseJson(res: Response): Promise<unknown> {
  try {
    return await res.json()
  } catch {
    return null
  }
}

/**
 * Fetch a JSON endpoint. Resolves with the `{ data, meta? }` envelope on 2xx and rejects with an
 * `ApiError` carrying the backend's `code` and `message` otherwise, so callers can rely on
 * try/catch instead of inspecting the body. Pass `init.signal` to cancel.
 */
async function request<T>(path: string, init: RequestInit = {}): Promise<ApiSuccess<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
  const body = await parseJson(res)

  if (!res.ok) {
    const error = (body as Partial<ApiErrorBody> | null)?.error
    throw new ApiError(
      res.status,
      error?.code ?? 'HTTP_ERROR',
      error?.message ?? `Request failed with status ${res.status}`
    )
  }
  if (body === null || typeof body !== 'object' || !('data' in body)) {
    throw new ApiError(res.status, 'INVALID_RESPONSE', 'Unexpected response from the API')
  }
  return body as ApiSuccess<T>
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, init),
  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'POST', body: JSON.stringify(body) }),
}
