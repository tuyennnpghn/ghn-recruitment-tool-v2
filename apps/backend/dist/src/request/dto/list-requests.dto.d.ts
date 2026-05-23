export declare enum RequestStatus {
    OPENING = "Opening",
    PENDING = "Pending",
    ACCEPTED_OFFER = "Accepted offer",
    DONE = "Done",
    CLOSE = "Close"
}
export declare class ListRequestsDto {
    status?: RequestStatus;
    departmentId?: string;
    recruiterId?: string;
    month?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    includeArchived?: boolean;
}
