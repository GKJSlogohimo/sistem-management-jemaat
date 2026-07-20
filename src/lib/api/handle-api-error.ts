import { apiError } from "./api-response";
import { AppError } from "./app-error";

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return apiError(error.code, error.message, {
      status: error.status,
      fieldErrors: error.fieldErrors,
    });
  }

  console.error(error);

  return apiError("INTERNAL_SERVER_ERROR", "Terjadi kesalahan pada server.", {
    status: 500,
  });
}
