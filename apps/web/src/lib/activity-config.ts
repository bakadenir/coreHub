
export type PanelId = 'habits' | 'schedule' | 'notes' | 'links' | 'todos';

export interface PanelConfig {
    id: PanelId;
    title: string;
    icon: string;
    route: string;
}

export const panelConfigs: Record<PanelId, PanelConfig> = {
    habits: { id: 'habits', title: 'Habit Tracker', icon: 'check_circle', route: '/habits' },
    schedule: { id: 'schedule', title: 'Schedule', icon: 'schedule', route: '/schedule' },
    notes: { id: 'notes', title: 'Notes', icon: 'description', route: '/notes' },
    links: { id: 'links', title: 'List Link', icon: 'link', route: '/links' },
    todos: { id: 'todos', title: 'Todo List', icon: 'check_square', route: '/todos' },
};

export const defaultOrder: PanelId[] = ['habits', 'schedule', 'notes', 'links'];
export const ACTIVITY_STORAGE_KEY = 'activityPanelOrder';
