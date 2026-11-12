/**
 * Shared HTTP client for backend communication.
 *
 * Key principle: backend errors (5xx, 429, timeout, network) are NOT 404s.
 * Converting them to notFound() causes Next.js/ISR to cache a 404 page
 * for content that exists. Googlebot crawling in parallel gets bursts
 * of false 404s and de-indexes pages.
 *
 * - HttpError.status === 404 → resource truly doesn't exist → notFound()
 * - any other error → propagates: non-cached 500 (Google retries)
 *                       and during ISR revalidation, previous version stays.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(status: number, message: string, url: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.url = url;
  }
}

export function isNotFoundError(err: unknown): boolean {
  return err instanceof HttpError && err.status === 404;
}

/**
 * Backend non raggiungibile: rete assente, DNS, connessione rifiutata o timeout.
 * In questi casi l'app degrada a contenuti vuoti invece di mostrare una pagina
 * d'errore: la home resta visitabile e il backend può tornare su in qualsiasi momento.
 */
export function isBackendUnavailable(err: unknown): boolean {
  return err instanceof HttpError && err.status === 0;
}

/**
 * Errori per cui ha senso servire contenuti vuoti invece di far fallire il render:
 * risorsa assente (404) o backend non raggiungibile.
 */
export function isDegradableError(err: unknown): boolean {
  return isNotFoundError(err) || isBackendUnavailable(err);
}

export function isRetryableError(err: unknown): boolean {
  if (err instanceof HttpError) {
    return RETRYABLE_STATUSES.has(err.status);
  }
  return true; // network errors are retryable
}

const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;
const TIMEOUT_MS = 10000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface BackendFetchOptions extends RequestInit {
  timeout?: number;
  maxAttempts?: number;
}

/**
 * fetch with timeout and retry (exponential backoff) on transient errors.
 * Throws HttpError for any non-ok response or network error.
 */
export async function backendFetch(
  url: string,
  options: BackendFetchOptions = {}
): Promise<Response> {
  const { timeout = TIMEOUT_MS, maxAttempts = MAX_ATTEMPTS, ...init } = options;
  let lastError: HttpError | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) return response;

      lastError = new HttpError(
        response.status,
        `HTTP error! status: ${response.status} - ${url}`,
        url
      );

      if (!RETRYABLE_STATUSES.has(response.status)) {
        throw lastError;
      }
    } catch (err) {
      if (err instanceof HttpError && !RETRYABLE_STATUSES.has(err.status)) {
        throw err;
      }
      if (!(err instanceof HttpError)) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          lastError = new HttpError(0, `Request timeout - ${url}`, url);
        } else {
          lastError = new HttpError(0, `Backend unreachable - ${url}: ${(err as Error).message}`, url);
        }
      }
    }

    if (attempt < maxAttempts) {
      await sleep(300 * 2 ** (attempt - 1));
    }
  }

  throw lastError ?? new HttpError(0, `Backend unreachable after ${maxAttempts} attempts - ${url}`, url);
}

/**
 * Convenience wrapper that parses JSON and handles 404 as null.
 * Use for endpoints where 404 is a valid "not found" response.
 */
export async function backendFetchJson<T>(
  url: string,
  options: BackendFetchOptions = {}
): Promise<T | null> {
  try {
    const response = await backendFetch(url, options);
    return (await response.json()) as T;
  } catch (err) {
    if (isNotFoundError(err)) return null;
    throw err;
  }
}

/**
 * Build query string from object, skipping undefined/null values.
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.set(key, String(value));
      }
    }
  }
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}