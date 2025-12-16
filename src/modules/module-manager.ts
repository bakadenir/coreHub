// =====================================================
// Module Manager - Handles Tab Content Switching
// =====================================================

import { Storage } from '../utils/storage';

type ModuleType = 'habits' | 'schedule' | 'notes' | 'links';

interface HabitItem {
    id: string;
    name: string;
    frequency: string;
    target: number;
    completedDates: string[];
    createdAt: string;
}

interface ScheduleItem {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description?: string;
    createdAt: string;
}

interface NoteItem {
    id: string;
    title: string;
    content: string;
    createdAt: string;
}

interface LinkItem {
    id: string;
    title: string;
    url: string;
    description?: string;
    createdAt: string;
}

export class ModuleManager {
    private storage = new Storage();
    private currentModule: ModuleType = 'habits';

    init(): void {
        this.bindEvents();
        this.renderCurrentModule();
    }

    loadData(): void {
        this.renderCurrentModule();
    }

    switchModule(module: string): void {
        this.currentModule = module as ModuleType;
        this.renderCurrentModule();
    }

    private bindEvents(): void {
        // Listen for data updates
        window.addEventListener('dataUpdated', () => {
            this.renderCurrentModule();
        });

        // Listen for date selection from calendar
        window.addEventListener('dateSelected', (e: Event) => {
            const customEvent = e as CustomEvent;
            if (this.currentModule === 'schedule') {
                this.renderSchedule(customEvent.detail.date);
            }
        });
    }

    private renderCurrentModule(): void {
        const container = document.getElementById('content-list');
        if (!container) return;

        switch (this.currentModule) {
            case 'habits':
                container.innerHTML = this.renderHabits();
                this.bindHabitEvents(container);
                break;
            case 'schedule':
                container.innerHTML = this.renderSchedule();
                this.bindItemEvents(container, 'schedule');
                break;
            case 'notes':
                container.innerHTML = this.renderNotes();
                this.bindItemEvents(container, 'notes');
                break;
            case 'links':
                container.innerHTML = this.renderLinks();
                this.bindLinkEvents(container);
                break;
        }
    }

    private renderHabits(): string {
        const habits = this.storage.get<HabitItem[]>('habits') || [];
        const today = new Date().toISOString().split('T')[0];

        if (habits.length === 0) {
            return this.renderEmpty('habits', '📋', 'No habits yet. Create your first habit!');
        }

        return habits.map(habit => {
            const isCompleted = habit.completedDates?.includes(today);
            return `
        <div class="list-item" data-id="${habit.id}">
          <div class="list-item-content">
            <div class="checkbox-wrapper" data-id="${habit.id}">
              <div class="checkbox ${isCompleted ? 'checked' : ''}"></div>
              <span class="checkbox-label ${isCompleted ? 'completed' : ''}">${habit.name}</span>
            </div>
          </div>
          <div class="list-item-meta">
            <span class="text-xs">${habit.frequency}</span>
          </div>
          <div class="list-item-actions">
            <button class="btn-icon btn-edit" data-id="${habit.id}" title="Edit">✏️</button>
            <button class="btn-icon btn-delete" data-id="${habit.id}" title="Delete">🗑️</button>
          </div>
        </div>
      `;
        }).join('');
    }

