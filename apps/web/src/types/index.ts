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
    isArchived?: boolean;
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
    date?: string; // legacy
    createdAt?: string;
    updatedAt?: string;
    tag: string;
    isPinned?: boolean;
    reminderAt?: string;
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
    color: string; // class for border/text styling e.g. "border-gray-600"
    location?: string;
    description?: string;
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
