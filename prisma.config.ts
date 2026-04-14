import { defineConfig } from "prisma/config";
import * as path from "path";
import * as dotenv from "dotenv";
 
dotenv.config({ path: path.join(process.cwd(), ".env") });
 
export default defineConfig({
  schema: path.join(process.cwd(), "src/prisma/schema.prisma"),
});