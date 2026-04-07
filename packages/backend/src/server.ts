import Fastify from 'fastify';
import cors from '@fastify/cors';

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: ['http://localhost:5173'],
  credentials: true,
});

app.get('/health', async () => ({ ok: true }));

// TODO(S001): register Trip routes plugin from ./routes/trips.ts
// TODO(S001): register global error handler from ./lib/errors.ts

const port = Number(process.env.PORT ?? 3000);
const host = '127.0.0.1';

try {
  await app.listen({ port, host });
  app.log.info(`provaProgetto backend running on http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
