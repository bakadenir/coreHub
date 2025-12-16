// =====================================================
// Pomodoro Timer Component
// =====================================================

type PomodoroMode = 'focus' | 'short' | 'long';

interface PomodoroConfig {
    focus: number;
    short: number;
    long: number;
}

export class Pomodoro {
    private config: PomodoroConfig = {
        focus: 25 * 60,  // 25 minutes
        short: 5 * 60,   // 5 minutes
        long: 10 * 60    // 10 minutes
    };

    private currentMode: PomodoroMode = 'focus';
    private timeRemaining: number;
    private isRunning: boolean = false;
    private intervalId: number | null = null;

    constructor() {
        this.timeRemaining = this.config.focus;
    }

    init(): void {
        this.bindEvents();
        this.updateDisplay();
    }

    private bindEvents(): void {
        // Mode buttons
        const modeButtons = document.querySelectorAll('.pomodoro-mode');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const mode = target.dataset.mode as PomodoroMode;
                if (mode) {
                    this.setMode(mode);
                }
            });
        });

        // Start button
        const startBtn = document.getElementById('pomodoro-start');
        startBtn?.addEventListener('click', () => {
            if (this.isRunning) {
                this.pause();
            } else {
                this.start();
            }
        });

        // Reset button
        const resetBtn = document.getElementById('pomodoro-reset');
        resetBtn?.addEventListener('click', () => this.reset());
    }

    private setMode(mode: PomodoroMode): void {
        this.currentMode = mode;
        this.timeRemaining = this.config[mode];
        this.isRunning = false;

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        // Update UI
        const modeButtons = document.querySelectorAll('.pomodoro-mode');
        modeButtons.forEach(btn => {
            btn.classList.remove('active');
            if ((btn as HTMLElement).dataset.mode === mode) {
                btn.classList.add('active');
            }
        });

        const startBtn = document.getElementById('pomodoro-start');
        if (startBtn) startBtn.textContent = 'Start';

        this.updateDisplay();
        this.updateLabel();
    }

    private start(): void {
        this.isRunning = true;
        const startBtn = document.getElementById('pomodoro-start');
        if (startBtn) startBtn.textContent = 'Pause';

        this.intervalId = window.setInterval(() => {
            this.timeRemaining--;
            this.updateDisplay();

            if (this.timeRemaining <= 0) {
                this.complete();
            }
        }, 1000);
    }

    private pause(): void {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        const startBtn = document.getElementById('pomodoro-start');
        if (startBtn) startBtn.textContent = 'Start';
    }

    private reset(): void {
        this.timeRemaining = this.config[this.currentMode];
        this.pause();
        this.updateDisplay();
    }

    private complete(): void {
        this.pause();
        this.playAlarm();

        // Show notification
        if (Notification.permission === 'granted') {
            new Notification('Pomodoro Complete!', {
                body: `Your ${this.getModeLabel()} session is complete.`,
                icon: '/vite.svg'
            });
        }
    }

    private playAlarm(): void {
        // Create a simple beep sound using Web Audio API
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    private updateDisplay(): void {
        const display = document.getElementById('pomodoro-time');
        if (display) {
            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = this.timeRemaining % 60;
            display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    private updateLabel(): void {
        const label = document.getElementById('pomodoro-label');
        if (label) {
            label.textContent = this.getModeLabel();
        }
    }

    private getModeLabel(): string {
        switch (this.currentMode) {
            case 'focus': return 'Focus Time';
            case 'short': return 'Short Break';
            case 'long': return 'Long Break';
        }
    }
}
