import { supabase } from '../config/supabase';

export interface TodoFilters {
    listId?: string;
    completed?: boolean;
    priority?: string;
    dueDate?: 'today' | 'upcoming' | 'overdue' | 'no-date';
    search?: string;
}

export interface CreateTodoDto {
    title: string;
    description?: string;
    listId?: string;
    parentId?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: string;
    dueTime?: string;
    tags?: string[];
    reminderAt?: string;
}

export interface UpdateTodoDto {
    title?: string;
    description?: string;
    listId?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: string;
    dueTime?: string;
    tags?: string[];
    reminderAt?: string;
    sortOrder?: number;
}

export interface CreateTodoListDto {
    name: string;
    color?: string;
    icon?: string;
}

export interface UpdateTodoListDto {
    name?: string;
    color?: string;
    icon?: string;
    sortOrder?: number;
}

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

export class TodosService {
    // ========== TODOS ==========

    async findAll(userId: string, filters: TodoFilters = {}) {
        let query = supabase
            .from('todos')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .is('parent_id', null) // Only get top-level todos
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (filters.listId) {
            query = query.eq('list_id', filters.listId);
        }

        if (filters.completed !== undefined) {
            query = query.eq('is_completed', filters.completed);
        }

        if (filters.priority) {
            query = query.eq('priority', filters.priority);
        }

        if (filters.search) {
            query = query.ilike('title', `%${filters.search}%`);
        }

        // Date filters
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString();
        const tomorrowStr = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString();
        const weekLaterStr = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

        if (filters.dueDate === 'today') {
            query = query.gte('due_date', todayStr).lt('due_date', tomorrowStr);
        } else if (filters.dueDate === 'upcoming') {
            query = query.gte('due_date', todayStr).lt('due_date', weekLaterStr);
        } else if (filters.dueDate === 'overdue') {
            query = query.lt('due_date', todayStr).eq('is_completed', false);
        } else if (filters.dueDate === 'no-date') {
            query = query.is('due_date', null);
        }

        const { data: todos, error } = await query;
        if (error) throw error;

        // Fetch subtasks for each todo
        const todoIds = (todos || []).map(t => t.id);
        let subtasksMap: Record<string, any[]> = {};

        if (todoIds.length > 0) {
            const { data: subtasks } = await supabase
                .from('todos')
                .select('*')
                .in('parent_id', todoIds)
                .is('deleted_at', null)
                .order('sort_order', { ascending: true });

            subtasksMap = (subtasks || []).reduce((acc, st) => {
                if (!acc[st.parent_id]) acc[st.parent_id] = [];
                acc[st.parent_id].push(st);
                return acc;
            }, {} as Record<string, any[]>);
        }

        return (todos || []).map(todo => ({
            ...transformTodo(todo),
            subtasks: (subtasksMap[todo.id] || []).map(transformTodo),
        }));
    }

    async findById(id: string, userId: string) {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .is('deleted_at', null)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!data) return null;

        // Fetch subtasks
        const { data: subtasks } = await supabase
            .from('todos')
            .select('*')
            .eq('parent_id', id)
            .is('deleted_at', null)
            .order('sort_order', { ascending: true });

