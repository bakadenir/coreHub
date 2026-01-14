import { useState, useEffect } from 'react';
import ActivityCards from './ActivityCards';
import ClockWidget from './ClockWidget';
import LocationWidget from './LocationWidget';
import PomodoroTimer from './PomodoroTimer';
import { schedulesApi } from '../lib';
import { CalendarX, MapPin, Minimize2 } from 'lucide-react';
import type { PanelId } from '../lib/activity-config';

interface DashboardProps {
    refreshTrigger?: number;
    hoveredDate?: Date | null;
    featuredWidget: string;
    onDemoteWidget: () => void;
    panelOrder: PanelId[];
    onOrderChange: (newOrder: PanelId[]) => void;
}

interface ScheduleItem {
    id: string;
    title: string;
    startTime: string;
    endTime?: string;
    location?: string;
    description?: string;
}

export default function Dashboard({ refreshTrigger = 0, hoveredDate = null, featuredWidget, onDemoteWidget, panelOrder, onOrderChange }: DashboardProps) {
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
                        startTime: s.startTime || s.time || '',
                        endTime: s.endTime,
                        location: s.location,
                        description: s.description
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

    // Widget labels for header
    const widgetLabels: Record<string, string> = {
        time: 'Time',
        pomodoro: 'Pomodoro',
        quickAction: 'Quick Action',
        calendar: 'Calendar',
    };

    // Render featured widget content
    const renderFeaturedWidget = () => {
        switch (featuredWidget) {
            case 'time':
                return (
                    <div className="z-10 text-center transform transition-transform duration-500 group-hover:scale-[1.02] flex-1 flex flex-col items-center justify-center">
                        <ClockWidget />
                        <div className="mt-2">
                            <LocationWidget />
                        </div>
                    </div>
                );
            case 'pomodoro':
                return (
                    <div className="z-10 flex-1 flex items-center justify-center">
                        <div className="w-full max-w-md">
                            <PomodoroTimer />
                        </div>
                    </div>
                );
            case 'quickAction':
                return (
                    <div className="z-10 flex-1 flex flex-col items-center justify-center">
                        <p className="text-gray-500 mb-4">Quick actions are better used from the sidebar</p>
                        <button
                            onClick={onDemoteWidget}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-zinc-800"
                        >
                            Move back to sidebar
                        </button>
                    </div>
                );
            case 'calendar':
                return (
                    <div className="z-10 flex-1 flex flex-col items-center justify-center">
                        <p className="text-gray-500 mb-4">Calendar is better used from the sidebar</p>
                        <button
                            onClick={onDemoteWidget}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-zinc-800"
                        >
                            Move back to sidebar
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Schedule Preview - Only shows when hovering on calendar date */}
            {isShowingSchedule && (
                <section className="bg-[#fdfdfd] border border-gray-200 rounded-xl p-5 shadow-sm min-h-[300px] flex flex-col">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                        Schedule
                    </h2>

                    <div className="text-center mb-4">
                        <p className="text-lg font-medium text-gray-900">
                            {formatDateHeader(hoveredDate)}
                        </p>
                    </div>

                    {isLoadingSchedules ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
                        </div>
                    ) : schedules.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <CalendarX size={48} className="mb-3" />
                            <p className="text-base font-medium">No schedule for this day</p>
                            <p className="text-sm">Hover over another date or add a new schedule</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto">
                            <div className={`grid gap-4 ${schedules.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : schedules.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                                {schedules.slice(0, 3).map((schedule) => (
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
                                                        <MapPin size={14} />
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
                            {schedules.length > 3 && (
                                <p className="text-center text-sm text-gray-400 mt-4">
                                    +{schedules.length - 3} more schedule(s)
                                </p>
                            )}
                        </div>
                    )}
                </section>
            )}

            {/* Featured Widget Display - Only shows when NOT hovering on calendar */}
            {!isShowingSchedule && (
                <section className="bg-[#fdfdfd] border border-gray-200 rounded-xl p-5 flex flex-col relative overflow-hidden shadow-sm group min-h-[250px]">
                    {/* Header with demote button */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                            {widgetLabels[featuredWidget] || 'Widget'}
                        </h2>
                        <button
                            onClick={onDemoteWidget}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Move to sidebar"
                        >
                            <Minimize2 size={18} />
                        </button>
                    </div>

                    {/* Background pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.05] pointer-events-none"
                        style={{
                            backgroundImage: `radial-gradient(
                    circle at 1px 1px,
                    currentColor 1px,
                    transparent 0
                  )`,
                            backgroundSize: '24px 24px',
                        }}
                    ></div>

                    {renderFeaturedWidget()}
                </section>
            )}

            {/* Activity Cards Section */}
            <section>
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                    Your Activity
                    <span className="h-px bg-gray-200 flex-1 ml-2"></span>
                </h3>
                <ActivityCards refreshTrigger={refreshTrigger} panelOrder={panelOrder} onOrderChange={onOrderChange} />
            </section>
        </div>
    );
}
