const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

interface Bucket {
  count: number;
  firstAttempt: number;
}

const buckets = new Map<string, Bucket>();

// Cleanup expired buckets every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.firstAttempt > WINDOW_MS) buckets.delete(key);
  }
}, WINDOW_MS).unref();

export function checkRateLimit(key: string): {
  allowed: boolean;
  remaining: number;
  resetInSecs: number;
} {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket || now - bucket.firstAttempt > WINDOW_MS) {
    bucket = { count: 1, firstAttempt: now };
    buckets.set(key, bucket);
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetInSecs: Math.ceil(WINDOW_MS / 1000) };
  }

  bucket.count++;
  const resetInSecs = Math.ceil((WINDOW_MS - (now - bucket.firstAttempt)) / 1000);

  if (bucket.count > MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0, resetInSecs };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - bucket.count, resetInSecs };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}
