// Shared input validation for all AI edge functions

const MAX_FIELD_LENGTH = 2000;
const MAX_TOTAL_LENGTH = 8000;

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized: Record<string, string>;
}

function sanitize(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value).trim();
  // Remove null bytes and control characters (keep newlines/tabs)
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").slice(0, MAX_FIELD_LENGTH);
}

export function validateInputs(
  body: Record<string, unknown>,
  fields: string[]
): ValidationResult {
  const sanitized: Record<string, string> = {};
  let totalLength = 0;

  for (const field of fields) {
    const clean = sanitize(body[field]);
    sanitized[field] = clean;
    totalLength += clean.length;
  }

  if (totalLength > MAX_TOTAL_LENGTH) {
    return { valid: false, error: "Input too long. Please shorten your text and try again.", sanitized };
  }

  if (totalLength === 0) {
    return { valid: false, error: "Please provide at least some input.", sanitized };
  }

  return { valid: true, sanitized };
}

// Simple per-IP in-memory rate limiter (resets when function cold-starts)
const ipCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // requests per window
const RATE_WINDOW_MS = 60_000; // 1 minute

export function checkRateLimit(req: Request): { allowed: boolean } {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  const now = Date.now();
  const entry = ipCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true };
  }

  entry.count++;
  if (entry.count > RATE_LIMIT) {
    return { allowed: false };
  }

  return { allowed: true };
}
