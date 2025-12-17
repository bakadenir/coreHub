import { Response } from 'express';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        hasMore?: boolean;
    };
}

export function successResponse<T>(res: Response, data: T, meta?: ApiResponse['meta'], statusCode = 200) {
    const response: ApiResponse<T> = {
        success: true,
        data,
    };
    if (meta) {
        response.meta = meta;
    }
    return res.status(statusCode).json(response);
}

export function createdResponse<T>(res: Response, data: T) {
    return successResponse(res, data, undefined, 201);
}

export function errorResponse(res: Response, error: string, message?: string, statusCode = 400) {
    const response: ApiResponse = {
        success: false,
        error,
        message,
    };
    return res.status(statusCode).json(response);
}

export function notFoundResponse(res: Response, resource = 'Resource') {
    return errorResponse(res, 'Not Found', `${resource} not found`, 404);
}

export function unauthorizedResponse(res: Response, message = 'Unauthorized') {
    return errorResponse(res, 'Unauthorized', message, 401);
}

export function forbiddenResponse(res: Response, message = 'Forbidden') {
    return errorResponse(res, 'Forbidden', message, 403);
}

export function serverErrorResponse(res: Response, message = 'Internal Server Error') {
    return errorResponse(res, 'Server Error', message, 500);
}
