import type { ApiErrorCode, ApiFieldErrors } from "./api-types";

type AppErrorOptions = {
  status: number;
  code: ApiErrorCode;
  fieldErrors?: ApiFieldErrors;
};

export class AppError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly fieldErrors?: ApiFieldErrors;

  constructor(message: string, options: AppErrorOptions) {
    super(message);

    this.name = "AppError";
    this.status = options.status;
    this.code = options.code;
    this.fieldErrors = options.fieldErrors;
  }
}
