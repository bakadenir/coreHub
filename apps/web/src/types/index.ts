export type Frequency = 'Daily' | 'Weekly' | 'Monthly' | 'Weekdays' | 'Weekends' | string;

export interface Habit {
    id: string;
    name: string;
    description?: string;
    time: string; // e.g., "07:00 AM" or "Anytime"
    category: string; // e.g., "Wellness", "Learning", "Health", "Career"
    frequency: Frequency;
    streak: number;
    completed: boolean;
    icon: string; // material icon name
    completionRate: number; // e.g., 100, 67, 0 (percentage)
    startDate?: string;
    specificDays?: number[];
    reminderTime?: string; // e.g., "09:00" - 24h format for reminder
    isArchived?: boolean;
    hasStarted?: boolean; // true if today >= startDate
    isDueToday?: boolean; // true if habit should be done today based on frequency
    completions?: { completed_at: string }[]; // completion history for heatmap
}

export interface ActivityCardData {
    habits: {
        id: string;
        name: string;
        completed: boolean;
    }[];
    schedule: {
        id: string;
        time: string;
        title: string;
        location?: string;
        isCurrent?: boolean;
    }[];
    notes: {
        id: string;
        title: string;
        preview: string;
    }[];
    links: {
        id: string;
        title: string;
        url: string;
        color: string; // tailwind color class e.g "bg-blue-500"
    }[];
}

export interface Note {
    id: number | string;
    title: string;
    content: string;
    contentType?: 'rich' | 'markdown';
    date?: string; // legacy
    createdAt?: string;
    updatedAt?: string;
    tag: string;
    isPinned?: boolean;
    reminderAt?: string;
    isPublic?: boolean;
    publicSlug?: string;
}

export interface LinkItem {
    id: number | string;
    title: string;
    url: string;
    description: string;
    image: string;
    tags: string[];
    isPinned?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ScheduleEvent {
    id: number | string;
    date: number; // day of month
    time: string;
    startTime: string;
    endTime?: string;
    title: string;
    color?: string; // color name e.g. "blue", "green"
    location?: string;
    description?: string;
    isAllDay?: boolean;
}

export interface AgendaItem {
    id: number | string;
    time: string;
    title: string;
    location?: string;
    platform?: string; // e.g., "Google Meet"
    description?: string;
    attendees?: string[]; // urls to avatars
    isToday: boolean;
}

export interface UserProfile {
    name: string;
    role: string;
    email: string;
    bio: string;
    avatar: string; // url (legacy)
    image?: string; // url (from API)
    location?: string;
}

export interface AdminStat {
    label: string;
    value: string;
    change: string;
    icon: string;
    color: string;
}

export interface RecentUser {
    name: string;
    email: string;
    role: string;
    status: 'Active' | 'Offline' | string;
    date: string;
}

export interface ActivityLog {
    action: string;
    user: string;
    time: string;
}

// ========== TODO TYPES ==========

export type TodoPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Todo {
    id: string;
    userId: string;
    listId?: string;
    parentId?: string;
    title: string;
    description?: string;
    priority: TodoPriority;
    dueDate?: string;
    dueTime?: string;
    isCompleted: boolean;
    completedAt?: string;
    sortOrder: number;
    tags: string[];
    reminderAt?: string;
    isRecurring: boolean;
    recurrencePattern?: string;
    createdAt: string;
    updatedAt: string;
    subtasks: Todo[];
}

export interface TodoList {
    id: string;
    userId: string;
    name: string;
    color: string;
    icon: string;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    todoCount: number;
}

export interface TodoFilters {
    listId?: string;
    completed?: boolean;
    priority?: TodoPriority;
    dueDate?: 'today' | 'upcoming' | 'overdue' | 'no-date';
    search?: string;
}

export interface CreateTodoDto {
    title: string;
    description?: string;
    listId?: string;
    parentId?: string;
    priority?: TodoPriority;
    dueDate?: string;
    dueTime?: string;
    tags?: string[];
    reminderAt?: string;
}

export interface UpdateTodoDto {
    title?: string;
    description?: string;
    listId?: string;
    priority?: TodoPriority;
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

export interface TodoStats {
    total: number;
    completed: number;
    active: number;
    overdue: number;
    dueToday: number;
    completionRate: number;
}
