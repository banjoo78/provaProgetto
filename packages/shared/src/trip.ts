import { z } from 'zod';

const trimmedString = (max: number) => z.string().trim().min(1).max(max);

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal('').transform(() => undefined));

// ISO date string at the wire boundary; coerced to Date in the service layer
const isoDate = z.string().datetime({ offset: true });

export const TripCreateInput = z
  .object({
    city: trimmedString(120),
    country: optionalTrimmedString(120),
    startDate: isoDate,
    endDate: isoDate,
    client: optionalTrimmedString(200),
    purpose: optionalTrimmedString(500),
    notes: optionalTrimmedString(5000),
  })
  .refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
    message: 'endDate must be greater than or equal to startDate',
    path: ['endDate'],
  });

export type TripCreateInput = z.infer<typeof TripCreateInput>;

export const TripUpdateInput = z
  .object({
    city: trimmedString(120).optional(),
    country: optionalTrimmedString(120),
    startDate: isoDate.optional(),
    endDate: isoDate.optional(),
    client: optionalTrimmedString(200),
    purpose: optionalTrimmedString(500),
    notes: optionalTrimmedString(5000),
  })
  .refine(
    (d) => {
      if (d.startDate && d.endDate) {
        return new Date(d.endDate) >= new Date(d.startDate);
      }
      return true;
    },
    {
      message: 'endDate must be greater than or equal to startDate',
      path: ['endDate'],
    },
  );

export type TripUpdateInput = z.infer<typeof TripUpdateInput>;

// Response shape — dates always serialized as ISO strings
export interface Trip {
  id: number;
  city: string;
  country: string | null;
  startDate: string; // ISO 8601
  endDate: string;
  client: string | null;
  purpose: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