    private renderSchedule(filterDate?: Date): string {
        const schedules = this.storage.get<ScheduleItem[]>('schedules') || [];

        let filtered = schedules;
        if (filterDate) {
            const dateStr = filterDate.toISOString().split('T')[0];
            filtered = schedules.filter(s => s.date === dateStr);
        }

        // Sort by date and time
        filtered.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startTime}`);
            const dateB = new Date(`${b.date}T${b.startTime}`);
            return dateA.getTime() - dateB.getTime();
        });

        if (filtered.length === 0) {
            const message = filterDate
                ? `No events on ${filterDate.toLocaleDateString()}`
                : 'No scheduled events. Add your first event!';
            return this.renderEmpty('schedule', '📅', message);
        }

        return filtered.map(schedule => `
      <div class="list-item" data-id="${schedule.id}">
        <div class="list-item-content">
          <div class="schedule-time font-mono">
            <span>${schedule.startTime}</span>
            <span>-</span>
            <span>${schedule.endTime}</span>
          </div>
          <div class="schedule-info">
            <span class="font-medium">${schedule.title}</span>
            ${schedule.description ? `<span class="text-sm" style="opacity: 0.6">${schedule.description}</span>` : ''}
          </div>
        </div>
        <div class="list-item-meta">
          <span class="text-xs font-mono">${schedule.date}</span>
        </div>
        <div class="list-item-actions">
          <button class="btn-icon btn-edit" data-id="${schedule.id}" title="Edit">✏️</button>
          <button class="btn-icon btn-delete" data-id="${schedule.id}" title="Delete">🗑️</button>
        </div>
      </div>
    `).join('');
    }

    private renderNotes(): string {
        const notes = this.storage.get<NoteItem[]>('notes') || [];

        if (notes.length === 0) {
            return this.renderEmpty('notes', '📝', 'No notes yet. Create your first note!');
        }

        return notes.map(note => `
      <div class="list-item" data-id="${note.id}">
        <div class="list-item-content">
          <div class="note-info">
            <span class="font-medium">${note.title}</span>
            <span class="text-sm" style="opacity: 0.6">${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</span>
          </div>
        </div>
        <div class="list-item-meta">
          <span class="text-xs">${new Date(note.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="list-item-actions">
          <button class="btn-icon btn-edit" data-id="${note.id}" title="Edit">✏️</button>
          <button class="btn-icon btn-delete" data-id="${note.id}" title="Delete">🗑️</button>
        </div>
      </div>
    `).join('');
    }

    private renderLinks(): string {
        const links = this.storage.get<LinkItem[]>('links') || [];

        if (links.length === 0) {
            return this.renderEmpty('links', '🔗', 'No links saved. Add your first bookmark!');
        }

        return links.map(link => `
      <div class="list-item" data-id="${link.id}">
        <div class="list-item-content">
          <div class="link-info">
            <span class="font-medium">${link.title}</span>
            <span class="text-sm" style="opacity: 0.6">${link.url}</span>
          </div>
        </div>
        <div class="list-item-actions">
          <button class="btn btn-secondary btn-sm btn-open" data-url="${link.url}" title="Open in new tab">Open ↗</button>
          <button class="btn-icon btn-edit" data-id="${link.id}" title="Edit">✏️</button>
          <button class="btn-icon btn-delete" data-id="${link.id}" title="Delete">🗑️</button>
        </div>
      </div>
    `).join('');
    }

    private renderEmpty(module: string, icon: string, message: string): string {
        return `
      <div class="content-empty">
        <span class="icon">${icon}</span>
        <p>${message}</p>
      </div>
    `;
    }

    private bindHabitEvents(container: HTMLElement): void {
        // Checkbox toggle
        container.querySelectorAll('.checkbox-wrapper').forEach(wrapper => {
            wrapper.addEventListener('click', (e) => {
                const id = (wrapper as HTMLElement).dataset.id;
                if (id) this.toggleHabit(id);
            });
        });

        this.bindItemEvents(container, 'habits');
    }

    private bindItemEvents(container: HTMLElement, type: string): void {
        // Delete buttons
        container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = (btn as HTMLElement).dataset.id;
                if (id && confirm('Are you sure you want to delete this item?')) {
                    this.deleteItem(type, id);
                }
            });
        });
    }

    private bindLinkEvents(container: HTMLElement): void {
        // Open buttons
        container.querySelectorAll('.btn-open').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const url = (btn as HTMLElement).dataset.url;
                if (url) {
                    window.open(url, '_blank');
                }
            });
        });

        this.bindItemEvents(container, 'links');
    }

    private toggleHabit(id: string): void {
        const habits = this.storage.get<HabitItem[]>('habits') || [];
        const today = new Date().toISOString().split('T')[0];

        const habit = habits.find(h => h.id === id);
        if (habit) {
            if (!habit.completedDates) habit.completedDates = [];

            const index = habit.completedDates.indexOf(today);
            if (index > -1) {
                habit.completedDates.splice(index, 1);
            } else {
                habit.completedDates.push(today);
            }

            this.storage.set('habits', habits);
            this.renderCurrentModule();
        }
    }

    private deleteItem(type: string, id: string): void {
        const key = type === 'schedule' ? 'schedules' : type;
        const items = this.storage.get<any[]>(key) || [];
        const filtered = items.filter(item => item.id !== id);
        this.storage.set(key, filtered);
        this.renderCurrentModule();
    }
}
