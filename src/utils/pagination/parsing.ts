import { PaginationArgs } from './pagination.dto';

export function Paginate<T>(
  data: T[],
  total: number,
  pagination: PaginationArgs,
) {
  const { page, limit } = pagination;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      currentPage: page,
      itemsPerPage: limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
