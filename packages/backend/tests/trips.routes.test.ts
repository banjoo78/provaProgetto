import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/server.js';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

const validBody = {
  city: 'Milano',
  country: 'Italia',
  startDate: '2026-04-10T00:00:00.000Z',
  endDate: '2026-04-12T00:00:00.000Z',
  client: 'Acme SpA',
  purpose: 'Workshop',
  notes: 'Hotel near Duomo',
};

async function createOne(overrides: Partial<typeof validBody> = {}) {
  const res = await app.inject({
    method: 'POST',
    url: '/api/trips',
    payload: { ...validBody, ...overrides },
  });
  return res;
}

describe('GET /api/trips', () => {
  it('returns empty array when no trips exist', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/trips' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it('returns created trips', async () => {
    await createOne({ city: 'Roma' });
    await createOne({ city: 'Torino' });
    const res = await app.inject({ method: 'GET', url: '/api/trips' });
    expect(res.statusCode).toBe(200);
    const data = res.json();
    expect(data).toHaveLength(2);
  });
});

describe('POST /api/trips', () => {
  it('creates a trip with 201', async () => {
    const res = await createOne();
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.id).toBeGreaterThan(0);
    expect(body.city).toBe('Milano');
  });

  it('returns 400 VALIDATION_ERROR on missing city', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/trips',
      payload: { ...validBody, city: '' },
    });
    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details?.fieldErrors?.city).toBeDefined();
  });

  it('returns 400 VALIDATION_ERROR when endDate < startDate', async () => {
    const res = await createOne({
      startDate: '2026-04-15T00:00:00.000Z',
      endDate: '2026-04-10T00:00:00.000Z',
    });
    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details?.fieldErrors?.endDate).toBeDefined();
  });
});

describe('GET /api/trips/:id', () => {
  it('returns 200 with trip', async () => {
    const created = (await createOne()).json();
    const res = await app.inject({ method: 'GET', url: `/api/trips/${created.id}` });
    expect(res.statusCode).toBe(200);
    expect(res.json().id).toBe(created.id);
  });

  it('returns 404 TRIP_NOT_FOUND', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/trips/99999' });
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe('TRIP_NOT_FOUND');
  });

  it('returns 400 INVALID_ID on non-numeric id', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/trips/abc' });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('INVALID_ID');
  });
});

describe('PATCH /api/trips/:id', () => {
  it('updates fields and returns 200', async () => {
    const created = (await createOne()).json();
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/trips/${created.id}`,
      payload: { city: 'Bologna' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().city).toBe('Bologna');
  });

  it('returns 404 on unknown id', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/trips/99999',
      payload: { city: 'Nope' },
    });
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe('TRIP_NOT_FOUND');
  });

  it('returns 400 INVALID_DATE_RANGE when patch creates invalid range', async () => {
    const created = (await createOne()).json();
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/trips/${created.id}`,
      payload: { endDate: '2026-04-01T00:00:00.000Z' },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('INVALID_DATE_RANGE');
  });
});

describe('DELETE /api/trips/:id', () => {
  it('returns 204 on success', async () => {
    const created = (await createOne()).json();
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/trips/${created.id}`,
    });
    expect(res.statusCode).toBe(204);
    expect(res.body).toBe('');
  });

  it('returns 404 on unknown id', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/trips/99999',
    });
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe('TRIP_NOT_FOUND');
  });
});

describe('GET /health', () => {
  it('returns ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });
  });
});
