import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { habitsApi, todosApi } from '../lib';
import type { Habit, Note, LinkItem, ScheduleEvent, Todo } from '../types';
import { useToast } from '../context/ToastContext';
import { useDashboard } from '../hooks/useDashboard';
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
import { Maximize2, GripVertical, ArrowUpRight, Circle, CheckCircle2 } from 'lucide-react';
import type { PanelId, PanelConfig } from '../lib/activity-config';
import { panelConfigs } from '../lib/activity-config';

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
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                backgroundSize: '24px 24px',
            }}></div>
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

export interface ActivityCardsProps {
    refreshTrigger?: number;
    panelOrder: PanelId[];
    onOrderChange: (newOrder: PanelId[]) => void;
}

export default function ActivityCards({ refreshTrigger = 0, panelOrder, onOrderChange }: ActivityCardsProps) {
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Use SWR hook for cached data with background sync
    const {
        habits: cachedHabits,
        schedules: cachedSchedules,
        notes: cachedNotes,
        links: cachedLinks,
        todos: cachedTodos,
        isLoading: dashboardLoading,
        refresh: refreshDashboard
    } = useDashboard();

    // Local state synced from SWR
    const [habits, setHabits] = useState<Habit[]>([]);
    const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [todos, setTodos] = useState<Todo[]>([]);

    // Sync SWR data to local state
    useEffect(() => {
        if (cachedHabits.length > 0 || !dashboardLoading) setHabits(cachedHabits);
    }, [cachedHabits, dashboardLoading]);

    useEffect(() => {
        if (cachedSchedules.length > 0 || !dashboardLoading) setSchedule(cachedSchedules);
    }, [cachedSchedules, dashboardLoading]);

    useEffect(() => {
        if (cachedNotes.length > 0 || !dashboardLoading) setNotes(cachedNotes);
    }, [cachedNotes, dashboardLoading]);

    useEffect(() => {
        if (cachedLinks.length > 0 || !dashboardLoading) setLinks(cachedLinks);
    }, [cachedLinks, dashboardLoading]);

    useEffect(() => {
        if (cachedTodos.length > 0 || !dashboardLoading) setTodos(cachedTodos);
    }, [cachedTodos, dashboardLoading]);

    // Refresh on refreshTrigger change
    useEffect(() => {
        if (refreshTrigger > 0) {
            refreshDashboard();
        }
    }, [refreshTrigger, refreshDashboard]);

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




    // Handle drag end
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = panelOrder.indexOf(active.id as PanelId);
            const newIndex = panelOrder.indexOf(over.id as PanelId);
            onOrderChange(arrayMove(panelOrder, oldIndex, newIndex));
        }
    };

    // Handle habit toggle (Optimistic UI)
    const handleHabitToggle = async (habitId: string, currentlyCompleted: boolean) => {
        // Store previous state for rollback
        const previousHabits = [...habits];
        const newStatus = !currentlyCompleted;

        // Optimistic update - update UI immediately
        setHabits(prev => prev.map(h =>
            h.id === habitId ? { ...h, completed: newStatus } : h
        ));

        // Show toast immediately
        if (newStatus) {
            showToast('Habit completed! 🎉', 'success');
        }

        try {
            let result;
            if (currentlyCompleted) {
                result = await habitsApi.uncomplete(habitId);
            } else {
                result = await habitsApi.complete(habitId);
            }

            if (!result.success) {
                // Rollback on error
                setHabits(previousHabits);
                showToast('Failed to update habit', 'error');
            }
        } catch {
            // Rollback on network error
            setHabits(previousHabits);
            showToast('Failed to update habit', 'error');
        }
    };

    // Handle todo toggle (Optimistic UI)
    const handleTodoToggle = async (todo: Todo) => {
        // Store previous state for rollback
        const previousTodos = [...todos];
        const newStatus = !todo.isCompleted;

        // Optimistic update - update UI immediately
        setTodos(prev => prev.map(t =>
            t.id === todo.id ? { ...t, isCompleted: newStatus } : t
        ));

        // Show toast immediately
        const firstWord = todo.title.split(' ')[0];
        const statusText = newStatus ? 'Completed' : 'Uncompleted';
        showToast(`${firstWord} ${statusText} 🎉`, 'success');

        try {
            const result = await todosApi.toggle(todo.id);
            if (!result.success) {
                // Rollback on error
                setTodos(previousTodos);
                showToast(result.error || 'Failed to toggle todo', 'error');
            }
        } catch {
            // Rollback on network error
            setTodos(previousTodos);
            showToast('Network error', 'error');
        }
    };

    const linkColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-yellow-500'];

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

            case 'todos':
                return todos.length === 0 ? (
                    <p className="text-sm text-gray-500">No tasks yet. Add a task!</p>
                ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {todos.slice(0, 4).map((todo) => (
                            <div key={todo.id} className="p-2.5 bg-gray-50 rounded h-full flex items-center">
                                <label className="flex items-center gap-3 cursor-pointer select-none w-full group/todo">
                                    <div className={`shrink-0 transition-colors ${todo.isCompleted ? 'text-gray-900' : 'text-gray-300 group-hover/todo:text-gray-400'}`}>
                                        {todo.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                    </div>
                                    <input
                                        checked={todo.isCompleted}
                                        onChange={() => handleTodoToggle(todo)}
                                        className="sr-only"
                                        type="checkbox"
                                    />
                                    <span className={`text-sm truncate ${todo.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                        {todo.title}
                                    </span>
                                </label>
                            </div>
                        ))}
                    </div>
                );
        }
    };

    if (dashboardLoading && habits.length === 0) {
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
