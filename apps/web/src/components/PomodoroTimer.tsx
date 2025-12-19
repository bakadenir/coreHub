import { useState, useEffect, useCallback, useRef } from 'react';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface PomodoroConfig {
    focus: number;      // minutes
    shortBreak: number; // minutes
    longBreak: number;  // minutes
}

interface PomodoroState {
    mode: TimerMode;
    timeLeft: number;
    sessions: number;
    isRunning: boolean;
    lastUpdate: number; // timestamp
}

const DEFAULT_CONFIG: PomodoroConfig = {
    focus: 25,
    shortBreak: 5,
    longBreak: 10,
};

const STORAGE_KEY = 'corehub_pomodoro_state';

// Load state from localStorage
const loadState = (): Partial<PomodoroState> | null => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch {
        // Ignore parsing errors
    }
    return null;
};

// Save state to localStorage
const saveState = (state: PomodoroState) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Ignore storage errors
    }
};

// DragHandle type matching Home.tsx
interface DragHandleProps {
    titleProps: React.HTMLAttributes<HTMLDivElement>;
    icon: React.ReactNode;
}

interface PomodoroTimerProps {
    dragHandle?: DragHandleProps;
}

export default function PomodoroTimer({ dragHandle }: PomodoroTimerProps) {
    const savedState = useRef(loadState());

    // Initialize state from localStorage or defaults
    const [mode, setMode] = useState<TimerMode>(() => savedState.current?.mode || 'focus');
    const [timeLeft, setTimeLeft] = useState(() => {
        if (savedState.current?.timeLeft && savedState.current?.isRunning && savedState.current?.lastUpdate) {
            // Calculate elapsed time since last update
            const elapsed = Math.floor((Date.now() - savedState.current.lastUpdate) / 1000);
            const remaining = savedState.current.timeLeft - elapsed;
            return remaining > 0 ? remaining : 0;
        }
        return savedState.current?.timeLeft || DEFAULT_CONFIG.focus * 60;
    });
    const [isRunning, setIsRunning] = useState(() => {
        if (savedState.current?.isRunning && savedState.current?.lastUpdate) {
            const elapsed = Math.floor((Date.now() - savedState.current.lastUpdate) / 1000);
            const remaining = (savedState.current.timeLeft || 0) - elapsed;
            return remaining > 0;
        }
        return false;
    });
    const [sessions, setSessions] = useState(() => savedState.current?.sessions || 0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Get duration based on mode
    const getModeDuration = useCallback((m: TimerMode) => {
        return DEFAULT_CONFIG[m] * 60;
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        saveState({
            mode,
            timeLeft,
            sessions,
            isRunning,
            lastUpdate: Date.now()
        });
    }, [mode, timeLeft, sessions, isRunning]);

    // Switch mode
    const switchMode = useCallback((newMode: TimerMode) => {
        setMode(newMode);
        setTimeLeft(getModeDuration(newMode));
        setIsRunning(false);
    }, [getModeDuration]);

    // Start/Pause timer
    const toggleTimer = () => {
        setIsRunning(prev => !prev);
    };

    // Reset timer
    const resetTimer = () => {
        setTimeLeft(getModeDuration(mode));
        setIsRunning(false);
    };

    // Timer effect
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            // Timer finished
            setIsRunning(false);

            // Play notification sound
            if (audioRef.current) {
                audioRef.current.play().catch(() => { });
            }

            // Show notification if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Pomodoro Timer', {
                    body: mode === 'focus' ? 'Time for a break!' : 'Back to focus!',
                    icon: '/favicon.ico',
                });
            }

            // Auto-switch mode
            if (mode === 'focus') {
                const newSessions = sessions + 1;
                setSessions(newSessions);
                // After 4 focus sessions, take a long break
                if (newSessions % 4 === 0) {
                    switchMode('longBreak');
                } else {
                    switchMode('shortBreak');
                }
            } else {
                switchMode('focus');
            }
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, timeLeft, mode, sessions, switchMode]);

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Format time display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const modeButtons: { mode: TimerMode; label: string }[] = [
        { mode: 'focus', label: 'Focus' },
        { mode: 'shortBreak', label: 'Short Break' },
        { mode: 'longBreak', label: 'Long Break' },
    ];

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            {/* Hidden audio element for notification sound */}
            <audio ref={audioRef} preload="auto">
                <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQgALIHO4sd8bwUfbs/YbkmRKTKbzH8cXQY/h8R7EnMDUI64pPsAAHieAACAmYAA" type="audio/wav" />
            </audio>

            <div {...(dragHandle ? dragHandle.titleProps : { className: 'flex items-center mb-4' })}>
                <span className="text-sm font-bold uppercase tracking-wide text-gray-900">
                    Pomodoro
                </span>
                {dragHandle?.icon}
            </div>

            {/* Timer Display */}
            <div className="flex justify-center mb-6">
                <div className="text-5xl font-mono font-bold text-primary tracking-tighter py-2">
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Mode Selector */}
            <div className="flex gap-2 mb-6">
                {modeButtons.map(({ mode: m, label }) => (
                    <button
                        key={m}
                        onClick={() => switchMode(m)}
                        className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${mode === m
                            ? 'bg-gray-100 text-gray-900 border border-gray-200'
                            : 'hover:bg-gray-50 text-gray-500'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Control Buttons */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={toggleTimer}
                    className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all ${isRunning
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-primary text-white hover:opacity-90'
                        }`}
                >
                    {isRunning ? 'Pause' : 'Start'}
                </button>
                <button
                    onClick={resetTimer}
                    className="py-2 px-4 rounded-lg bg-transparent border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                    Reset
                </button>
            </div>

            {/* Status */}
            <div className="mt-5 flex items-center gap-2 justify-center text-xs text-gray-400">
                <span className="material-icons-outlined text-[14px]">
                    {isRunning ? 'timer' : 'notifications'}
                </span>
                {isRunning
                    ? `${mode === 'focus' ? 'Focus time' : 'Break time'} - stay focused!`
                    : 'Alarm when finished'
                }
            </div>
        </div>
    );
}
