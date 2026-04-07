import { serve } from 'bun';

import index from '../public/index.html';
import { pingDb } from './db/client';
import { authRoutes } from './routes/authRoutes';
import { gameResultRoutes } from './routes/gameResultRoutes';
import { hallOfFameRoutes } from './routes/hallOfFameRoutes';
import { telemetryRoutes } from './routes/telemetryRoutes';
import { userRoutes } from './routes/userRoutes';
import { serveProdBuild } from './serveProdBuild.ts';
import { validateEnv } from './utils/env';
import { checkMailHealth, initMail } from '@backend/mail';
import { initTelemetry, logger } from '@backend/telemetry';

initTelemetry();
initMail();

validateEnv();
await pingDb();

const isProduction = process.env.NODE_ENV === 'production';

const server = serve({
  routes: {
    '/healthcheck': {
      GET: async () => {
        const mail = await checkMailHealth();
        return Response.json({ status: 'ok', mail });
      },
    },

    ...userRoutes,
    ...authRoutes,
    ...gameResultRoutes,
    ...hallOfFameRoutes,
    ...telemetryRoutes,

    '/*': isProduction
      ? async (req) => serveProdBuild(new URL(req.url).pathname)
      : index,
  },

  development: !isProduction && {
    hmr: true,
    console: true,
  },
});

logger.info(`🚀 Server running at ${server.url}`);
