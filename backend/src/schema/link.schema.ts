import { z } from "zod";

const MAX_URL_LENGTH = 2048;
const ALIAS_REGEX = /^[A-Za-z0-9_-]{3,16}$/;

// Paths your own app uses; an alias must not shadow them.
const RESERVED_ALIASES = new Set(["api", "health", "admin", "login", "static", "favicon.ico"]);

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]"]);
const PRIVATE_IP = /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;

const isBlockedHost = (host: string) =>
  BLOCKED_HOSTS.has(host) || host.endsWith(".local") || PRIVATE_IP.test(host);

export const urlSchema = z
  .string()
  .min(1, "url is required")
  .max(MAX_URL_LENGTH, `url must be at most ${MAX_URL_LENGTH} characters`)
  .transform((value, ctx) => {
    try {
      return new URL(value);
    } catch {
      ctx.addIssue({ code: "custom", message: "url is not a valid URL" });
      return z.NEVER;
    }
  })
  .refine((u) => ["http:", "https:"].includes(u.protocol), "Only http and https URLs are allowed")
  .refine((u) => !isBlockedHost(u.hostname.toLowerCase()), "This host is not allowed")
  .transform((u) => u.toString());

export const aliasSchema = z
  .string()
  .regex(ALIAS_REGEX, "alias must be 3-16 characters: letters, numbers, _ or -")
  .refine((a) => !RESERVED_ALIASES.has(a.toLowerCase()), "This alias is reserved");

export const createLinkSchema = z.object({
  url: urlSchema,
  alias: aliasSchema.optional(),
  expiresAt: z.coerce.date().optional(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;