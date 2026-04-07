import Fastify from 'fastify';
import cors from '@fastify/cors';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { tripsRoutes } from './routes/trips.js';
import { fastifyErrorHandler } from './lib/errors.js';

export async function buildApp() {
  const app = Fastify({
    logger:
      process.env.NODE_ENV === 'test'
        ? false
        : { level: process.env.LOG_LEVEL ?? 'info' },
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler(fastifyErrorHandler);

  await app.register(cors, {
    origin: ['http://localhost:5173'],
    credentials: true,
  });

  app.get('/health', async () => ({ ok: true }));

  await app.register(tripsRoutes, { prefix: '/api/trips' });

  return app;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const app = await buildApp();
  const port = Number(process.env.PORT ?? 3000);
  const host = '127.0.0.1';
  try {
    await app.listen({ port, host });
    app.log.info(`provaProgetto backend running on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}
