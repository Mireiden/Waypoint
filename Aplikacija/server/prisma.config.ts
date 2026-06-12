import { defineConfig } from "prisma/config";

import config from "./src/config/config.js";

export default defineConfig({
  datasource: {
    //prisma needs a direct (non-pooled) connection to the database
    url: config.db.directUrl,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  schema: "prisma/schema.prisma",
  typedSql: {
    path: "./prisma/sql",
  },
});
