import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_ID: 'INVALID_ID',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  TRIP_NOT_FOUND: 'TRIP_NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export interface ErrorEnvelope {
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export class ApiError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    statusCode: number,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

function zodToFieldErrors(err: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.errors) {
    const path = issue.path.length > 0 ? issue.path.join('.') : '_';
    if (!(path in fieldErrors)) {
      fieldErrors[path] = issue.message;
    }
  }
  return fieldErrors;
}

export function buildErrorResponse(err: unknown): {
  statusCode: number;
  body: ErrorEnvelope;
} {
  // ApiError — already shaped
  if (err instanceof ApiError) {
    return {
      statusCode: err.statusCode,
      body: {
        error: {
          code: err.code,
          message: err.message,
          ...(err.details ? { details: err.details } : {}),
        },
      },
    };
  }

  // Zod validation failure (raw, when not wrapped by fastify-type-provider-zod)
  if (err instanceof ZodError) {
    return {
      statusCode: 400,
      body: {
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Request validation failed',
          details: { fieldErrors: zodToFieldErrors(err) },
        },
      },
    };
  }

  // fastify-type-provider-zod wraps ZodError on a Fastify error with .validation
  const maybeFastify = err as FastifyError & { validation?: unknown; cause?: unknown };
  if (maybeFastify && maybeFastify.cause instanceof ZodError) {
    return {
      statusCode: 400,
      body: {
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Request validation failed',
          details: { fieldErrors: zodToFieldErrors(maybeFastify.cause) },
        },
      },
    };
  }
  if (maybeFastify && Array.isArray(maybeFastify.validation)) {
    const fieldErrors: Record<string, string> = {};
    for (const v of maybeFastify.validation as Array<{
      instancePath?: string;
      message?: string;
    }>) {
      const path = (v.instancePath ?? '').replace(/^\//, '').replace(/\//g, '.') || '_';
      if (!(path in fieldErrors)) fieldErrors[path] = v.message ?? 'invalid';
    }
    return {
      statusCode: 400,
      body: {
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Request validation failed',
          details: { fieldErrors },
        },
      },
    };
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      return {
        statusCode: 404,
        body: {
          error: {
            code: ErrorCodes.TRIP_NOT_FOUND,
            message: 'Resource not found',
          },
        },
      };
    }
  }

  // Unknown / unexpected — never leak internal messages to the client
  return {
    statusCode: 500,
    body: {
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Unexpected internal error',
      },
    },
  };
}

export async function fastifyErrorHandler(
  this: { log: { error: (...args: unknown[]) => void } },
  err: FastifyError,
  _req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { statusCode, body } = buildErrorResponse(err);
  if (statusCode >= 500) {
    this.log.error({ err }, 'Unhandled error');
  }
  await reply.status(statusCode).send(body);
}
