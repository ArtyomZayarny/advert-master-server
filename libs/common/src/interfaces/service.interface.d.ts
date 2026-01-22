export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    statusCode?: number;
}
export interface HealthCheckResponse {
    status: 'ok' | 'error';
    service: string;
    timestamp: string;
    uptime: number;
    database?: {
        status: 'connected' | 'disconnected';
    };
}
export interface PaginationParams {
    limit?: number;
    offset?: number;
    page?: number;
}
export interface PaginatedResponse<T> {
    results: T[];
    total: number;
    limit: number;
    offset: number;
    page?: number;
}
