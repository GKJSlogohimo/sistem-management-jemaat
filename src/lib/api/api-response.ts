import type { ZodError } from "zod";

import type {
  ApiErrorCode,
  ApiFailure,
  ApiFieldErrors,
  ApiSuccess,
  PaginatedMeta,
  PaginationMeta,
} from "./api-types";

type SuccessOptions<TMeta> = {
  status?: number;
  message?: string;
  meta?: TMeta;
};

type ErrorOptions = {
  status?: number;
  fieldErrors?: ApiFieldErrors;
};

export function apiSuccess<TData, TMeta = undefined>(
  data: TData,
  options: SuccessOptions<TMeta> = {},
) {
  const { status = 200, message, meta } = options;

  const response: ApiSuccess<TData, TMeta> = {
    success: true,
    data,
    message,
    meta,
  };

  return Response.json(response, { status });
}

export function apiPaginated<TData>(data: TData[], pagination: PaginationMeta) {
  const meta: PaginatedMeta = {
    pagination,
  };

  return apiSuccess(data, { meta });
}

export function apiError(code: ApiErrorCode, message: string, options: ErrorOptions = {}) {
  const { status = 400, fieldErrors } = options;

  const response: ApiFailure = {
    success: false,
    error: {
      code,
      message,
      fieldErrors,
    },
  };

  return Response.json(response, { status });
}

export function getZodFieldErrors(error: ZodError): ApiFieldErrors {
  const fieldErrors: ApiFieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path.join(".") || "_root";

    fieldErrors[field] ??= [];
    fieldErrors[field].push(issue.message);
  }

  return fieldErrors;
}

export function apiValidationError(error: ZodError) {
  return apiError("VALIDATION_ERROR", "Data yang dikirim tidak valid.", {
    status: 422,
    fieldErrors: getZodFieldErrors(error),
  });
}
