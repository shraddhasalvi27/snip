import type { Request, Response } from "express";
import { createLink, getLink, deleteLink } from "../services/link.service";
import { createLinkSchema } from "../schema/link.schema";
const baseUrl = () =>
  process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

export async function createLinkHandler(req: Request, res: Response) {
  const { url, alias, expiresAt } = createLinkSchema.parse(req.body);
  const link = await createLink({ url, alias, expiresAt });
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