import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
            className={`bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors relative group min-h-[160px] ${isDragging ? 'shadow-lg' : ''}`}
        >
            <button
                onClick={() => onNavigate(config.route)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors z-10"
            >
                <span className="material-icons-outlined text-lg">open_in_full</span>
            </button>

            {/* Draggable Header */}
            <div
                {...attributes}
                {...listeners}
                className="flex items-center gap-2 mb-4 cursor-grab active:cursor-grabbing select-none group/header"
            >
                <span className="relative w-6 h-6 flex items-center justify-center">
                    {/* Panel icon - visible by default, hidden on hover */}
                    <span className="material-icons-outlined text-gray-500 absolute inset-0 flex items-center justify-center group-hover/header:opacity-0 transition-opacity">{config.icon}</span>
                    {/* Drag indicator - hidden by default, visible on hover */}
                    <span className="material-icons-outlined text-gray-400 absolute inset-0 flex items-center justify-center opacity-0 group-hover/header:opacity-100 transition-opacity">drag_indicator</span>
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
                setHabits(habitsRes.data.slice(0, 3));
            }

            if (schedulesRes.success && schedulesRes.data) {
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const upcomingSchedules = schedulesRes.data.filter(event => {
                    const eventDate = new Date(event.startTime);
                    return eventDate >= now;
                });
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

    // Save order to localStorage when it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(panelOrder));
        }
    }, [panelOrder]);

    // Handle drag start (kept for potential future use, no-op now)
    const handleDragStart = (_event: DragStartEvent) => {
        // Previously set activeId for DragOverlay
    };

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
                setHabits(habitsRes.data.slice(0, 3));
            }
        } catch {
            showToast('Failed to update habit', 'error');
        }
    };

    const linkColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];

    // Render panel content based on ID
    const renderPanelContent = (panelId: PanelId) => {
        switch (panelId) {
            case 'habits':
                return habits.length === 0 ? (
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
                );

            case 'schedule':
                return schedule.length === 0 ? (
                    <p className="text-sm text-gray-400 font-light">No upcoming events. Add a schedule!</p>
                ) : (
                    <ul className="space-y-3">
                        {schedule.map((item) => {
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
                );

            case 'notes':
                return notes.length === 0 ? (
                    <p className="text-sm text-gray-400 font-light">No notes yet. Create your first note!</p>
                ) : (
                    <div className="space-y-2">
                        {notes.map((note) => (
                            <div key={note.id} className="p-2.5 bg-gray-50 rounded border border-gray-100">
                                <p className="text-xs font-bold text-gray-800 mb-1">
                                    {note.title}
                                </p>
                                <p className="text-xs text-gray-500 line-clamp-1 font-light">
                                    {note.content}
                                </p>
                            </div>
                        ))}
                    </div>
                );

            case 'links':
                return links.length === 0 ? (
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
                );
        }
    };

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
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
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
