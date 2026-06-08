import dotenv from "dotenv";
import type { Algorithm, SignOptions } from "jsonwebtoken";
import { z } from "zod";

type ExpiresIn = Exclude<SignOptions["expiresIn"], undefined>;

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.url(),

  FRONTEND_URL: z.url(),

  JWT_SECRET: z.string().min(32),
  JWT_ALGO: z.enum(["HS256", "HS384", "HS512", "RS256"]).default("HS256"),
  JWT_EXPIRES_IN: z.string().default("7d"),
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
    algorithm: env.JWT_ALGO as Algorithm,
    expiresIn: env.JWT_EXPIRES_IN as ExpiresIn,
  },
};

export default config;
