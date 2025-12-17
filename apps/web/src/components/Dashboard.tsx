import { useState, useEffect } from 'react';
import ActivityCards from './ActivityCards';
import ClockWidget from './ClockWidget';
import LocationWidget from './LocationWidget';
import { schedulesApi } from '../lib';

interface DashboardProps {
    refreshTrigger?: number;
    hoveredDate?: Date | null;
}

interface ScheduleItem {
    id: string;
    title: string;
    startTime: string;
    endTime?: string;
    location?: string;
    description?: string;
}

export default function Dashboard({ refreshTrigger = 0, hoveredDate = null }: DashboardProps) {
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);

    // Fetch schedules when hoveredDate changes
    useEffect(() => {
        if (!hoveredDate) {
            setSchedules([]);
            return;
        }

        const fetchSchedules = async () => {
            setIsLoadingSchedules(true);
            try {
                // Create start and end of day for filtering
                const startOfDay = new Date(hoveredDate);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(hoveredDate);
                endOfDay.setHours(23, 59, 59, 999);

                const result = await schedulesApi.getAll({
                    startDate: startOfDay.toISOString(),
                    endDate: endOfDay.toISOString()
                });
                if (result.success && result.data) {
                    setSchedules(result.data.map(s => ({
                        id: s.id?.toString() || '',
                        title: s.title,
                        startTime: (s as unknown as { startTime?: string }).startTime || s.time || '',
                        endTime: (s as unknown as { endTime?: string }).endTime,
                        location: (s as unknown as { location?: string }).location,
                        description: (s as unknown as { description?: string }).description
                    })));
                } else {
                    setSchedules([]);
                }
            } catch {
                setSchedules([]);
            } finally {
                setIsLoadingSchedules(false);
            }
        };

        fetchSchedules();
    }, [hoveredDate]);

    const formatTime = (isoString: string) => {
        if (!isoString) return '';
        try {
            return new Date(isoString).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } catch {
            return isoString;
        }
    };

    const formatDateHeader = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const isShowingSchedule = hoveredDate !== null;

    return (
        <div className="lg:col-span-9 flex flex-col gap-6">
            <section className="flex-1 min-h-[400px] bg-white border border-gray-200 rounded-xl p-5 flex flex-col relative overflow-hidden shadow-sm group">
                {/* Title */}
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                    {isShowingSchedule ? 'Schedule' : 'Time'}
                </h2>

                {/* Background pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(
                circle at 1px 1px,
                currentColor 1px,
                transparent 0
              )`,
                        backgroundSize: '24px 24px',
                    }}
                ></div>

                {/* Content */}
                {isShowingSchedule ? (
                    // Schedule view
                    <div className="z-10 flex-1 flex flex-col">
                        <div className="text-center mb-6">
                            <p className="text-xl font-medium text-gray-900">
                                {formatDateHeader(hoveredDate)}
                            </p>
                        </div>

                        {isLoadingSchedules ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
                            </div>
                        ) : schedules.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <span className="material-icons-outlined text-6xl mb-4">event_busy</span>
                                <p className="text-lg font-medium">No schedule for this day</p>
                                <p className="text-sm">Hover over another date or add a new schedule</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto space-y-3">
                                {schedules.map((schedule) => (
                                    <div
                                        key={schedule.id}
                                        className="bg-gray-50 border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="text-center min-w-[60px]">
                                                <span className="text-lg font-mono font-bold text-primary">
                                                    {formatTime(schedule.startTime)}
                                                </span>
                                                {schedule.endTime && (
                                                    <>
                                                        <div className="text-xs text-gray-400">to</div>
                                                        <span className="text-sm font-mono text-gray-500">
                                                            {formatTime(schedule.endTime)}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 mb-1">{schedule.title}</h4>
                                                {schedule.location && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                                                        <span className="material-icons-outlined text-[14px]">location_on</span>
                                                        {schedule.location}
                                                    </div>
                                                )}
                                                {schedule.description && (
                                                    <p className="text-sm text-gray-600 line-clamp-2">{schedule.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    // Clock view (default)
                    <div className="z-10 text-center transform transition-transform duration-500 group-hover:scale-[1.02] flex-1 flex flex-col items-center justify-center">
                        <ClockWidget />
                        <div className="mt-2">
                            <LocationWidget />
                        </div>
                    </div>
                )}
            </section>

            <section>
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                    Your Activity
                    <span className="h-px bg-gray-200 flex-1 ml-2"></span>
                </h3>
                <ActivityCards refreshTrigger={refreshTrigger} />
            </section>
        </div>
    );
}
