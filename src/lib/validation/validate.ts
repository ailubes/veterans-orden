/**
 * Request validation utilities using Zod schemas
 *
 * Provides type-safe request validation for Next.js API routes.
 * Automatically handles validation errors and returns proper error responses.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validation result type
 */
export type ValidationResult<T> = {
  data: T | null;
  error: NextResponse | null;
};

/**
 * Validate request body against a Zod schema
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Validated data or error response
 *
 * @example
 * const { data, error } = await validateBody(request, signInSchema);
 * if (error) return error;
 * // data is now type-safe and validated
 */
export async function validateBody<T>(
  request: NextRequest | Request,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        data: null,
        error: NextResponse.json(
          {
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
              code: e.code,
            })),
          },
          { status: 400 }
        ),
      };
    }

    // Handle JSON parse errors
    return {
      data: null,
      error: NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON',
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validate query parameters against a Zod schema
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Validated data or error response
 *
 * @example
 * const { data, error } = validateQuery(request, paginationSchema);
 * if (error) return error;
 */
export function validateQuery<T>(
  request: NextRequest | Request,
  schema: ZodSchema<T>
): ValidationResult<T> {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const data = schema.parse(params);
    return { data, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        data: null,
        error: NextResponse.json(
          {
            error: 'Invalid query parameters',
            code: 'VALIDATION_ERROR',
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
              code: e.code,
            })),
          },
          { status: 400 }
        ),
      };
    }

    return {
      data: null,
      error: NextResponse.json(
        {
          error: 'Invalid query parameters',
          code: 'INVALID_QUERY',
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validate path parameters against a Zod schema
 *
 * @param params - Path parameters object
 * @param schema - Zod schema to validate against
 * @returns Validated data or error response
 *
 * @example
 * const { data, error } = validateParams(params, z.object({ id: uuidSchema }));
 * if (error) return error;
 */
export function validateParams<T>(
  params: Record<string, string | string[]>,
  schema: ZodSchema<T>
): ValidationResult<T> {
  try {
    const data = schema.parse(params);
    return { data, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        data: null,
        error: NextResponse.json(
          {
            error: 'Invalid path parameters',
            code: 'VALIDATION_ERROR',
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
              code: e.code,
            })),
          },
          { status: 400 }
        ),
      };
    }

    return {
      data: null,
      error: NextResponse.json(
        {
          error: 'Invalid path parameters',
          code: 'INVALID_PARAMS',
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validate FormData against a Zod schema
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Validated data or error response
 *
 * @example
 * const { data, error } = await validateFormData(request, uploadSchema);
 * if (error) return error;
 */
export async function validateFormData<T>(
  request: NextRequest | Request,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const formData = await request.formData();
    const object = Object.fromEntries(formData.entries());
    const data = schema.parse(object);
    return { data, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        data: null,
        error: NextResponse.json(
          {
            error: 'Invalid form data',
            code: 'VALIDATION_ERROR',
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
              code: e.code,
            })),
          },
          { status: 400 }
        ),
      };
    }

    return {
      data: null,
      error: NextResponse.json(
        {
          error: 'Invalid form data',
          code: 'INVALID_FORM_DATA',
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Helper to validate multiple sources at once
 *
 * @example
 * const validation = await validateRequest(request, {
 *   body: signInSchema,
 *   query: paginationSchema,
 * });
 * if (validation.error) return validation.error;
 * const { body, query } = validation.data;
 */
export async function validateRequest<
  TBody = unknown,
  TQuery = unknown,
  TParams = unknown
>(
  request: NextRequest | Request,
  schemas: {
    body?: ZodSchema<TBody>;
    query?: ZodSchema<TQuery>;
    params?: ZodSchema<TParams>;
  },
  params?: Record<string, string | string[]>
): Promise<
  ValidationResult<{
    body?: TBody;
    query?: TQuery;
    params?: TParams;
  }>
> {
  const result: {
    body?: TBody;
    query?: TQuery;
    params?: TParams;
  } = {};

  // Validate body
  if (schemas.body) {
    const { data, error } = await validateBody(request, schemas.body);
    if (error) return { data: null, error };
    result.body = data;
  }

  // Validate query
  if (schemas.query) {
    const { data, error } = validateQuery(request, schemas.query);
    if (error) return { data: null, error };
    result.query = data;
  }

  // Validate params
  if (schemas.params && params) {
    const { data, error } = validateParams(params, schemas.params);
    if (error) return { data: null, error };
    result.params = data;
  }

  return { data: result, error: null };
}
