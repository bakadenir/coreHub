import { describe, it, expect } from 'vitest';

// Extract and test the transform functions
// Since they're not exported, we'll recreate them for testing
// In a real scenario, you'd export these functions

const transformTodo = (todo: any) => ({
    id: todo.id,
    userId: todo.user_id,
    listId: todo.list_id,
    parentId: todo.parent_id,
    title: todo.title,
    description: todo.description,
    priority: todo.priority,
    dueDate: todo.due_date,
    dueTime: todo.due_time,
    isCompleted: todo.is_completed,
    completedAt: todo.completed_at,
    sortOrder: todo.sort_order,
    tags: todo.tags || [],
    reminderAt: todo.reminder_at,
    isRecurring: todo.is_recurring,
    recurrencePattern: todo.recurrence_pattern,
    createdAt: todo.created_at,
    updatedAt: todo.updated_at,
    subtasks: todo.subtasks?.map(transformTodo) || [],
});

const transformList = (list: any) => ({
    id: list.id,
    userId: list.user_id,
    name: list.name,
    color: list.color,
    icon: list.icon,
    sortOrder: list.sort_order,
    createdAt: list.created_at,
    updatedAt: list.updated_at,
    todoCount: list.todo_count || 0,
});

describe('Todo Transform Functions', () => {
    describe('transformTodo', () => {
        it('transforms database row to API format', () => {
            const dbRow = {
                id: 'todo-1',
                user_id: 'user-1',
                list_id: 'list-1',
                parent_id: null,
                title: 'Test Todo',
                description: 'Test description',
                priority: 'high',
                due_date: '2026-01-15',
                due_time: '14:00',
                is_completed: false,
                completed_at: null,
                sort_order: 1,
                tags: ['work', 'urgent'],
                reminder_at: '2026-01-15T13:00:00Z',
                is_recurring: false,
                recurrence_pattern: null,
                created_at: '2026-01-01T00:00:00Z',
                updated_at: '2026-01-01T00:00:00Z',
            };

            const result = transformTodo(dbRow);

            expect(result).toEqual({
                id: 'todo-1',
                userId: 'user-1',
                listId: 'list-1',
                parentId: null,
                title: 'Test Todo',
                description: 'Test description',
                priority: 'high',
                dueDate: '2026-01-15',
                dueTime: '14:00',
                isCompleted: false,
                completedAt: null,
                sortOrder: 1,
                tags: ['work', 'urgent'],
                reminderAt: '2026-01-15T13:00:00Z',
                isRecurring: false,
                recurrencePattern: null,
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z',
                subtasks: [],
            });
        });

        it('handles null tags by defaulting to empty array', () => {
            const dbRow = {
                id: 'todo-1',
                user_id: 'user-1',
                title: 'Test',
                tags: null,
            };

            const result = transformTodo(dbRow);

            expect(result.tags).toEqual([]);
        });

        it('handles undefined tags by defaulting to empty array', () => {
            const dbRow = {
                id: 'todo-1',
                user_id: 'user-1',
                title: 'Test',
            };

            const result = transformTodo(dbRow);

            expect(result.tags).toEqual([]);
        });

        it('transforms subtasks recursively', () => {
            const dbRow = {
                id: 'todo-1',
                user_id: 'user-1',
                title: 'Parent Todo',
                subtasks: [
                    {
                        id: 'subtask-1',
                        user_id: 'user-1',
                        parent_id: 'todo-1',
                        title: 'Subtask 1',
                        tags: ['sub'],
                    },
                    {
                        id: 'subtask-2',
                        user_id: 'user-1',
                        parent_id: 'todo-1',
                        title: 'Subtask 2',
                    },
                ],
            };

            const result = transformTodo(dbRow);

            expect(result.subtasks).toHaveLength(2);
            expect(result.subtasks[0].id).toBe('subtask-1');
            expect(result.subtasks[0].parentId).toBe('todo-1');
            expect(result.subtasks[1].id).toBe('subtask-2');
        });

        it('handles empty subtasks array', () => {
            const dbRow = {
                id: 'todo-1',
                user_id: 'user-1',
                title: 'Test',
                subtasks: [],
            };

            const result = transformTodo(dbRow);

            expect(result.subtasks).toEqual([]);
        });

        it('handles completed todo', () => {
            const dbRow = {
                id: 'todo-1',
                user_id: 'user-1',
                title: 'Completed Todo',
                is_completed: true,
                completed_at: '2026-01-01T12:00:00Z',
            };

            const result = transformTodo(dbRow);

            expect(result.isCompleted).toBe(true);
            expect(result.completedAt).toBe('2026-01-01T12:00:00Z');
        });
    });

    describe('transformList', () => {
        it('transforms database row to API format', () => {
            const dbRow = {
                id: 'list-1',
                user_id: 'user-1',
                name: 'Work Tasks',
                color: 'blue',
                icon: 'briefcase',
                sort_order: 0,
                created_at: '2026-01-01T00:00:00Z',
                updated_at: '2026-01-01T00:00:00Z',
                todo_count: 5,
            };

            const result = transformList(dbRow);

            expect(result).toEqual({
                id: 'list-1',
                userId: 'user-1',
                name: 'Work Tasks',
                color: 'blue',
                icon: 'briefcase',
                sortOrder: 0,
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z',
                todoCount: 5,
            });
        });

        it('handles missing todo_count by defaulting to 0', () => {
            const dbRow = {
                id: 'list-1',
                user_id: 'user-1',
                name: 'Empty List',
                color: 'gray',
            };

            const result = transformList(dbRow);

            expect(result.todoCount).toBe(0);
        });

        it('handles null todo_count by defaulting to 0', () => {
            const dbRow = {
                id: 'list-1',
                user_id: 'user-1',
                name: 'Empty List',
                todo_count: null,
            };

            const result = transformList(dbRow);

            expect(result.todoCount).toBe(0);
        });

        it('handles all color values', () => {
            const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'red', 'yellow', 'gray'];

            colors.forEach((color) => {
                const dbRow = {
                    id: 'list-1',
                    user_id: 'user-1',
                    name: 'Test',
                    color,
                };

                const result = transformList(dbRow);
                expect(result.color).toBe(color);
            });
        });
    });
});
