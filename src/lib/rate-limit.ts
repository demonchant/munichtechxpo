type RateEntry = {
  count: number;
  resetAt: number;
};

type RateResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

const globalStore = globalThis as typeof globalThis & {
  researchBridgeRateStore?: Map<string, RateEntry>;
};

const store = globalStore.researchBridgeRateStore ?? new Map<string, RateEntry>();
globalStore.researchBridgeRateStore = store;

function clientAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

export function checkRateLimit(
  request: Request,
  bucket: string,
  limit: number,
  windowMs: number,
): RateResult {
  const now = Date.now();
  const key = `${bucket}:${clientAddress(request)}`;
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;

  if (store.size > 1000) {
    for (const [storedKey, value] of store) {
      if (value.resetAt <= now) store.delete(storedKey);
    }
  }

  return { allowed: true, remaining: limit - current.count, resetAt: current.resetAt };
}

export function rateLimitResponse(resetAt: number) {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return Response.json(
    { error: "Too many requests. Please wait before trying again." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Remaining": "0",
        "Cache-Control": "no-store",
      },
    },
  );
}
