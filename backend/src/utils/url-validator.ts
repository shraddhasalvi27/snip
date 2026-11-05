import { ValidationError } from "../errors/app.error";

const MAX_URL_LENGTH = 2048;
const ALIAS_REGEX = /^[A-Za-z0-9_-]{3,16}$/;

// Paths your own app uses; an alias must not shadow them.
const RESERVED = new Set(["api", "health", "admin", "login", "static", "favicon.ico"]);

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

export function validateUrl(input: string): string {
  if (typeof input !== "string" || input.length === 0) {
    throw new ValidationError("url is required");
  }
  if (input.length > MAX_URL_LENGTH) {
    throw new ValidationError(`url must be at most ${MAX_URL_LENGTH} characters`);
  }

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    throw new ValidationError("url is not a valid URL");
  }

  // Blocks javascript:, data:, file: and similar
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new ValidationError("Only http and https URLs are allowed");
  }

  const host = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".local")) {
    throw new ValidationError("This host is not allowed");
  }
  // Basic private-range check (extend later for full SSRF protection)
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) {
    throw new ValidationError("Private network addresses are not allowed");
  }

  return parsed.toString();
}

export function validateAlias(alias: string): void {
  if (!ALIAS_REGEX.test(alias)) {
    throw new ValidationError(
      "alias must be 3-16 characters: letters, numbers, - or _"
    );
  }
  if (RESERVED.has(alias.toLowerCase())) {
    throw new ValidationError("This alias is reserved");
  }
}