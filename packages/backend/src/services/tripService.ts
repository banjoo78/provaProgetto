import type { Trip as PrismaTrip } from '@prisma/client';
import type { Trip, TripCreateInput, TripUpdateInput } from '@provaprogetto/shared';
import { prisma } from '../lib/prisma.js';
import { ApiError, ErrorCodes } from '../lib/errors.js';

function serializeTrip(t: PrismaTrip): Trip {
  return {
    id: t.id,
    city: t.city,
    country: t.country,
    startDate: t.startDate.toISOString(),
    endDate: t.endDate.toISOString(),
    client: t.client,
    purpose: t.purpose,
    notes: t.notes,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

export async function listTrips(): Promise<Trip[]> {
  const rows = await prisma.trip.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(serializeTrip);
}

export async function getTrip(id: number): Promise<Trip> {
  const row = await prisma.trip.findUnique({ where: { id } });
  if (!row) {
    throw new ApiError(
      ErrorCodes.TRIP_NOT_FOUND,
      404,
      `Trip ${id} not found`,
    );
  }
  return serializeTrip(row);
}

export async function createTrip(input: TripCreateInput): Promise<Trip> {
  const row = await prisma.trip.create({
    data: {
      city: input.city,
      country: input.country ?? null,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      client: input.client ?? null,
      purpose: input.purpose ?? null,
      notes: input.notes ?? null,
    },
  });
  return serializeTrip(row);
}

export async function updateTrip(
  id: number,
  input: TripUpdateInput,
): Promise<Trip> {
  const existing = await prisma.trip.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(
      ErrorCodes.TRIP_NOT_FOUND,
      404,
      `Trip ${id} not found`,
    );
  }

  const nextStart =
    input.startDate !== undefined ? new Date(input.startDate) : existing.startDate;
  const nextEnd =
    input.endDate !== undefined ? new Date(input.endDate) : existing.endDate;

  if (nextEnd < nextStart) {
    throw new ApiError(
      ErrorCodes.INVALID_DATE_RANGE,
      400,
      'endDate must be greater than or equal to startDate',
      { fieldErrors: { endDate: 'endDate must be greater than or equal to startDate' } },
    );
  }

  const data: Record<string, unknown> = {};
  if (input.city !== undefined) data.city = input.city;
  if (input.country !== undefined) data.country = input.country ?? null;
  if (input.startDate !== undefined) data.startDate = nextStart;
  if (input.endDate !== undefined) data.endDate = nextEnd;
  if (input.client !== undefined) data.client = input.client ?? null;
  if (input.purpose !== undefined) data.purpose = input.purpose ?? null;
  if (input.notes !== undefined) data.notes = input.notes ?? null;

  const row = await prisma.trip.update({
    where: { id },
    data,
  });
  return serializeTrip(row);
}

export async function deleteTrip(id: number): Promise<void> {
  const existing = await prisma.trip.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(
      ErrorCodes.TRIP_NOT_FOUND,
      404,
      `Trip ${id} not found`,
    );
  }
  await prisma.trip.delete({ where: { id } });
}
