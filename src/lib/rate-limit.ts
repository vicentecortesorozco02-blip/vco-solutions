/**
 * Minimal in-memory rate limiter.
 *
 * Deliberately not a dependency and deliberately not clever. It stops the
 * obvious case: one client hammering the contact endpoint.
 *
 * LIMITATION, read before trusting it: the counter lives in the memory of a
 * single serverless instance, so a distributed flood can multiply the limit by
 * the number of warm instances. That is an acceptable trade for a contact form
 * on a new site. When traffic justifies it, swap the body of `rateLimit()` for
 * a shared store (Vercel KV or Upstash) and keep the signature.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the caller may retry. Only meaningful when `ok` is false. */
  retryAfter: number;
}

export function rateLimit(key: string, now = Date.now()): RateLimitResult {
  // Opportunistic cleanup: the map cannot grow unbounded on a warm instance.
  if (buckets.size > 5000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  }

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }

  if (existing.count >= MAX_REQUESTS) {
    return {
      ok: false,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return { ok: true, retryAfter: 0 };
}

/** Test seam. */
export function resetRateLimit(): void {
  buckets.clear();
}
