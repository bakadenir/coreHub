// =====================================================
// Clock Component - Real-time Digital Clock
// =====================================================

export class Clock {
    private intervalId: number | null = null;

    start(): void {
        this.update();
        this.intervalId = window.setInterval(() => this.update(), 1000);
    }

    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private update(): void {
        const now = new Date();

        // Update main clock
        const mainClock = document.getElementById('main-clock');
        if (mainClock) {
            mainClock.textContent = this.formatTime(now);
        }

        // Update header time
        const headerTime = document.getElementById('header-time');
        if (headerTime) {
            headerTime.textContent = this.formatTimeShort(now);
        }

        // Update clock date
        const clockDate = document.getElementById('clock-date');
        if (clockDate) {
            clockDate.textContent = this.formatDate(now);
        }
    }

    private formatTime(date: Date): string {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    private formatTimeShort(date: Date): string {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    private formatDate(date: Date): string {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
}
