import { Request, Response } from "express";
import { getLink } from "../services/link.service";
import { incrementClickCount } from "../services/link.service";

export async function redirectHandler(req: Request, res: Response) {
  // 1. Look up the link (should throw NotFoundError if the code doesn't exist)
  const link = await getLink(req.params.code as string);

  // 2. Reject expired links
  if (link.expiresAt && new Date(link.expiresAt).getTime() < Date.now()) {
    return res.status(410).json({
      error: { code: "EXPIRED", message: "Link has expired" },
    });
  }

  // 3. Count the click without blocking or breaking the redirect
  incrementClickCount(link.code).catch((err) => {
    console.error("Failed to increment click count:", err);
  });

  // 4. Redirect (302 so browsers don't cache it permanently)
  return res.redirect(302, link.longUrl);
}