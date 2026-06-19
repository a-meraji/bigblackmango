export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<Record<string, unknown>>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}
