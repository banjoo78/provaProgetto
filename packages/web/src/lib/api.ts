import type { Trip, TripCreateInput, TripUpdateInput } from '@provaprogetto/shared';

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: {
    fieldErrors?: Record<string, string>;
    [key: string]: unknown;
  };
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly fieldErrors: Record<string, string>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code;
    this.fieldErrors = body.details?.fieldErrors ?? {};
  }
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const body = (data as { error?: ApiErrorBody })?.error ?? {
      code: 'NETWORK_ERROR',
      message: `Request failed with status ${res.status}`,
    };
    throw new ApiError(res.status, body);
  }

  return data as T;
}

export const apiClient = {
  trips: {
    list: () => fetchJson<Trip[]>('/api/trips'),
    get: (id: number) => fetchJson<Trip>(`/api/trips/${id}`),
    create: (data: TripCreateInput) =>
      fetchJson<Trip>('/api/trips', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: TripUpdateInput) =>
      fetchJson<Trip>(`/api/trips/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      fetchJson<void>(`/api/trips/${id}`, {
        method: 'DELETE',
      }),
  },
};
