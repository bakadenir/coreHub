import { supabase } from './supabaseClient';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

class ApiClient {
    private baseUrl: string;
    private defaultTimeout: number;

    constructor(baseUrl: string, timeout = 15000) {
        this.baseUrl = baseUrl;
        this.defaultTimeout = timeout; // 15 seconds default timeout
    }

    private async getAuthHeaders(): Promise<Record<string, string>> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Get current session and add Bearer token if exists
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        return headers;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        timeout?: number
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout || this.defaultTimeout);

        const authHeaders = await this.getAuthHeaders();

        const config: RequestInit = {
            ...options,
            headers: {
                ...authHeaders,
                ...options.headers,
            },
            signal: controller.signal,
        };

        try {
            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || 'Request failed',
                    message: data.message,
                };
            }

            return data;
        } catch (error) {
            clearTimeout(timeoutId);

            // Check if request was aborted due to timeout
            if (error instanceof Error && error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'Request timeout',
                    message: 'The request took too long and was cancelled',
                };
            }

            return {
                success: false,
                error: 'Network error',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    // Generic CRUD methods
    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export const api = new ApiClient(API_BASE_URL);
export type { ApiResponse };
