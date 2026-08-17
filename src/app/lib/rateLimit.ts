/**
 * Industry-Standard In-Memory Sliding Window Rate Limiter.
 * Protects API route handlers against spam, DDoS, and API key exhaustion.
 */

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitTracker>();

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Check and record a request against a rate limit window.
 * @param identifier Unique key for client (e.g. IP address, User ID, or Token)
 * @param limit Maximum allowed requests per window (default: 30)
 * @param windowMs Window duration in milliseconds (default: 60000ms = 1 minute)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 30,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const tracker = rateLimitMap.get(identifier);

  if (!tracker || now > tracker.resetTime) {
    const resetTime = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetTime });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetInSeconds: Math.ceil(windowMs / 1000)
    };
  }

  if (tracker.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetInSeconds: Math.ceil((tracker.resetTime - now) / 1000)
    };
  }

  tracker.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - tracker.count,
    resetInSeconds: Math.ceil((tracker.resetTime - now) / 1000)
  };
}

// Automatic cleanup every 5 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, tracker] of rateLimitMap.entries()) {
      if (now > tracker.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 300000);
}
