import { prisma } from "../db/prisma";
// import { generateCode } from "../utils/code-generator";
import { generateCode } from "../utils/code-generator";
import { validateUrl, validateAlias } from "../utils/url-validator";
import {
  ConflictError,
  GoneError,
  NotFoundError,
  ValidationError,
} from "../errors/app.error";

const MAX_CODE_RETRIES = 5;

export interface CreateLinkInput {
  url: string;
  alias?: string;
  expiresAt?: Date;
}

interface LinkRecord {
  code: string;
  longUrl: string;
  createdAt: Date;
  expiresAt: Date | null;
  clickCount: bigint;
}

// Prisma returns BigInt, which JSON.stringify can't handle,
// so convert to a plain object before sending it out.
function toDto(link: LinkRecord) {
  return {
    code: link.code,
    longUrl: link.longUrl,
    createdAt: link.createdAt,
    expiresAt: link.expiresAt,
    clickCount: Number(link.clickCount),
  };
}

function hasPrismaCode(err: unknown, code: string): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === code
  );
}

// P2002 = unique constraint violation
const isUniqueViolation = (err: unknown) => hasPrismaCode(err, "P2002");
// P2025 = record not found (update/delete)
const isNotFound = (err: unknown) => hasPrismaCode(err, "P2025");

export async function createLink({ url, alias, expiresAt }: CreateLinkInput) {
  const longUrl = validateUrl(url);

  if (expiresAt && expiresAt.getTime() <= Date.now()) {
    throw new ValidationError("expiresAt must be in the future");
  }

  // Custom alias: one attempt, a clash means 409
  if (alias) {
    validateAlias(alias);
    try {
      const link = await prisma.link.create({
        data: { code: alias, longUrl, expiresAt },
      });
      return toDto(link);
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictError("Alias already in use");
      throw err;
    }
  }

  // Random code: retry on collision. The unique constraint in the DB is the
  // source of truth, so we never "check then insert" (that has a race condition).
  for (let attempt = 0; attempt < MAX_CODE_RETRIES; attempt++) {
    try {
      const link = await prisma.link.create({
        data: { code: generateCode(), longUrl, expiresAt },
      });
      return toDto(link);
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
      // collision: loop and try a new code
    }
  }

  throw new Error("Could not generate a unique code, please try again");
}

export async function getLink(code: string) {
  const link = await prisma.link.findUnique({ where: { code } });
  if (!link) throw new NotFoundError("Link not found");
  return toDto(link);
}

// Used by the redirect route: returns the destination URL and counts the click.
export async function resolveLink(code: string): Promise<string> {
  const link = await prisma.link.findUnique({ where: { code } });
  if (!link) throw new NotFoundError("Link not found");

  if (link.expiresAt && link.expiresAt.getTime() <= Date.now()) {
    throw new GoneError("Link has expired");
  }

  // Atomic increment, safe under concurrent clicks.
  // Not awaited so it doesn't slow down the redirect (errors are just logged).
  prisma.link
    .update({ where: { code }, data: { clickCount: { increment: 1 } } })
    .catch((err: unknown) => console.error("Failed to record click", err));

  return link.longUrl;
}

export async function deleteLink(code: string) {
  try {
    await prisma.link.delete({ where: { code } });
  } catch (err) {
    if (isNotFound(err)) throw new NotFoundError("Link not found");
    throw err;
  }
}