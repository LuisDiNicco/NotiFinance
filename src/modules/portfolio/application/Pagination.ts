export interface PaginatedRequest {
  page: number;
  limit: number;
  sortBy?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
