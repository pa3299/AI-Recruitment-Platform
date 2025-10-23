import cors from 'cors';
import { config } from '../config/env';

export const corsMiddleware = cors({
  origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map(o => o.trim()),
  credentials: true,
});
