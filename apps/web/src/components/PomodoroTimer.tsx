import { useState, useEffect, useCallback } from 'react';

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
    isMain?: boolean;
}

// Play alarm sound using Web Audio API (~3 seconds)
const playAlarmSound = () => {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Chime pattern: multiple tones with increasing pitch
        const playTone = (frequency: number, startTime: number, duration: number) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            // Envelope: quick attack, sustain, fade out
            const now = audioContext.currentTime + startTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
            gainNode.gain.setValueAtTime(0.3, now + duration - 0.1);
            gainNode.gain.linearRampToValueAtTime(0, now + duration);

            oscillator.start(now);
            oscillator.stop(now + duration);
        };

        // Play a pleasant chime pattern (3 repeats, ~3 seconds total)
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (C major chord)

        for (let repeat = 0; repeat < 3; repeat++) {
            const baseTime = repeat * 1.0;
            notes.forEach((freq, i) => {
                playTone(freq, baseTime + i * 0.15, 0.4);
            });
        }

        // Close audio context after sound finishes
        setTimeout(() => audioContext.close(), 4000);
    } catch (e) {
        console.warn('Could not play alarm sound:', e);
    }
};

// Get initial saved state once (outside component to avoid re-running on each render)
const getInitialState = () => {
    const saved = loadState();
    if (!saved) {
        return {
            mode: 'focus' as TimerMode,
            timeLeft: DEFAULT_CONFIG.focus * 60,
            isRunning: false,
            sessions: 0,
        };
    }

    let timeLeft = saved.timeLeft || DEFAULT_CONFIG.focus * 60;
    let isRunning = false;

    // Calculate elapsed time if timer was running
    if (saved.isRunning && saved.lastUpdate && saved.timeLeft) {
        const elapsed = Math.floor((Date.now() - saved.lastUpdate) / 1000);
        const remaining = saved.timeLeft - elapsed;
        timeLeft = remaining > 0 ? remaining : 0;
        isRunning = remaining > 0;
    }

    return {
        mode: saved.mode || 'focus' as TimerMode,
        timeLeft,
        isRunning,
        sessions: saved.sessions || 0,
    };
};

export default function PomodoroTimer({ dragHandle, isMain = false }: PomodoroTimerProps) {
    // Use lazy initialization to get initial state only once
    const [initialState] = useState(getInitialState);

    // Initialize state from cached initial state
    const [mode, setMode] = useState<TimerMode>(initialState.mode);
    const [timeLeft, setTimeLeft] = useState(initialState.timeLeft);
    const [isRunning, setIsRunning] = useState(initialState.isRunning);
    const [sessions, setSessions] = useState(initialState.sessions);

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
            playAlarmSound();

            // Show notification if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Pomodoro Timer', {
                    body: mode === 'focus' ? 'Time for a break!' : 'Back to focus!',
                    icon: '/pomodoro-icon.png',
                    badge: '/pomodoro-icon.png',
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

    // Size classes based on isMain
    const timerClasses = isMain
        ? 'text-[8rem] sm:text-[10rem] md:text-[12rem]'
        : 'text-5xl';
    const buttonClasses = isMain
        ? 'py-3 px-8 text-base'
        : 'py-2 px-4 text-sm';
    const modeButtonClasses = isMain
        ? 'py-2 text-sm'
        : 'py-1 text-xs';

    const content = (
        <>
            {/* Title - only show if not main or if dragHandle exists */}
            {(!isMain || dragHandle) && (
                <div {...(dragHandle ? dragHandle.titleProps : { className: 'flex items-center mb-4' })}>
                    <span className="text-sm font-bold uppercase tracking-wide text-gray-900">
                        Pomodoro
                    </span>
                    {dragHandle?.icon}
                </div>
            )}

            {/* Timer Display */}
            <div className={`flex justify-center ${isMain ? 'mb-8' : 'mb-6'}`}>
                <div className={`${timerClasses} leading-none font-mono font-bold text-primary tracking-tighter`}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Mode Selector */}
            <div className={`flex ${isMain ? 'gap-4 max-w-lg mx-auto mb-8' : 'gap-2 mb-6'}`}>
                {modeButtons.map(({ mode: m, label }) => (
                    <button
                        key={m}
                        onClick={() => switchMode(m)}
                        className={`flex-1 ${modeButtonClasses} font-medium rounded transition-colors ${mode === m
                            ? 'bg-gray-100 text-gray-900 border border-gray-200'
                            : 'hover:bg-gray-50 text-gray-500'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Control Buttons */}
            <div className={`grid grid-cols-2 ${isMain ? 'gap-4 max-w-md mx-auto' : 'gap-3'}`}>
                <button
                    onClick={toggleTimer}
                    className={`${buttonClasses} rounded-lg font-semibold transition-all ${isRunning
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-primary text-white hover:opacity-90'
                        }`}
                >
                    {isRunning ? 'Pause' : 'Start'}
                </button>
                <button
                    onClick={resetTimer}
                    className={`${buttonClasses} rounded-lg bg-transparent border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors`}
                >
                    Reset
                </button>
            </div>

            {/* Status */}
            <div className={`${isMain ? 'mt-8 text-sm' : 'mt-5 text-xs'} flex items-center gap-2 justify-center text-gray-400`}>
                <span className="material-icons-outlined text-[14px]">
                    {isRunning ? 'timer' : 'notifications'}
                </span>
                {isRunning
                    ? `${mode === 'focus' ? 'Focus time' : 'Break time'} - stay focused!`
                    : 'Alarm when finished'
                }
            </div>
        </>
    );

    // If isMain, don't wrap with container (parent already has it)
    if (isMain) {
        return <div className="flex flex-col items-center justify-center flex-1 p-4">{content}</div>;
    }

    // Sidebar version with container
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            {content}
        </div>
    );
}
