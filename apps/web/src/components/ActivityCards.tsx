import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { habitsApi, notesApi, linksApi, schedulesApi } from '../lib';
import type { Habit, Note, LinkItem, ScheduleEvent } from '../types';
import { useToast } from '../context/ToastContext';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { renderIcon } from '../lib/iconMap';
import { Maximize2, GripVertical, ArrowUpRight } from 'lucide-react';

interface ActivityCardsProps {
    refreshTrigger?: number;
}

// Panel configuration
type PanelId = 'habits' | 'schedule' | 'notes' | 'links';

interface PanelConfig {
    id: PanelId;
    title: string;
    icon: string;
    route: string;
}

const panelConfigs: Record<PanelId, PanelConfig> = {
    habits: { id: 'habits', title: 'Habit Tracker', icon: 'check_circle', route: '/habits' },
    schedule: { id: 'schedule', title: 'Schedule', icon: 'schedule', route: '/schedule' },
    notes: { id: 'notes', title: 'Notes', icon: 'description', route: '/notes' },
    links: { id: 'links', title: 'List Link', icon: 'link', route: '/links' },
};

const defaultOrder: PanelId[] = ['habits', 'schedule', 'notes', 'links'];
const STORAGE_KEY = 'activityPanelOrder';

// Sortable Panel Component
function SortablePanel({
    id,
    config,
    onNavigate,
    children
}: {
    id: PanelId;
    config: PanelConfig;
    onNavigate: (route: string) => void;
    children: React.ReactNode;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-[#fdfdfd] border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors relative group min-h-[140px] max-h-[180px] overflow-hidden ${isDragging ? 'shadow-lg' : ''}`}
        >
            <button
                onClick={() => onNavigate(config.route)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors z-10"
            >
                <Maximize2 size={18} />
            </button>

            {/* Draggable Header */}
            <div
                {...attributes}
                {...listeners}
                className="flex items-center gap-2 mb-4 cursor-grab active:cursor-grabbing select-none group/header"
            >
                <span className="relative w-6 h-6 flex items-center justify-center">
                    {/* Panel icon - visible by default, hidden on hover */}
                    <span className="absolute inset-0 flex items-center justify-center group-hover/header:opacity-0 transition-opacity">{renderIcon(config.icon, { size: 20, className: 'text-gray-500' })}</span>
                    {/* Drag indicator - hidden by default, visible on hover */}
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/header:opacity-100 transition-opacity"><GripVertical size={20} className="text-gray-400" /></span>
                </span>
                <h4 className="font-bold text-gray-900">{config.title}</h4>
            </div>

            {children}
        </div>
    );
}

export default function ActivityCards({ refreshTrigger = 0 }: ActivityCardsProps) {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Panel order state with localStorage persistence
    const [panelOrder, setPanelOrder] = useState<PanelId[]>(() => {
        if (typeof window === 'undefined') return defaultOrder;
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length === 4 &&
                    parsed.every((id: string) => defaultOrder.includes(id as PanelId))) {
                    return parsed as PanelId[];
                }
            }
        } catch (e) {
            console.error('Error loading panel order:', e);
        }
        return defaultOrder;
    });

    // Sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [habitsRes, schedulesRes, notesRes, linksRes] = await Promise.all([
                habitsApi.getAll(),
                schedulesApi.getAll(),
                notesApi.getAll(),
                linksApi.getAll()
            ]);

            if (habitsRes.success && habitsRes.data) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Modal uses 0=Mon, ... 6=Sun. JS uses 0=Sun, 1=Mon.
                // Convert JS day to Modal day: (day + 6) % 7
                const currentDayIndex = (new Date().getDay() + 6) % 7;

                const todaysHabits = habitsRes.data.filter(habit => {
                    // Check start date
                    if (habit.startDate) {
                        const start = new Date(habit.startDate);
                        start.setHours(0, 0, 0, 0);
                        if (today < start) return false;
                    }

                    // Check frequency
                    const freq = habit.frequency.toLowerCase();
                    if (freq === 'daily') return true;
                    if (freq === 'weekly') {
                        if (habit.specificDays && habit.specificDays.length > 0) {
                            return habit.specificDays.includes(currentDayIndex);
                        }
                        return false; // Weekly but no days selected -> hide
                    }
                    return true;
                });

                setHabits(todaysHabits);
            }

            if (schedulesRes.success && schedulesRes.data) {
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const upcomingSchedules = schedulesRes.data.filter(event => {
                    const eventDate = new Date(event.startTime);
                    return eventDate >= now;
                });
                upcomingSchedules.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
                setSchedule(upcomingSchedules);
            }

            if (notesRes.success && notesRes.data) {
                setNotes(notesRes.data);
            }

            if (linksRes.success && linksRes.data) {
                setLinks(linksRes.data);
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

    // Save order to localStorage when it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(panelOrder));
        }
    }, [panelOrder]);

    // Handle drag end
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setPanelOrder((items) => {
                const oldIndex = items.indexOf(active.id as PanelId);
                const newIndex = items.indexOf(over.id as PanelId);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Handle habit toggle
    const handleHabitToggle = async (habitId: string, currentlyCompleted: boolean) => {
        try {
            if (currentlyCompleted) {
                await habitsApi.uncomplete(habitId);
            } else {
                await habitsApi.complete(habitId);
                showToast('Habit completed! 🎉', 'success');
            }
            const habitsRes = await habitsApi.getAll();
            if (habitsRes.success && habitsRes.data) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const currentDayIndex = (new Date().getDay() + 6) % 7;

                const todaysHabits = habitsRes.data.filter(habit => {
                    if (habit.startDate) {
                        const start = new Date(habit.startDate);
                        start.setHours(0, 0, 0, 0);
                        if (today < start) return false;
                    }
                    const freq = habit.frequency.toLowerCase();
                    if (freq === 'daily') return true;
                    if (freq === 'weekly') {
                        if (habit.specificDays && habit.specificDays.length > 0) {
                            return habit.specificDays.includes(currentDayIndex);
                        }
                        return false;
                    }
                    return true;
                });
                setHabits(todaysHabits);
            }
        } catch {
            showToast('Failed to update habit', 'error');
        }
    };

    const linkColors = ['bg-zinc-900', 'bg-zinc-700', 'bg-zinc-500', 'bg-zinc-400'];

    // Render panel content based on ID
    const renderPanelContent = (panelId: PanelId) => {
        switch (panelId) {
            case 'habits':
                return habits.length === 0 ? (
                    <p className="text-sm text-gray-500">No habits yet. Add your first habit!</p>
                ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {habits.slice(0, 4).map((habit) => (
                            <div key={habit.id} className="p-2.5 bg-gray-50 rounded h-full flex items-center">
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <input
                                        checked={habit.completed}
                                        onChange={() => handleHabitToggle(habit.id, habit.completed)}
                                        className="form-checkbox h-4 w-4 shrink-0 accent-zinc-900 border-gray-300 rounded focus:ring-zinc-900 cursor-pointer"
                                        type="checkbox"
                                    />
                                    <span className={`text-sm truncate ${habit.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                        {habit.name}
                                    </span>
                                </label>
                            </div>
                        ))}
                    </div>
                );

            case 'schedule':
                return schedule.length === 0 ? (
                    <p className="text-sm text-gray-500">No upcoming events. Add a schedule!</p>
                ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {schedule.slice(0, 4).map((item) => {
                            const eventDate = new Date(item.startTime);
                            const dateStr = eventDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                            const timeStr = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                            return (
                                <div key={item.id} className="p-2.5 bg-gray-50 rounded flex items-center gap-3 group h-full">
                                    <span className="text-xs text-gray-500 shrink-0 min-w-[40px]">{dateStr}</span>
                                    <span className="text-sm font-bold text-gray-800 shrink-0">{timeStr}</span>
                                    <span className="text-gray-700 truncate font-medium text-sm">
                                        {item.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                );

            case 'notes':
                return notes.length === 0 ? (
                    <p className="text-sm text-gray-500">No notes yet. Create your first note!</p>
                ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {notes.slice(0, 4).map((note) => (
                            <Link
                                key={note.id}
                                to="/notes"
                                state={{ noteId: note.id }}
                                className="p-2.5 bg-gray-50 rounded h-full flex items-center transition-colors hover:bg-gray-100"
                            >
                                <p className="text-sm font-medium text-gray-700 line-clamp-2">
                                    {note.title || 'Untitled Note'}
                                </p>
                            </Link>
                        ))}
                    </div>
                );

            case 'links':
                return links.length === 0 ? (
                    <p className="text-sm text-gray-500">No links saved. Add your first link!</p>
                ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {links.slice(0, 4).map((link, idx) => (
                            <a
                                key={link.id}
                                className="p-2.5 bg-gray-50 rounded flex items-center justify-between group/link h-full transition-colors hover:bg-gray-100"
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className={`w-1.5 h-1.5 shrink-0 rounded-full ${linkColors[idx % linkColors.length]}`}></div>
                                    <span className="text-sm text-gray-700 truncate">
                                        {link.title}
                                    </span>
                                </div>
                                <ArrowUpRight size={14} className="shrink-0 text-gray-300 group-hover/link:text-primary transition-colors" />
                            </a>
                        ))}
                    </div>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-[#fdfdfd] border border-gray-200 rounded-xl p-5 min-h-[160px]">
                        {/* Header skeleton */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="w-6 h-6 bg-gray-100 rounded-full animate-pulse"></div>
                        </div>
                        {/* Content skeleton */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-32 h-3 bg-gray-100 rounded animate-pulse"></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-28 h-3 bg-gray-100 rounded animate-pulse"></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-36 h-3 bg-gray-100 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={panelOrder} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {panelOrder.map((panelId) => (
                        <SortablePanel
                            key={panelId}
                            id={panelId}
                            config={panelConfigs[panelId]}
                            onNavigate={navigate}
                        >
                            {renderPanelContent(panelId)}
                        </SortablePanel>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
