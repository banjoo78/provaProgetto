import { describe, it, expect } from 'vitest';
import {
  createTrip,
  deleteTrip,
  getTrip,
  listTrips,
  updateTrip,
} from '../src/services/tripService.js';
import { ApiError, ErrorCodes } from '../src/lib/errors.js';

const validInput = {
  city: 'Milano',
  country: 'Italia',
  startDate: '2026-04-10T00:00:00.000Z',
  endDate: '2026-04-12T00:00:00.000Z',
  client: 'Acme SpA',
  purpose: 'Workshop',
  notes: 'Hotel near Duomo',
};

describe('tripService', () => {
  it('creates a trip and returns ISO-string dates', async () => {
    const trip = await createTrip(validInput);
    expect(trip.id).toBeGreaterThan(0);
    expect(trip.city).toBe('Milano');
    expect(trip.startDate).toBe('2026-04-10T00:00:00.000Z');
    expect(trip.endDate).toBe('2026-04-12T00:00:00.000Z');
    expect(typeof trip.createdAt).toBe('string');
    expect(typeof trip.updatedAt).toBe('string');
  });

  it('lists trips ordered by createdAt desc', async () => {
    const a = await createTrip({ ...validInput, city: 'Roma' });
    // Ensure deterministic ordering even when timestamps collide on the same ms
    await new Promise((r) => setTimeout(r, 5));
    const b = await createTrip({ ...validInput, city: 'Torino' });
    const trips = await listTrips();
    expect(trips).toHaveLength(2);
    expect(trips[0]!.id).toBe(b.id);
    expect(trips[1]!.id).toBe(a.id);
  });

  it('throws TRIP_NOT_FOUND on getTrip with unknown id', async () => {
    await expect(getTrip(9999)).rejects.toMatchObject({
      code: ErrorCodes.TRIP_NOT_FOUND,
      statusCode: 404,
    });
  });

  it('updates a trip and returns the new state', async () => {
    const created = await createTrip(validInput);
    const updated = await updateTrip(created.id, { city: 'Bologna' });
    expect(updated.city).toBe('Bologna');
    expect(updated.id).toBe(created.id);
  });

  it('rejects update that violates date range against merged state', async () => {
    const created = await createTrip(validInput);
    // Patch only endDate to a value before existing startDate
    await expect(
      updateTrip(created.id, { endDate: '2026-04-01T00:00:00.000Z' }),
    ).rejects.toMatchObject({
      code: ErrorCodes.INVALID_DATE_RANGE,
      statusCode: 400,
    });
  });

  it('throws TRIP_NOT_FOUND on updateTrip with unknown id', async () => {
    await expect(
      updateTrip(9999, { city: 'Nope' }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('throws TRIP_NOT_FOUND on deleteTrip with unknown id', async () => {
    await expect(deleteTrip(9999)).rejects.toMatchObject({
      code: ErrorCodes.TRIP_NOT_FOUND,
    });
  });

  it('deletes an existing trip', async () => {
    const created = await createTrip(validInput);
    await deleteTrip(created.id);
    await expect(getTrip(created.id)).rejects.toMatchObject({
      code: ErrorCodes.TRIP_NOT_FOUND,
    });
  });
});
