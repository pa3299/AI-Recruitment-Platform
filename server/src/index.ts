import { createServer } from 'http';
import { createApp } from './app';
import { config } from './config/env';
import { logger } from './utils/logger';

const app = createApp();
const server = createServer(app);
const port = config.port;

server.listen(port, () => {
  logger.info(`Server listening on http://localhost:${port}`);
});

export default server;
