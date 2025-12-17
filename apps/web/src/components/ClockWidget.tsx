import { useState, useEffect } from 'react';

interface ClockWidgetProps {
    showSeconds?: boolean;
    className?: string;
}

export default function ClockWidget({ showSeconds = false, className = '' }: ClockWidgetProps) {
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

    return (
        <div className={`text-center ${className}`}>
            <h2 className="text-[8rem] sm:text-[10rem] md:text-[12rem] leading-none font-mono font-bold text-primary tracking-tighter">
                {hours}:{minutes}
                {showSeconds && <>:{seconds}</>}
            </h2>
            <div className="mt-4 space-y-2">
                <p className="text-xl md:text-2xl font-medium text-gray-900">
                    {formatDate()}
                </p>
            </div>
        </div>
    );
}
