import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDbPath = path.join(__dirname, "dev.db");

const rawDatabaseUrl = process.env.DATABASE_URL;

if (rawDatabaseUrl?.startsWith("file:")) {
  const filePath = rawDatabaseUrl.slice("file:".length);
  const resolvedDbPath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
  process.env.DATABASE_URL = pathToFileURL(resolvedDbPath).href;
} else if (!rawDatabaseUrl) {
  process.env.DATABASE_URL = pathToFileURL(defaultDbPath).href;
}

console.log("Prisma DATABASE_URL:", process.env.DATABASE_URL);

export const prisma = new PrismaClient();



