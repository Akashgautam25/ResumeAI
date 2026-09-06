import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from server directory or current working directory
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  JWT_SECRET: z.string().default('resume_ai_super_secret_jwt_key_2026_xyz!'),
  JWT_REFRESH_SECRET: z.string().default('resume_ai_super_secret_refresh_jwt_key_2026_xyz!'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // AI Config
  AI_PROVIDER: z.enum(['openai', 'groq', 'custom', 'mock']).default('groq'),
  AI_API_KEY: z.string().optional().default(''),
  AI_MODEL: z.string().default('llama-3.3-70b-versatile'),
  AI_BASE_URL: z.string().optional().default(''),

  // Storage
  STORAGE_PROVIDER: z.enum(['local', 'cloudinary', 's3']).default('local'),
  STORAGE_API_KEY: z.string().optional().default(''),
  STORAGE_SECRET: z.string().optional().default(''),
  STORAGE_BUCKET: z.string().optional().default(''),

  CLIENT_URL: z.string().default('http://localhost:3000'),
  SERVER_URL: z.string().default('http://localhost:5000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