        return {
            ...transformTodo(data),
            subtasks: (subtasks || []).map(transformTodo),
        };
    }

    async create(userId: string, data: CreateTodoDto) {
        const { data: todo, error } = await supabase
            .from('todos')
            .insert({
                user_id: userId,
                list_id: data.listId,
                parent_id: data.parentId,
                title: data.title,
                description: data.description,
                priority: data.priority || 'medium',
                due_date: data.dueDate,
                due_time: data.dueTime,
                tags: data.tags || [],
                reminder_at: data.reminderAt,
            })
            .select()
            .single();

        if (error) throw error;
        return transformTodo(todo);
    }

    async update(id: string, userId: string, data: UpdateTodoDto) {
        const updateData: any = { updated_at: new Date().toISOString() };

        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.listId !== undefined) updateData.list_id = data.listId;
        if (data.priority !== undefined) updateData.priority = data.priority;
        if (data.dueDate !== undefined) updateData.due_date = data.dueDate;
        if (data.dueTime !== undefined) updateData.due_time = data.dueTime;
        if (data.tags !== undefined) updateData.tags = data.tags;
        if (data.reminderAt !== undefined) updateData.reminder_at = data.reminderAt;
        if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;

        const { data: todo, error } = await supabase
            .from('todos')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return transformTodo(todo);
    }

    async toggleComplete(id: string, userId: string) {
        // Get current state
        const { data: current } = await supabase
            .from('todos')
            .select('is_completed')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (!current) throw new Error('Todo not found');

        const isCompleted = !current.is_completed;

        const { data: todo, error } = await supabase
            .from('todos')
            .update({
                is_completed: isCompleted,
                completed_at: isCompleted ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        // Also toggle all subtasks if completing parent
        if (isCompleted) {
            await supabase
                .from('todos')
                .update({
                    is_completed: true,
                    completed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('parent_id', id)
                .eq('user_id', userId);
        }

        return transformTodo(todo);
    }

    async softDelete(id: string, userId: string) {
        // Also soft delete all subtasks
        await supabase
            .from('todos')
            .update({ deleted_at: new Date().toISOString() })
            .eq('parent_id', id)
            .eq('user_id', userId);

        const { error } = await supabase
            .from('todos')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
    }

    async reorder(userId: string, todoIds: string[]) {
        const updates = todoIds.map((id, index) =>
            supabase
                .from('todos')
                .update({ sort_order: index, updated_at: new Date().toISOString() })
                .eq('id', id)
                .eq('user_id', userId)
        );

        await Promise.all(updates);
    }

    async getStats(userId: string) {
        const { data: todos } = await supabase
            .from('todos')
            .select('is_completed, due_date')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .is('parent_id', null);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const total = todos?.length || 0;
        const completed = todos?.filter(t => t.is_completed).length || 0;
        const overdue = todos?.filter(t => 
            !t.is_completed && t.due_date && new Date(t.due_date) < today
        ).length || 0;
        const dueToday = todos?.filter(t => {
            if (!t.due_date || t.is_completed) return false;
            const due = new Date(t.due_date);
            due.setHours(0, 0, 0, 0);
            return due.getTime() === today.getTime();
        }).length || 0;

        return {
            total,
            completed,
            active: total - completed,
            overdue,
            dueToday,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
    }

    // ========== TODO LISTS ==========

    async findAllLists(userId: string) {
        const { data: lists, error } = await supabase
            .from('todo_lists')
            .select('*')
            .eq('user_id', userId)
            .order('sort_order', { ascending: true });

        if (error) throw error;

        // Get todo counts for each list
        const { data: counts } = await supabase
            .from('todos')
            .select('list_id')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .is('parent_id', null)
            .eq('is_completed', false);

        const countMap = (counts || []).reduce((acc, t) => {
            const key = t.list_id || 'inbox';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Add inbox count
        const inboxCount = countMap['inbox'] || 0;

        return {
            lists: (lists || []).map(list => ({
                ...transformList(list),
                todoCount: countMap[list.id] || 0,
            })),
            inboxCount,
        };
    }

    async createList(userId: string, data: CreateTodoListDto) {
        const { data: list, error } = await supabase
            .from('todo_lists')
            .insert({
                user_id: userId,
                name: data.name,
                color: data.color || 'blue',
                icon: data.icon || 'list',
            })
            .select()
            .single();

        if (error) throw error;
        return transformList(list);
    }

    async updateList(id: string, userId: string, data: UpdateTodoListDto) {
        const updateData: any = { updated_at: new Date().toISOString() };

        if (data.name !== undefined) updateData.name = data.name;
        if (data.color !== undefined) updateData.color = data.color;
        if (data.icon !== undefined) updateData.icon = data.icon;
        if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;

        const { data: list, error } = await supabase
            .from('todo_lists')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return transformList(list);
    }

    async deleteList(id: string, userId: string) {
        // Move all todos to inbox (null list_id)
        await supabase
            .from('todos')
            .update({ list_id: null })
            .eq('list_id', id)
            .eq('user_id', userId);

        const { error } = await supabase
            .from('todo_lists')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
    }
}
