import { useState, useEffect } from 'react';

interface ClockWidgetProps {
    showSeconds?: boolean;
    className?: string;
    compact?: boolean;
}

export default function ClockWidget({ showSeconds = false, className = '', compact = false }: ClockWidgetProps) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');

    const formatDate = () => {
        return time.toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const timeClasses = compact
        ? 'text-4xl sm:text-5xl md:text-6xl'
        : 'text-[8rem] sm:text-[10rem] md:text-[12rem]';

    return (
        <div className={`text-center ${className}`}>
            <h2 className={`${timeClasses} leading-none font-mono font-bold text-primary tracking-tighter`}>
                {hours}:{minutes}
                {showSeconds && <>:{seconds}</>}
            </h2>
            <div className={compact ? 'mt-2' : 'mt-4 space-y-2'}>
                <p className={compact ? 'text-sm font-medium text-gray-700' : 'text-xl md:text-2xl font-medium text-gray-900'}>
                    {formatDate()}
                </p>
            </div>
        </div>
    );
}
