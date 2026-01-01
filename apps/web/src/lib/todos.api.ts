import { api } from './api';
import type { Todo, TodoList, TodoFilters, CreateTodoDto, UpdateTodoDto, CreateTodoListDto, UpdateTodoListDto, TodoStats } from '../types';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export const todosApi = {
    // ========== TODOS ==========

    async getAll(filters?: TodoFilters): Promise<ApiResponse<Todo[]>> {
        const params = new URLSearchParams();
        if (filters?.listId) params.append('listId', filters.listId);
        if (filters?.completed !== undefined) params.append('completed', String(filters.completed));
        if (filters?.priority) params.append('priority', filters.priority);
        if (filters?.dueDate) params.append('dueDate', filters.dueDate);
        if (filters?.search) params.append('search', filters.search);

        const query = params.toString();
        return api.get<Todo[]>(`/todos${query ? `?${query}` : ''}`);
    },

    async getById(id: string): Promise<ApiResponse<Todo>> {
        return api.get<Todo>(`/todos/${id}`);
    },

    async create(data: CreateTodoDto): Promise<ApiResponse<Todo>> {
        return api.post<Todo>('/todos', data);
    },

    async update(id: string, data: UpdateTodoDto): Promise<ApiResponse<Todo>> {
        return api.patch<Todo>(`/todos/${id}`, data);
    },

    async toggle(id: string): Promise<ApiResponse<Todo>> {
        return api.post<Todo>(`/todos/${id}/toggle`, {});
    },

    async delete(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
        return api.delete<{ deleted: boolean }>(`/todos/${id}`);
    },

    async reorder(todoIds: string[]): Promise<ApiResponse<{ reordered: boolean }>> {
        return api.post<{ reordered: boolean }>('/todos/reorder', { todoIds });
    },

    async getStats(): Promise<ApiResponse<TodoStats>> {
        return api.get<TodoStats>('/todos/stats');
    },

    // ========== TODO LISTS ==========

    async getLists(): Promise<ApiResponse<{ lists: TodoList[]; inboxCount: number }>> {
        return api.get<{ lists: TodoList[]; inboxCount: number }>('/todos/lists/all');
    },

    async createList(data: CreateTodoListDto): Promise<ApiResponse<TodoList>> {
        return api.post<TodoList>('/todos/lists', data);
    },

    async updateList(id: string, data: UpdateTodoListDto): Promise<ApiResponse<TodoList>> {
        return api.patch<TodoList>(`/todos/lists/${id}`, data);
    },

    async deleteList(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
        return api.delete<{ deleted: boolean }>(`/todos/lists/${id}`);
    },
};
