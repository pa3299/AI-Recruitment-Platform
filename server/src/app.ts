import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import aiRoutes from './routes/ai.routes';
import businessRoutes from './routes/business.routes';
import candidatesRoutes from './routes/candidates.routes';
import { corsMiddleware } from './middleware/cors';
import { requestLogger } from './middleware/logger';
import { errorHandler, notFound } from './middleware/error';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(corsMiddleware);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(compression());
  app.use(morgan('dev'));
  app.use(requestLogger);

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/ai', aiRoutes);
  app.use('/api', businessRoutes);
  app.use('/api', candidatesRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
