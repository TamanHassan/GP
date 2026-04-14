import { defineConfig } from "prisma/config";
import * as path from "path";

export default defineConfig({
  schema: path.join(process.cwd(), "src/prisma/schema.prisma"),
});