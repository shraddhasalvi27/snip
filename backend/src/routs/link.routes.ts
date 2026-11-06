import { Router } from "express";
// import type { NextFunction, Request, RequestHandler, Response } from "express";

import { createLinkHandler,getLinkHandler,
  deleteLinkHandler, } from "../controller/link.controller";

// Express 4 doesn't catch errors from async handlers. This wrapper forwards
// them to the error-handling middleware (harmless on Express 5 too).
// const asyncHandler =
//   (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
//   (req, res, next) => {
//     fn(req, res, next).catch(next);
//   };

const router = Router();
  
// Mounted at /api/links in server.ts
router.post("/", createLinkHandler);        // POST   /api/links
router.get("/:code",getLinkHandler);       // GET    /api/links/:code
router.delete("/:code", deleteLinkHandler); // DELETE /api/links/:code

export default router;