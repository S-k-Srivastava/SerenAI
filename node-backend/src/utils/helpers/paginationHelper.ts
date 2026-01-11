/**
 * Common Pagination Response Model
 * Provides a standardized format for paginated API responses
 */

export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}

/**
 * Creates a standardized paginated response
 * @param data - Array of items for the current page
 * @param total - Total number of items across all pages
 * @param page - Current page number (1-indexed)
 * @param limit - Number of items per page
 * @returns Paginated response object
 */
export function createPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.max(1, Math.min(page, totalPages || 1));

    return {
        data,
        pagination: {
            currentPage,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1,
        },
    };
}

/**
 * Calculates skip value for MongoDB queries
 * @param page - Current page number (1-indexed)
 * @param limit - Number of items per page
 * @returns Number of items to skip
 */
export function calculateSkip(page: number, limit: number): number {
    return (Math.max(1, page) - 1) * limit;
}

/**
 * Validates and parses pagination parameters from request query
 * @param page - Page number from request
 * @param limit - Limit from request
 * @param defaultLimit - Default limit if not provided
 * @param maxLimit - Maximum allowed limit
 * @returns Validated page and limit values
 */
export function parsePaginationParams(
    page?: string | number,
    limit?: string | number,
    defaultLimit: number = 10,
    maxLimit: number = 100
): { page: number; limit: number } {
    const parsedPage = Math.max(1, parseInt(String(page || 1)));
    const parsedLimit = Math.min(
        maxLimit,
        Math.max(1, parseInt(String(limit || defaultLimit)))
    );

    return {
        page: parsedPage,
        limit: parsedLimit,
    };
}
