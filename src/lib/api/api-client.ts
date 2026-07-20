import type { ApiErrorCode, ApiFieldErrors, ApiResponse, ApiSuccess } from "./api-types";

type ApiClientErrorOptions = {
  status: number;
  code: ApiErrorCode;
  fieldErrors?: ApiFieldErrors;
};

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly fieldErrors?: ApiFieldErrors;

  constructor(message: string, options: ApiClientErrorOptions) {
    super(message);

    this.name = "ApiClientError";
    this.status = options.status;
    this.code = options.code;
    this.fieldErrors = options.fieldErrors;
  }
}

export async function apiFetch<TData, TMeta = undefined>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<ApiSuccess<TData, TMeta>> {
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  const payload = (await response.json().catch(() => null)) as ApiResponse<TData, TMeta> | null;

  if (!payload) {
    throw new ApiClientError("Server mengembalikan response yang tidak valid.", {
      status: response.status,
      code: "UNKNOWN_ERROR",
    });
  }

  if (!response.ok || !payload.success) {
    const error = payload.success ? undefined : payload.error;

    throw new ApiClientError(error?.message ?? "Terjadi kesalahan pada server.", {
      status: response.status,
      code: error?.code ?? "UNKNOWN_ERROR",
      fieldErrors: error?.fieldErrors,
    });
  }

  return payload;
}
