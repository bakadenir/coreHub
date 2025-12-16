// =====================================================
// Calendar Widget Component
// =====================================================

export class Calendar {
    private currentDate: Date;
    private selectedDate: Date | null = null;
    private containerId: string = '';

    constructor() {
        this.currentDate = new Date();
    }

    render(containerId: string): void {
        this.containerId = containerId;
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = this.generateCalendarHTML();
        this.bindEvents();
    }

    private generateCalendarHTML(): string {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        const monthName = this.currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const today = new Date();

        let calendarDays = '';

        // Day names
        const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        dayNames.forEach(day => {
            calendarDays += `<div class="calendar-day-name">${day}</div>`;
        });

        // Previous month days
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const day = prevMonthDays - i;
            calendarDays += `<div class="calendar-day other-month">${day}</div>`;
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

            const isSelected = this.selectedDate &&
                day === this.selectedDate.getDate() &&
                month === this.selectedDate.getMonth() &&
                year === this.selectedDate.getFullYear();

            const classes = ['calendar-day'];
            if (isToday) classes.push('today');
            if (isSelected) classes.push('selected');

            calendarDays += `<div class="${classes.join(' ')}" data-day="${day}">${day}</div>`;
        }

        // Next month days
        const totalCells = 42; // 6 rows x 7 days
        const remainingCells = totalCells - (firstDayOfMonth + daysInMonth);
        for (let day = 1; day <= remainingCells; day++) {
            calendarDays += `<div class="calendar-day other-month">${day}</div>`;
        }

        return `
      <div class="calendar-header">
        <button class="btn-icon" id="cal-prev" aria-label="Previous month">◀</button>
        <span class="calendar-month">${monthName}</span>
        <button class="btn-icon" id="cal-next" aria-label="Next month">▶</button>
      </div>
      <div class="calendar-grid">
        ${calendarDays}
      </div>
    `;
    }

    private bindEvents(): void {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // Previous month
        const prevBtn = container.querySelector('#cal-prev');
        prevBtn?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.render(this.containerId);
        });

        // Next month
        const nextBtn = container.querySelector('#cal-next');
        nextBtn?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.render(this.containerId);
        });

        // Day selection
        const days = container.querySelectorAll('.calendar-day:not(.other-month)');
        days.forEach(day => {
            day.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const dayNum = parseInt(target.dataset.day || '0');
                if (dayNum) {
                    this.selectedDate = new Date(
                        this.currentDate.getFullYear(),
                        this.currentDate.getMonth(),
                        dayNum
                    );
                    this.render(this.containerId);

                    // Dispatch custom event for schedule filtering
                    window.dispatchEvent(new CustomEvent('dateSelected', {
                        detail: { date: this.selectedDate }
                    }));
                }
            });
        });
    }

    getSelectedDate(): Date | null {
        return this.selectedDate;
    }
}
