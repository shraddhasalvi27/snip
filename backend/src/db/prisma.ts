import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing required environment variable: DATABASE_URL");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// One shared client for the whole app
export const prisma = new PrismaClient({ adapter });