export declare class ListCandidatesDto {
    search?: string;
    picId?: string;
    cvSourceId?: string;
    isBlacklisted?: boolean;
    includeArchived?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
