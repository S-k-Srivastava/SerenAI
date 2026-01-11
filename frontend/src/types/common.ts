export interface IPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface IPaginatedResult<T> {
    data: T[];
    pagination: IPagination;
}
