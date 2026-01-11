import useSWR from 'swr';
import { todosApi } from '../lib';
import type { Todo, TodoList, TodoFilters } from '../types';

// Fetcher for todos
const todosFetcher = async (filters: TodoFilters): Promise<Todo[]> => {
    const result = await todosApi.getAll(filters);
    if (result.success && result.data) {
        return result.data;
    }
    throw new Error(result.error || 'Failed to fetch todos');
};

// Fetcher for lists
const listsFetcher = async (): Promise<TodoList[]> => {
    const result = await todosApi.getLists();
    if (result.success && result.data) {
        return result.data.lists;
    }
    throw new Error(result.error || 'Failed to fetch lists');
};

export function useTodos(filters: TodoFilters = {}) {
    // Create a stable key from filters
    const key = ['todos', JSON.stringify(filters)];

    const { data, error, isLoading, mutate } = useSWR<Todo[]>(
        key,
        () => todosFetcher(filters),
        {
            // Keep previous data while revalidating (no loading flash)
            keepPreviousData: true,
        }
    );

    return {
        todos: data || [],
        isLoading: isLoading && !data, // Only show loading on first load
        isError: !!error,
        error: error?.message,
        refresh: mutate,
        // Optimistic update helper
        setTodos: (updater: (prev: Todo[]) => Todo[]) => {
            mutate(prev => updater(prev || []), { revalidate: false });
        },
    };
}

export function useTodoLists() {
    const { data, error, isLoading, mutate } = useSWR<TodoList[]>(
        'todo-lists',
        listsFetcher,
        {
            keepPreviousData: true,
        }
    );

    return {
        lists: data || [],
        isLoading: isLoading && !data,
        isError: !!error,
        refresh: mutate,
    };
}
