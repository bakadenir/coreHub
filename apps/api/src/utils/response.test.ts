import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
import {
    successResponse,
    createdResponse,
    errorResponse,
    notFoundResponse,
    unauthorizedResponse,
    forbiddenResponse,
    serverErrorResponse,
} from './response';

// Mock Express Response
const createMockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };
    return res;
};

describe('Response Utilities', () => {
    let mockRes: Partial<Response>;

    beforeEach(() => {
        mockRes = createMockResponse();
    });

    describe('successResponse', () => {
        it('returns 200 status by default', () => {
            successResponse(mockRes as Response, { id: 1, name: 'Test' });

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: { id: 1, name: 'Test' },
            });
        });

        it('returns custom status code when provided', () => {
            successResponse(mockRes as Response, { message: 'OK' }, undefined, 202);

            expect(mockRes.status).toHaveBeenCalledWith(202);
        });

        it('includes meta when provided', () => {
            const meta = { page: 1, limit: 10, total: 100 };
            successResponse(mockRes as Response, [1, 2, 3], meta);

            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: [1, 2, 3],
                meta: { page: 1, limit: 10, total: 100 },
            });
        });

        it('handles null data', () => {
            successResponse(mockRes as Response, null);

            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: null,
            });
        });

        it('handles empty array', () => {
            successResponse(mockRes as Response, []);

            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: [],
            });
        });
    });

    describe('createdResponse', () => {
        it('returns 201 status', () => {
            createdResponse(mockRes as Response, { id: 'new-id' });

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: { id: 'new-id' },
            });
        });
    });

    describe('errorResponse', () => {
        it('returns 400 status by default', () => {
            errorResponse(mockRes as Response, 'Validation Error');

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Validation Error',
                message: undefined,
            });
        });

        it('returns custom status code', () => {
            errorResponse(mockRes as Response, 'Custom Error', 'Details', 422);

            expect(mockRes.status).toHaveBeenCalledWith(422);
        });

        it('includes message when provided', () => {
            errorResponse(mockRes as Response, 'Error', 'Something went wrong');

            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Error',
                message: 'Something went wrong',
            });
        });
    });

    describe('notFoundResponse', () => {
        it('returns 404 status', () => {
            notFoundResponse(mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });

        it('uses default resource name', () => {
            notFoundResponse(mockRes as Response);

            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Not Found',
                message: 'Resource not found',
            });
        });

        it('uses custom resource name', () => {
            notFoundResponse(mockRes as Response, 'User');

            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Not Found',
                message: 'User not found',
            });
        });
    });

    describe('unauthorizedResponse', () => {
        it('returns 401 status', () => {
            unauthorizedResponse(mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(401);
        });

        it('uses default message', () => {
            unauthorizedResponse(mockRes as Response);

            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Unauthorized',
                message: 'Unauthorized',
            });
        });

        it('uses custom message', () => {
            unauthorizedResponse(mockRes as Response, 'Invalid token');

            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Unauthorized',
                message: 'Invalid token',
            });
        });
    });

    describe('forbiddenResponse', () => {
        it('returns 403 status', () => {
            forbiddenResponse(mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(403);
        });

        it('uses default message', () => {
            forbiddenResponse(mockRes as Response);

            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Forbidden',
                message: 'Forbidden',
            });
        });

        it('uses custom message', () => {
            forbiddenResponse(mockRes as Response, 'Admin access required');

            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Forbidden',
                message: 'Admin access required',
            });
        });
    });

    describe('serverErrorResponse', () => {
        it('returns 500 status', () => {
            serverErrorResponse(mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(500);
        });

        it('uses default message', () => {
            serverErrorResponse(mockRes as Response);

            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Server Error',
                message: 'Internal Server Error',
            });
        });

        it('uses custom message', () => {
            serverErrorResponse(mockRes as Response, 'Database connection failed');

            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Server Error',
                message: 'Database connection failed',
            });
        });
    });
});
