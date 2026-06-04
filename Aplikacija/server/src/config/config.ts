import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.url(),

  FRONTEND_URL: z.url(),

  JWT_SECRET: z.string().min(32),
  JWT_ALGO: z.string().default("HS256"),
});

const env = envSchema.parse(process.env);

const config = {
  server: {
    env: env.NODE_ENV,
    port: env.PORT,
  },

  db: {
    url: env.DATABASE_URL,
  },

  cors: {
    frontendUrl: env.FRONTEND_URL,
  },

  jwt: {
    secret: env.JWT_SECRET,
    algorithm: env.JWT_ALGO,
  },
};

export default config;
