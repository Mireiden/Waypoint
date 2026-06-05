import { defineConfig } from "prisma/config";

import config from "./src/config/config.js";

export default defineConfig({
  datasource: {
    url: config.db.url,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  schema: "prisma/schema.prisma",
});
