export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_SERVER_ERROR"
  | "UNKNOWN_ERROR";

export type ApiFieldErrors = Record<string, string[]>;

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedMeta = {
  pagination: PaginationMeta;
};

export type ApiSuccess<TData, TMeta = undefined> = {
  success: true;
  data: TData;
  message?: string;
  meta?: TMeta;
};

export type ApiFailure = {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    fieldErrors?: ApiFieldErrors;
  };
};

export type ApiResponse<TData, TMeta = undefined> = ApiSuccess<TData, TMeta> | ApiFailure;

export type PaginatedApiResponse<TData> = ApiResponse<TData[], PaginatedMeta>;
