import type { Request, Response } from "express";
import { createLink, getLink, deleteLink } from "../services/link.service";
import { ValidationError } from "../errors/app.error";

const baseUrl = () =>
  process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

// POST /api/links
// body: { url: string, alias?: string, expiresAt?: ISO date string }
export async function createLinkHandler(req: Request, res: Response) {
  const { url, alias, expiresAt } = req.body ?? {};

  if (typeof url !== "string") {
    throw new ValidationError("url is required and must be a string");
  }
  if (alias !== undefined && typeof alias !== "string") {
    throw new ValidationError("alias must be a string");
  }

  let expires: Date | undefined;
  if (expiresAt !== undefined) {
    expires = new Date(expiresAt);
    if (Number.isNaN(expires.getTime())) {
      throw new ValidationError("expiresAt must be a valid date");
    }
  }

  const link = await createLink({ url, alias, expiresAt: expires });

  res.status(201).json({ ...link, shortUrl: `${baseUrl()}/${link.code}` });
}

// GET /api/links/:code
export async function getLinkHandler(req: Request, res: Response) {
  const link = await getLink(req.params.code as string);
  res.json({ ...link, shortUrl: `${baseUrl()}/${link.code}` });
}

// DELETE /api/links/:code
export async function deleteLinkHandler(req: Request, res: Response) {
  await deleteLink(req.params.code as string);
  res.status(204).send();
}