// =====================================================
// coreHub - Main App Controller
// =====================================================

import { Clock } from './components/clock';
import { Pomodoro } from './components/pomodoro';
import { Calendar } from './components/calendar';
import { FormManager } from './components/form-manager';
import { ModuleManager } from './modules/module-manager';
import { Storage } from './utils/storage';

export class App {
    private container: HTMLElement;
    private clock: Clock;
    private pomodoro: Pomodoro;
    private calendar: Calendar;
    private formManager: FormManager;
    private moduleManager: ModuleManager;
    private currentUser = {
        name: 'User',
        avatar: '',
        role: 'Free Plan'
    };

    constructor(container: HTMLElement) {
        this.container = container;
        this.clock = new Clock();
        this.pomodoro = new Pomodoro();
        this.calendar = new Calendar();
        this.formManager = new FormManager();
        this.moduleManager = new ModuleManager();
    }

    init(): void {
        this.render();
        this.clock.start();
        this.bindEvents();
        this.moduleManager.loadData();
    }

    private render(): void {
        this.container.innerHTML = `
      <div class="app">
        ${this.renderHeader()}
        <main class="main-content">
          ${this.renderWidgetRow()}
          ${this.renderModuleSection()}
        </main>
      </div>
    `;
    }

    private renderHeader(): string {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });

        return `
      <header class="header">
        <div class="header-left">
          <div class="dropdown" id="user-dropdown">
            <button class="user-avatar-btn" aria-label="User menu">
              <img 
                src="https://api.dicebear.com/7.x/initials/svg?seed=${this.currentUser.name}" 
                alt="User avatar" 
                class="user-avatar"
              />
            </button>
            <div class="dropdown-menu">
              <a href="#" class="dropdown-item">Settings</a>
              <a href="#" class="dropdown-item">Logout</a>
            </div>
          </div>
          <div class="user-info">
            <span class="user-name">${this.currentUser.name}</span>
            <span class="user-role">${this.currentUser.role}</span>
          </div>
        </div>
        <div class="header-right">
          <div class="context-info">
            <div class="context-item">
              <span class="icon">📍</span>
              <span id="user-location">Detecting...</span>
            </div>
            <div class="context-item">
              <span class="icon">📅</span>
              <span>${dateStr}</span>
            </div>
            <div class="context-item">
              <span class="icon">🕐</span>
              <span id="header-time" class="font-mono">--:--</span>
            </div>
          </div>
        </div>
      </header>
    `;
    }

    private renderWidgetRow(): string {
        return `
      <div class="widget-row">
        <!-- Calendar Widget -->
        <div class="widget calendar-widget">
          <h3 class="widget-title">Calendar</h3>
          <div id="calendar-container"></div>
        </div>

        <!-- Dynamic Center (Clock / Form) -->
        <div class="dynamic-center" id="dynamic-center">
          <div id="clock-container" class="clock-container">
            <div class="clock-time" id="main-clock">--:--:--</div>
            <div class="clock-date" id="clock-date"></div>
          </div>
          <div id="form-container" class="form-container hidden"></div>
          <div class="quick-actions" id="quick-actions">
            <button class="btn-quick-action" data-form="habit">
              <span class="icon">📋</span>
              <span class="label">+ Habit</span>
            </button>
            <button class="btn-quick-action" data-form="schedule">
              <span class="icon">📅</span>
              <span class="label">+ Schedule</span>
            </button>
            <button class="btn-quick-action" data-form="note">
              <span class="icon">📝</span>
              <span class="label">+ Note</span>
            </button>
            <button class="btn-quick-action" data-form="link">
              <span class="icon">🔗</span>
              <span class="label">+ Link</span>
            </button>
          </div>
        </div>

        <!-- Pomodoro Widget -->
        <div class="widget pomodoro-widget">
          <h3 class="widget-title">Pomodoro</h3>
          <div class="pomodoro-display">
            <div class="pomodoro-time" id="pomodoro-time">25:00</div>
            <div class="pomodoro-label" id="pomodoro-label">Focus Time</div>
          </div>
          <div class="pomodoro-modes">
            <button class="pomodoro-mode active" data-mode="focus">Focus</button>
            <button class="pomodoro-mode" data-mode="short">Short</button>
            <button class="pomodoro-mode" data-mode="long">Long</button>
          </div>
          <div class="pomodoro-controls">
            <button class="btn btn-primary" id="pomodoro-start">Start</button>
            <button class="btn btn-secondary" id="pomodoro-reset">Reset</button>
          </div>
        </div>
      </div>
    `;
    }

    private renderModuleSection(): string {
        return `
      <section class="module-section">
        <div class="module-tabs" id="module-tabs">
          <button class="module-tab active" data-module="habits">Habits</button>
          <button class="module-tab" data-module="schedule">Schedule</button>
          <button class="module-tab" data-module="notes">Notes</button>
          <button class="module-tab" data-module="links">Links</button>
        </div>
        <div class="content-list" id="content-list">
          <!-- Content will be rendered dynamically -->
        </div>
      </section>
    `;
    }

    private bindEvents(): void {
        // User dropdown toggle
        const dropdown = document.getElementById('user-dropdown');
        dropdown?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown?.classList.remove('open');
        });

        // Quick action buttons
        const quickActions = document.getElementById('quick-actions');
        quickActions?.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const button = target.closest('.btn-quick-action') as HTMLElement;
            if (button) {
                const formType = button.dataset.form;
                if (formType) {
                    this.formManager.showForm(formType);
                }
            }
        });

        // Module tabs
        const moduleTabs = document.getElementById('module-tabs');
        moduleTabs?.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('module-tab')) {
                // Update active tab
                moduleTabs.querySelectorAll('.module-tab').forEach(tab => {
                    tab.classList.remove('active');
                });
                target.classList.add('active');

                // Switch module content
                const module = target.dataset.module;
                if (module) {
                    this.moduleManager.switchModule(module);
                }
            }
        });

        // Get user location
        this.getUserLocation();

        // Initialize components
        this.calendar.render('calendar-container');
        this.pomodoro.init();
        this.moduleManager.init();
    }

    private getUserLocation(): void {
        const locationEl = document.getElementById('user-location');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                        );
                        const data = await response.json();
                        if (locationEl) {
                            locationEl.textContent = data.address?.city || data.address?.town || 'Unknown';
                        }
                    } catch {
                        if (locationEl) locationEl.textContent = 'Unknown';
                    }
                },
                () => {
                    if (locationEl) locationEl.textContent = 'Location disabled';
                }
            );
        } else {
            if (locationEl) locationEl.textContent = 'Not supported';
        }
    }
}
