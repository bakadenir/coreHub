import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { habitsApi, notesApi, linksApi, schedulesApi } from '../lib';
import type { Habit, Note, LinkItem, ScheduleEvent } from '../types';
import { useToast } from '../context/ToastContext';

interface ActivityCardsProps {
    refreshTrigger?: number; // increment this to trigger a refresh
}

export default function ActivityCards({ refreshTrigger = 0 }: ActivityCardsProps) {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch all data in parallel
            const [habitsRes, schedulesRes, notesRes, linksRes] = await Promise.all([
                habitsApi.getAll(),
                schedulesApi.getAll(),
                notesApi.getAll(),
                linksApi.getAll()
            ]);

            if (habitsRes.success && habitsRes.data) {
                setHabits(habitsRes.data.slice(0, 3));
            }

            if (schedulesRes.success && schedulesRes.data) {
                // Filter to only show today and future schedules
                const now = new Date();
                now.setHours(0, 0, 0, 0); // Start of today
                const upcomingSchedules = schedulesRes.data.filter(event => {
                    const eventDate = new Date(event.startTime);
                    return eventDate >= now;
                });
                // Sort by date ascending and take first 3
                upcomingSchedules.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
                setSchedule(upcomingSchedules.slice(0, 3));
            }

            if (notesRes.success && notesRes.data) {
                setNotes(notesRes.data.slice(0, 2));
            }

            if (linksRes.success && linksRes.data) {
                setLinks(linksRes.data.slice(0, 3));
            }
        } catch (error) {
            console.error('Failed to fetch activity data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData, refreshTrigger]);

    // Handle habit toggle
    const handleHabitToggle = async (habitId: string, currentlyCompleted: boolean) => {
        try {
            if (currentlyCompleted) {
                await habitsApi.uncomplete(habitId);
            } else {
                await habitsApi.complete(habitId);
                showToast('Habit completed! 🎉', 'success');
            }
            // Refresh habits after toggle
            const habitsRes = await habitsApi.getAll();
            if (habitsRes.success && habitsRes.data) {
                setHabits(habitsRes.data.slice(0, 3));
            }
        } catch {
            showToast('Failed to update habit', 'error');
        }
    };

    // Format time from ISO string or time field
    const formatTime = (event: ScheduleEvent) => {
        // Try parsing startTime if available (from API)
        const startTime = (event as unknown as { startTime?: string }).startTime;
        if (startTime) {
            try {
                return new Date(startTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
            } catch {
                return startTime;
            }
        }
        // Fallback to time field
        return event.time || '--:--';
    };

    const linkColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 min-h-[160px] animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-3 bg-gray-100 rounded w-full"></div>
                            <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Habit Tracker */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors relative group min-h-[160px]">
                <button
                    onClick={() => navigate('/habits')}
                    className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                >
                    <span className="material-icons-outlined text-lg">open_in_full</span>
                </button>
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-icons-outlined text-gray-500">check_circle</span>
                    <h4 className="font-bold text-gray-900">Habit Tracker</h4>
                </div>
                {habits.length === 0 ? (
                    <p className="text-sm text-gray-400 font-light">No habits yet. Add your first habit!</p>
                ) : (
                    <ul className="space-y-3 pl-1">
                        {habits.map((habit) => (
                            <li key={habit.id} className="flex items-center gap-3 text-sm text-gray-600">
                                <input
                                    checked={habit.completed}
                                    onChange={() => handleHabitToggle(habit.id, habit.completed)}
                                    className="form-checkbox h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                                    type="checkbox"
                                />
                                <span className={`${habit.completed ? 'line-through text-gray-400' : ''} font-light`}>
                                    {habit.name}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Schedule */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors relative group min-h-[160px]">
                <button
                    onClick={() => navigate('/schedule')}
                    className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                >
                    <span className="material-icons-outlined text-lg">open_in_full</span>
                </button>
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-icons-outlined text-gray-500">schedule</span>
                    <h4 className="font-bold text-gray-900">Schedule</h4>
                </div>
                {schedule.length === 0 ? (
                    <p className="text-sm text-gray-400 font-light">No upcoming events. Add a schedule!</p>
                ) : (
                    <ul className="space-y-3">
                        {schedule.map((item) => {
                            // Format date and time
                            const eventDate = new Date(item.startTime);
                            const dateStr = eventDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                            const timeStr = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                            return (
                                <li key={item.id} className="flex gap-3 text-sm">
                                    <span className="font-mono text-xs font-bold pt-0.5 text-gray-400 whitespace-nowrap">
                                        {dateStr} {timeStr}
                                    </span>
                                    <span className="text-gray-700 font-light truncate">
                                        {item.title}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Notes */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors relative group min-h-[160px]">
                <button
                    onClick={() => navigate('/notes')}
                    className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                >
                    <span className="material-icons-outlined text-lg">open_in_full</span>
                </button>
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-icons-outlined text-gray-500">description</span>
                    <h4 className="font-bold text-gray-900">Notes</h4>
                </div>
                {notes.length === 0 ? (
                    <p className="text-sm text-gray-400 font-light">No notes yet. Create your first note!</p>
                ) : (
                    <div className="space-y-2">
                        {notes.map((note) => (
                            <div key={note.id} className="p-2.5 bg-gray-50 rounded border border-gray-100">
                                <p className="text-xs font-bold text-gray-800 mb-1">
                                    {note.title}
                                </p>
                                <p className="text-[11px] text-gray-500 line-clamp-1 font-light">
                                    {note.content}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* List Link */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors relative group min-h-[160px]">
                <button
                    onClick={() => navigate('/links')}
                    className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                >
                    <span className="material-icons-outlined text-lg">open_in_full</span>
                </button>
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-icons-outlined text-gray-500">link</span>
                    <h4 className="font-bold text-gray-900">List Link</h4>
                </div>
                {links.length === 0 ? (
                    <p className="text-sm text-gray-400 font-light">No links saved. Add your first link!</p>
                ) : (
                    <ul className="space-y-2">
                        {links.map((link, idx) => (
                            <li key={link.id}>
                                <a
                                    className="flex items-center justify-between p-2 rounded hover:bg-gray-50 group/link transition-colors"
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className={`w-1.5 h-1.5 rounded-full ${linkColors[idx % linkColors.length]}`}></div>
                                        <span className="text-sm font-medium text-gray-700 truncate font-light">
                                            {link.title}
                                        </span>
                                    </div>
                                    <span className="material-icons-outlined text-[14px] text-gray-300 group-hover/link:text-primary">
                                        arrow_outward
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
