import "dotenv/config"
import express from "express";
import { prisma } from "./db/prisma.js";
import { Request,Response,NextFunction } from "express";
import LinkRoutes from "./routs/link.routes";
import { redirectHandler } from "./controller/redirect.controller.js";
import cors from "cors";
// ---------- Config ----------
const PORT = Number(process.env.PORT || 3000);
const NODE_ENV = process.env.NODE_ENV || "development";
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

if (!process.env.DATABASE_URL) {
  throw new Error("Missing required environment variable: DATABASE_URL");
}

// ---------- App ----------
export const app = express();
app.use(express.json({ limit: "10kb" }));

app.use(
  cors({
    origin: "http://localhost:3000", // your Next.js frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// --- Add your routes here as you build them ---
app.use("/app/links",LinkRoutes);
app.use("/:code",redirectHandler);

// ---------- 404 + error handling (must come after all routes) ----------
app.use((_req:Request, res:Response) => {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
});
interface HttpError extends Error {
  statusCode?: number;
  code?: string;
}
// Express recognises error handlers by their 4 arguments, keep all four.
app.use((err:HttpError, _req:Request, res:Response, _next:NextFunction) => {
  // Malformed JSON body
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      error: { code: "INVALID_JSON", message: "Request body is not valid JSON" },
    });
  }

  // Errors with a statusCode (like the ones you'll throw from your logic)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: { code: err.code || "ERROR", message: err.message },
    });
  }

  // Anything else is a bug: log it, don't leak details
  console.error(err);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
  });
});

// ---------- Start + graceful shutdown ----------
const server = app.listen(PORT, () => {
  console.log(`Snip running on ${BASE_URL} (${NODE_ENV})`);
});

function shutdown(signal:string) {
  console.log(`${signal} received, shutting down...`);

  server.close(async () => {
    await prisma.$disconnect();
    console.log("Closed cleanly");
    process.exit(0);
  });

  // Force exit if something hangs
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));