/// <reference types="node" />
import { defineConfig } from "prisma/config";
import * as path from "path";

export default defineConfig({
  schema: path.join(__dirname, "src/prisma/schema.prisma"),
  datasource: {
    url: "file:" + path.join(__dirname, "src/prisma/dev.db"),
  },
});