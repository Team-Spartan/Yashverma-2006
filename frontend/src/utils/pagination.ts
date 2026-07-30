export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface FilterQuery {
  [key: string]: string | undefined;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function parsePagination(query: PaginationQuery) {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function buildSortObject(
  sortBy: string | undefined,
  sortOrder: 'asc' | 'desc' = 'desc',
  allowedFields: string[] = [],
): Record<string, 'asc' | 'desc'> {
  if (!sortBy || (allowedFields.length > 0 && !allowedFields.includes(sortBy))) {
    return { createdAt: 'desc' };
  }
  return { [sortBy]: sortOrder };
}

export function buildSearchFilter(search: string | undefined, fields: string[]) {
  if (!search) return {};
  return {
    OR: fields.map((field) => ({
      [field]: { contains: search, mode: 'insensitive' as const },
    })),
  };
}

export function buildPaginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
