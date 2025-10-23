import dotenv from 'dotenv';
import path from 'path';

const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
// Load from server/.env* first (local dev), then fallback to root .env*
dotenv.config({ path: path.resolve(process.cwd(), 'server', envFile) });
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8080', 10),
  apiKey: process.env.API_KEY || '',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  logLevel: process.env.LOG_LEVEL || 'info',
};

if (!config.apiKey) {
  // Allow boot without API_KEY but warn; routes that need it will enforce
  // eslint-disable-next-line no-console
  console.warn('[config] API_KEY is not set. AI endpoints will be disabled.');
}
