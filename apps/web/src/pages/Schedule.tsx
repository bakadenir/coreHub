import { useState, useEffect, useCallback } from 'react';
import AddScheduleModal from '../components/AddScheduleModal';
import EditScheduleModal from '../components/EditScheduleModal';
import ActionMenu from '../components/ActionMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import { schedulesApi } from '../lib';
import type { ScheduleEvent } from '../types';
import { LoadingSpinner, EmptyState, ErrorState } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';

export default function Schedule() {
    const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
    const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');
    const { showToast } = useToast();

    // Delete confirmation state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<ScheduleEvent | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Calculate start/end of current month for filtering
            const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            const result = await schedulesApi.getAll({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                view
            });
            if (result.success && result.data) {
                setEvents(result.data);
            } else {
                setError(result.error || 'Failed to fetch events');
            }
        } catch {
            setError('Network error');
        } finally {
            setIsLoading(false);
        }
    }, [currentDate, view]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleEdit = (event: ScheduleEvent) => {
        setEditingEvent(event);
        setIsEditScheduleOpen(true);
    };

    const handleDeleteClick = (event: ScheduleEvent) => {
        setEventToDelete(event);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!eventToDelete) return;

        setIsDeleting(true);
        try {
            const result = await schedulesApi.delete(String(eventToDelete.id));
            if (result.success) {
                showToast('Event deleted successfully', 'success');
                fetchEvents();
            } else {
                showToast(result.error || 'Failed to delete event', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        } finally {
            setIsDeleting(false);
            setDeleteConfirmOpen(false);
            setEventToDelete(null);
        }
    };

    const getActionMenuItems = (event: ScheduleEvent) => [
        {
            label: 'Edit',
            icon: 'edit',
            onClick: () => handleEdit(event),
        },
        {
            label: 'Delete',
            icon: 'delete',
            onClick: () => handleDeleteClick(event),
            variant: 'danger' as const,
        },
    ];

    // Calendar helpers
    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => {
        const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        return day === 0 ? 6 : day - 1; // Monday = 0
    };

    const formatMonthYear = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const navigateMonth = (direction: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    };

    const today = new Date();
    const isCurrentMonth = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
    const todayDay = today.getDate();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const prevMonthDays = getDaysInMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    // Get events for a specific day
    const getEventsForDay = (day: number) => {
        return events.filter(event => {
            const eventDate = new Date(event.startTime);
            return eventDate.getDate() === day &&
                eventDate.getMonth() === currentDate.getMonth() &&
                eventDate.getFullYear() === currentDate.getFullYear();
        });
    };

    // Get today's and upcoming events for agenda
    const getTodayEvents = () => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        return events.filter(event => {
            const eventDate = new Date(event.startTime);
            return eventDate >= todayStart && eventDate <= todayEnd;
        }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    };

    const getUpcomingEvents = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        return events.filter(event => {
            const eventDate = new Date(event.startTime);
            return eventDate >= tomorrow;
        }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).slice(0, 5);
    };

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const formatAgendaDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const getEventColor = (index: number) => {
        const colors = ['border-l-blue-500', 'border-l-green-500', 'border-l-purple-500', 'border-l-orange-500', 'border-l-pink-500'];
        return colors[index % colors.length];
    };

    return (
        <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light">
            <AddScheduleModal isOpen={isAddScheduleOpen} onClose={() => { setIsAddScheduleOpen(false); fetchEvents(); }} />
            <EditScheduleModal
                isOpen={isEditScheduleOpen}
                onClose={() => { setIsEditScheduleOpen(false); setEditingEvent(null); fetchEvents(); }}
                event={editingEvent}
            />
            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => { setDeleteConfirmOpen(false); setEventToDelete(null); }}
                onConfirm={handleDeleteConfirm}
                title="Delete Event"
                message={`Are you sure you want to delete "${eventToDelete?.title}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                isLoading={isDeleting}
            />
            <header className="flex flex-col gap-4 p-6 border-b border-border-light bg-white shrink-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-text-primary text-3xl font-extrabold tracking-tight flex items-center gap-3">
                            Schedule {formatMonthYear(currentDate)}
                            <div className="flex gap-1 ml-2">
                                <button
                                    onClick={() => navigateMonth(-1)}
                                    className="p-1 rounded-full hover:bg-gray-100 text-text-secondary transition-colors"
                                >
                                    <span className="material-icons-outlined text-xl">chevron_left</span>
                                </button>
                                <button
                                    onClick={() => navigateMonth(1)}
                                    className="p-1 rounded-full hover:bg-gray-100 text-text-secondary transition-colors"
                                >
                                    <span className="material-icons-outlined text-xl">chevron_right</span>
                                </button>
                            </div>
                        </h2>
                        <p className="text-text-secondary text-base font-normal">Manage your time and upcoming events.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setIsAddScheduleOpen(true)}
                            className="flex items-center justify-center rounded-lg h-10 px-5 bg-primary hover:bg-text-primary text-white gap-2 text-sm font-bold shadow-sm transition-all shadow-gray-200/50"
                        >
                            <span className="material-icons-outlined text-[20px]">add</span>
                            <span className="whitespace-nowrap">Add Schedule</span>
                        </button>
                    </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    <div className="flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 border border-transparent self-start">
                        {(['month', 'week', 'day'] as const).map((v) => (
                            <label key={v} className="cursor-pointer">
                                <input
                                    className="peer sr-only"
                                    name="view-toggle"
                                    type="radio"
                                    value={v}
                                    checked={view === v}
                                    onChange={() => setView(v)}
                                />
                                <div className="h-full px-4 py-2 rounded-[4px] flex items-center justify-center peer-checked:bg-white peer-checked:shadow-sm peer-checked:text-black text-text-secondary text-xs font-semibold transition-all capitalize">
                                    {v}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </header>
            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 flex flex-col overflow-y-auto bg-white">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <LoadingSpinner message="Loading events..." />
                        </div>
                    ) : error ? (
                        <div className="flex-1 flex items-center justify-center">
                            <ErrorState message={error} onRetry={fetchEvents} />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-7 border-b border-border-light">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                    <div key={day} className="py-3 text-center text-xs font-bold uppercase text-text-secondary tracking-wider">{day}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 flex-1 min-h-[600px] auto-rows-fr bg-border-light gap-[1px] border-b border-border-light">
                                {/* Previous Month Days */}
                                {[...Array(firstDay)].map((_, i) => (
                                    <div key={`prev-${i}`} className="bg-gray-50 p-2 flex flex-col gap-1 min-h-[120px]">
                                        <span className="text-text-secondary/50 font-mono text-sm p-1">{prevMonthDays - firstDay + i + 1}</span>
                                    </div>
                                ))}

                                {/* Current Month Days */}
                                {[...Array(daysInMonth)].map((_, i) => {
                                    const day = i + 1;
                                    const dayEvents = getEventsForDay(day);
                                    const isToday = isCurrentMonth && day === todayDay;
                                    return (
                                        <div key={day} className="bg-white p-2 flex flex-col gap-1 min-h-[120px] group hover:bg-gray-50 transition-colors relative">
                                            <span className={`text-text-primary font-mono text-sm font-medium p-1 ${isToday ? 'flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white shadow-md shadow-gray-500/30' : ''}`}>
                                                {day}
                                            </span>
                                            {dayEvents.slice(0, 3).map((event, idx) => (
                                                <div
                                                    key={event.id}
                                                    onClick={() => handleEdit(event)}
                                                    className={`bg-gray-50 border-l-2 ${getEventColor(idx)} text-gray-700 text-xs font-medium p-1 px-2 rounded-r-md truncate cursor-pointer hover:opacity-80 mb-0.5 flex items-center justify-between group/event`}
                                                    title={event.title}
                                                >
                                                    <span className="truncate">{formatTime(event.startTime)} {event.title}</span>
                                                    <div className="opacity-0 group-hover/event:opacity-100" onClick={(e) => e.stopPropagation()}>
                                                        <ActionMenu
                                                            items={getActionMenuItems(event)}
                                                            trigger={<span className="material-icons-outlined text-[12px]">more_vert</span>}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <div className="text-xs text-text-secondary pl-2">+{dayEvents.length - 3} more</div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Next Month Days */}
                                {[...Array((7 - ((firstDay + daysInMonth) % 7)) % 7)].map((_, i) => (
                                    <div key={`next-${i}`} className="bg-gray-50 p-2 min-h-[120px]">
                                        <span className="text-text-secondary/50 font-mono text-sm p-1">{String(i + 1).padStart(2, '0')}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Right Agenda Sidebar */}
                <aside className="w-[320px] hidden xl:flex flex-col border-l border-border-light bg-gray-50 overflow-y-auto">
                    <div className="p-5 border-b border-border-light sticky top-0 bg-gray-50 z-10 flex justify-between items-center">
                        <h3 className="text-base font-bold text-text-primary">Agenda</h3>
                        <span className="text-xs text-text-secondary">{events.length} events</span>
                    </div>
                    <div className="flex flex-col p-4 gap-6">
                        {/* Today */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold uppercase text-text-secondary tracking-wider">Today, {formatAgendaDate(new Date())}</span>
                                <div className="h-px flex-1 bg-border-light"></div>
                            </div>
                            {getTodayEvents().length === 0 ? (
                                <p className="text-xs text-text-secondary py-2">No events today</p>
                            ) : (
                                getTodayEvents().map(event => (
                                    <div key={event.id} className="group flex flex-col p-3 rounded-xl bg-white border border-border-light shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-mono text-xs font-medium text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded">{formatTime(event.startTime)}</span>
                                            <ActionMenu
                                                items={getActionMenuItems(event)}
                                                trigger={<span className="material-icons-outlined text-[16px]">more_horiz</span>}
                                                className="opacity-0 group-hover:opacity-100"
                                            />
                                        </div>
                                        <h4 className="text-sm font-bold text-text-primary mb-1">{event.title}</h4>
                                        {event.location && (
                                            <div className="flex items-center gap-1.5 text-text-secondary text-xs">
                                                <span className="material-icons-outlined text-[14px]">location_on</span>
                                                <span className="truncate">{event.location}</span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Upcoming */}
                        {getUpcomingEvents().length > 0 && (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold uppercase text-text-secondary tracking-wider">Upcoming</span>
                                    <div className="h-px flex-1 bg-border-light"></div>
                                </div>
                                {getUpcomingEvents().map(event => (
                                    <div key={event.id} className="group flex flex-col p-3 rounded-xl bg-white border border-border-light shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-mono text-xs font-medium text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded">
                                                {formatAgendaDate(new Date(event.startTime))} {formatTime(event.startTime)}
                                            </span>
                                            <ActionMenu
                                                items={getActionMenuItems(event)}
                                                trigger={<span className="material-icons-outlined text-[16px]">more_horiz</span>}
                                                className="opacity-0 group-hover:opacity-100"
                                            />
                                        </div>
                                        <h4 className="text-sm font-bold text-text-primary mb-1">{event.title}</h4>
                                        {event.description && <p className="text-xs text-text-secondary mb-2 line-clamp-1">{event.description}</p>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {events.length === 0 && !isLoading && (
                            <EmptyState message="No events this month" icon="event" />
                        )}
                    </div>
                    <div className="mt-auto p-4 border-t border-border-light">
                        <div className="flex items-center gap-3 text-text-secondary text-xs">
                            <span className="material-icons-outlined text-sm">check_circle</span>
                            <p>Connected to database</p>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}
