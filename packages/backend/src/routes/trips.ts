import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { TripCreateInput, TripUpdateInput } from '@provaprogetto/shared';
import {
  createTrip,
  deleteTrip,
  getTrip,
  listTrips,
  updateTrip,
} from '../services/tripService.js';
import { ApiError, ErrorCodes } from '../lib/errors.js';

const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'id must be a positive integer')
    .transform((s) => Number(s))
    .refine((n) => Number.isInteger(n) && n > 0, {
      message: 'id must be a positive integer',
    }),
});

function parseId(raw: unknown): number {
  const parsed = idParamSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(
      ErrorCodes.INVALID_ID,
      400,
      'Path parameter "id" must be a positive integer',
    );
  }
  return parsed.data.id;
}

export async function tripsRoutes(app: FastifyInstance): Promise<void> {
  const f = app.withTypeProvider<ZodTypeProvider>();

  f.get('/', async () => {
    return listTrips();
  });

  f.get('/:id', async (req) => {
    const id = parseId(req.params);
    return getTrip(id);
  });

  f.post(
    '/',
    {
      schema: {
        body: TripCreateInput,
      },
    },
    async (req, reply) => {
      const trip = await createTrip(req.body);
      await reply.code(201).send(trip);
    },
  );

  f.patch(
    '/:id',
    {
      schema: {
        body: TripUpdateInput,
      },
    },
    async (req) => {
      const id = parseId(req.params);
      return updateTrip(id, req.body);
    },
  );

  f.delete('/:id', async (req, reply) => {
    const id = parseId(req.params);
    await deleteTrip(id);
    await reply.code(204).send();
  });
}
