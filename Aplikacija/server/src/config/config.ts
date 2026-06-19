import type { Algorithm, SignOptions } from "jsonwebtoken";

import dotenv from "dotenv";
import { z } from "zod";

type ExpiresIn = Exclude<SignOptions["expiresIn"], undefined>;

dotenv.config();

const envSchema = z.object({
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_URL: z.url(),

  DATABASE_URL: z.url(),
  DIRECT_URL: z.url(),

  FRONTEND_URL: z.url(),

  JWT_ALGO: z.enum(["HS256", "HS384", "HS512", "RS256"]).default("HS256"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_SECRET: z.string().min(32),

  NOMINATIM_URL: z.url().default("https://nominatim.openstreetmap.org/reverse"),

  UPLOAD_MAX_FILES: z.coerce.number().default(10),
  UPLOAD_MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  UPLOAD_MAX_MEDIA_PER_DESTINATION: z.coerce.number().default(10),
  UPLOAD_MAX_MEDIA_PER_REVIEW: z.coerce.number().default(10),

  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
});

const env = envSchema.parse(process.env);

const config = {
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
    url: env.CLOUDINARY_URL,
  },

  cors: {
    frontendUrl: env.FRONTEND_URL,
  },

  db: {
    url: env.DATABASE_URL,
    directUrl: env.DIRECT_URL,
  },

  geocoding: {
    nominatimUrl: env.NOMINATIM_URL,
  },

  jwt: {
    algorithm: env.JWT_ALGO as Algorithm,
    expiresIn: env.JWT_EXPIRES_IN as ExpiresIn,
    secret: env.JWT_SECRET,
  },

  server: {
    env: env.NODE_ENV,
    port: env.PORT,
  },

  upload: {
    maxFiles: env.UPLOAD_MAX_FILES,
    maxFileSizeBytes: env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024,
    maxMediaPerDestination: env.UPLOAD_MAX_MEDIA_PER_DESTINATION,
    maxMediaPerReview: env.UPLOAD_MAX_MEDIA_PER_REVIEW,
  },
};

export default config;
