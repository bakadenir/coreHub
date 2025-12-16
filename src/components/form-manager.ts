// =====================================================
// Form Manager - Handles Dynamic Form Display
// =====================================================

import { Storage } from '../utils/storage';

type FormType = 'habit' | 'schedule' | 'note' | 'link';

export class FormManager {
    private storage = new Storage();

    showForm(type: FormType): void {
        const clockContainer = document.getElementById('clock-container');
        const formContainer = document.getElementById('form-container');

        if (clockContainer && formContainer) {
            clockContainer.classList.add('hidden');
            formContainer.classList.remove('hidden');
            formContainer.innerHTML = this.getFormHTML(type);
            this.bindFormEvents(type);
        }
    }

    hideForm(): void {
        const clockContainer = document.getElementById('clock-container');
        const formContainer = document.getElementById('form-container');

        if (clockContainer && formContainer) {
            formContainer.classList.add('hidden');
            clockContainer.classList.remove('hidden');
            formContainer.innerHTML = '';
        }
    }

    private getFormHTML(type: FormType): string {
        const titles: Record<FormType, string> = {
            habit: 'New Habit',
            schedule: 'New Schedule',
            note: 'New Note',
            link: 'New Link'
        };

        const icons: Record<FormType, string> = {
            habit: '📋',
            schedule: '📅',
            note: '📝',
            link: '🔗'
        };

        return `
      <div class="form-header">
        <h2 class="form-title">${icons[type]} ${titles[type]}</h2>
        <button class="btn-icon" id="form-close" aria-label="Close form">✕</button>
      </div>
      <form class="form-body" id="data-form" data-type="${type}">
        ${this.getFormFields(type)}
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="form-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    `;
    }

    private getFormFields(type: FormType): string {
        switch (type) {
            case 'habit':
                return `
          <div class="input-group">
            <label class="input-label" for="habit-name">Habit Name</label>
            <input type="text" class="input" id="habit-name" name="name" placeholder="e.g., Drink 8 glasses of water" required />
          </div>
          <div class="input-group">
            <label class="input-label" for="habit-frequency">Frequency</label>
            <select class="input" id="habit-frequency" name="frequency">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div class="input-group">
            <label class="input-label" for="habit-target">Target (days/times)</label>
            <input type="number" class="input" id="habit-target" name="target" value="1" min="1" />
          </div>
        `;

            case 'schedule':
                return `
          <div class="input-group">
            <label class="input-label" for="schedule-title">Event Title</label>
            <input type="text" class="input" id="schedule-title" name="title" placeholder="Meeting with team" required />
          </div>
          <div class="input-group">
            <label class="input-label" for="schedule-date">Date</label>
            <input type="date" class="input" id="schedule-date" name="date" required />
          </div>
          <div class="input-group">
            <label class="input-label" for="schedule-start">Start Time</label>
            <input type="time" class="input" id="schedule-start" name="startTime" required />
          </div>
          <div class="input-group">
            <label class="input-label" for="schedule-end">End Time</label>
            <input type="time" class="input" id="schedule-end" name="endTime" required />
          </div>
          <div class="input-group">
            <label class="input-label" for="schedule-desc">Description / Location</label>
            <textarea class="textarea" id="schedule-desc" name="description" placeholder="Optional details..."></textarea>
          </div>
        `;

            case 'note':
                return `
          <div class="input-group">
            <label class="input-label" for="note-title">Note Title</label>
            <input type="text" class="input" id="note-title" name="title" placeholder="My Note" required />
          </div>
          <div class="input-group">
            <label class="input-label" for="note-content">Content</label>
            <textarea class="textarea" id="note-content" name="content" placeholder="Write your note here..." rows="6" required></textarea>
          </div>
        `;

            case 'link':
                return `
          <div class="input-group">
            <label class="input-label" for="link-title">Link Title</label>
            <input type="text" class="input" id="link-title" name="title" placeholder="My Bookmark" required />
          </div>
          <div class="input-group">
            <label class="input-label" for="link-url">URL</label>
            <input type="url" class="input" id="link-url" name="url" placeholder="https://example.com" required />
          </div>
          <div class="input-group">
            <label class="input-label" for="link-desc">Description</label>
            <input type="text" class="input" id="link-desc" name="description" placeholder="Brief description (optional)" />
          </div>
        `;
        }
    }

    private bindFormEvents(type: FormType): void {
        // Close button
        const closeBtn = document.getElementById('form-close');
        closeBtn?.addEventListener('click', () => this.hideForm());

        // Cancel button
        const cancelBtn = document.getElementById('form-cancel');
        cancelBtn?.addEventListener('click', () => this.hideForm());

        // Form submit
        const form = document.getElementById('data-form') as HTMLFormElement;
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveFormData(type, form);
        });
    }

    private saveFormData(type: FormType, form: HTMLFormElement): void {
        const formData = new FormData(form);
        const data: Record<string, any> = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            type
        };

        formData.forEach((value, key) => {
            data[key] = value;
        });

        // Add default completed state for habits
        if (type === 'habit') {
            data.completedDates = [];
        }

        // Save to storage
        const storageKey = type === 'schedule' ? 'schedules' : `${type}s`;
        const items = this.storage.get<any[]>(storageKey) || [];
        items.push(data);
        this.storage.set(storageKey, items);

        // Dispatch event to update UI
        window.dispatchEvent(new CustomEvent('dataUpdated', {
            detail: { type, data }
        }));

        // Hide form
        this.hideForm();
    }
}
