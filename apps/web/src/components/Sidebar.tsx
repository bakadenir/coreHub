import { useState, useEffect, useCallback } from 'react';
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
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AddHabitModal from './AddHabitModal';
import AddScheduleModal from './AddScheduleModal';
import AddNoteModal from './AddNoteModal';
import AddLinkModal from './AddLinkModal';
import AddTodoListModal from './AddTodoListModal';
import PomodoroTimer from './PomodoroTimer';
import ClockWidget from './ClockWidget';
import LocationWidget from './LocationWidget';
import { GripVertical, Maximize2, CheckCircle, Calendar, FileText, Link as LinkIcon, ChevronLeft, ChevronRight, ListTodo } from 'lucide-react';

interface SidebarProps {
    onDataChange?: () => void;
    onDateHover?: (date: Date | null) => void;
    featuredWidget: string;
    onFeaturedWidgetChange: (widgetId: string) => void;
}

type WidgetId = 'quickAction' | 'calendar' | 'pomodoro' | 'time';

const WIDGET_ORDER_KEY = 'corehub_sidebar_widget_order_v3';

// Sortable wrapper component
function SortableWidget({ id, children, onPromote }: { id: string; children: React.ReactNode; onPromote?: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group/widget">
            {/* Drag handle & promote button */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover/widget:opacity-100 transition-opacity z-10">
                <div
                    {...attributes}
                    {...listeners}
                    className="px-2 py-1 bg-gray-100 rounded-full cursor-grab active:cursor-grabbing shadow-sm"
                >
                    <GripVertical size={12} className="text-gray-400" />
                </div>
                {onPromote && (
                    <button
                        onClick={onPromote}
                        className="px-2 py-1 bg-primary text-white rounded-full shadow-sm hover:bg-zinc-800 transition-colors"
                        title="Move to main area"
                    >
                        <Maximize2 size={12} />
                    </button>
                )}
            </div>
            {children}
        </div>
    );
}

export default function Sidebar({ onDataChange, onDateHover, featuredWidget, onFeaturedWidgetChange }: SidebarProps) {
    const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
    const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
    const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);

    const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
    const [isAddTodoListOpen, setIsAddTodoListOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Widget order state (only sidebar widgets)
    const [sidebarOrder, setSidebarOrder] = useState<WidgetId[]>(() => {
        try {
            const saved = localStorage.getItem(WIDGET_ORDER_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch {
            // Ignore
        }
        return ['quickAction', 'calendar', 'pomodoro'];
    });

    // Get sidebar widgets (excluding featured)
    const visibleSidebarWidgets = sidebarOrder.filter(w => w !== featuredWidget);

    // Save order to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(WIDGET_ORDER_KEY, JSON.stringify(sidebarOrder));
        } catch {
            // Ignore
        }
    }, [sidebarOrder]);

    // DnD sensors
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

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setSidebarOrder((items) => {
                const oldIndex = items.indexOf(active.id as WidgetId);
                const newIndex = items.indexOf(over.id as WidgetId);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }, []);

    // Update current date at midnight
    useEffect(() => {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const msUntilMidnight = tomorrow.getTime() - now.getTime();

        const timeout = setTimeout(() => {
            setCurrentDate(new Date());
        }, msUntilMidnight);

        return () => clearTimeout(timeout);
    }, []);

    // Handle modal close with data change notification
    const handleModalClose = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        setter(false);
        if (onDataChange) {
            onDataChange();
        }
    };

    // Handle date hover
    const handleDayHover = (day: number | null) => {
        if (onDateHover) {
            if (day !== null) {
                const hoveredDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                onDateHover(hoveredDate);
            } else {
                onDateHover(null);
            }
        }
    };

    // Calendar helpers
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const formatMonth = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
    };

    const navigateMonth = (direction: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    };

    const today = new Date();
    const isCurrentMonth = currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();
    const todayDay = today.getDate();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const prevMonthDays = getDaysInMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    // Widget components (compact versions for sidebar)
    const widgets: Record<WidgetId, React.ReactNode> = {
        time: (
            <div className="bg-[#fdfdfd] border border-gray-200 rounded-xl p-5 shadow-sm">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
                    Time
                </h2>
                <div className="text-center">
                    <ClockWidget compact />
                    <div className="mt-3">
                        <LocationWidget />
                    </div>
                </div>
            </div>
        ),
        quickAction: (
            <div className="bg-surface-light border border-gray-200 rounded-xl p-5 shadow-sm">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                    Quick Action
                </h2>
                <nav className="space-y-2">
                    {[
                        { icon: ListTodo, label: 'Add Todo List' },
                        { icon: Calendar, label: 'Add Schedule' },
                        { icon: CheckCircle, label: 'Add Habit' },
                        { icon: FileText, label: 'Add Notes' },
                        { icon: LinkIcon, label: 'Add Link' },
                    ].map((action) => {
                        const IconComponent = action.icon;
                        return (
                            <button
                                key={action.label}
                                onClick={() => {
                                    if (action.label === 'Add Habit') setIsAddHabitOpen(true);
                                    if (action.label === 'Add Schedule') setIsAddScheduleOpen(true);
                                    if (action.label === 'Add Notes') setIsAddNoteOpen(true);
                                    if (action.label === 'Add Link') setIsAddLinkOpen(true);
                                    if (action.label === 'Add Todo List') setIsAddTodoListOpen(true);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-surface-light transition-all group"
                            >
                                <span className="flex items-center justify-center w-6 h-6 rounded bg-gray-100 text-gray-500 group-hover:bg-[#fdfdfd] group-hover:text-zinc-900 transition-colors">
                                    <IconComponent size={16} />
                                </span>
                                {action.label}
                            </button>
                        );
                    })}
                </nav>
            </div>
        ),
        calendar: (
            <div
                className="bg-[#fdfdfd] border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col"
                onMouseLeave={() => handleDayHover(null)}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                        Calendar
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigateMonth(-1)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                            <ChevronLeft size={14} className="text-gray-500" />
                        </button>
                        <span className="text-xs font-mono text-gray-500 min-w-[80px] text-center">
                            {formatMonth(currentDate)}
                        </span>
                        <button
                            onClick={() => navigateMonth(1)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                            <ChevronRight size={14} className="text-gray-500" />
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2 font-medium">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i}>{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {[...Array(firstDay)].map((_, i) => (
                        <div key={`prev-${i}`} className="p-2 text-gray-300">
                            {prevMonthDays - firstDay + i + 1}
                        </div>
                    ))}
                    {[...Array(daysInMonth)].map((_, i) => {
                        const day = i + 1;
                        const isToday = isCurrentMonth && day === todayDay;
                        return (
                            <div
                                key={day}
                                onMouseEnter={() => handleDayHover(day)}
                                className={`p-2 rounded transition-all cursor-default ${isToday
                                    ? 'bg-primary text-white font-semibold'
                                    : 'hover:bg-gray-100 text-gray-600'
                                    }`}
                            >
                                {day}
                            </div>
                        );
                    })}
                </div>
                <p className="text-xs text-gray-400 text-center mt-3">
                    Hover on a date to preview schedule
                </p>
            </div>
        ),
        pomodoro: <PomodoroTimer />,
    };

    return (
        <aside className="lg:col-span-3 space-y-6 flex flex-col">
            <AddHabitModal isOpen={isAddHabitOpen} onClose={() => handleModalClose(setIsAddHabitOpen)} />
            <AddScheduleModal isOpen={isAddScheduleOpen} onClose={() => handleModalClose(setIsAddScheduleOpen)} />
            <AddNoteModal isOpen={isAddNoteOpen} onClose={() => handleModalClose(setIsAddNoteOpen)} />

            <AddLinkModal isOpen={isAddLinkOpen} onClose={() => handleModalClose(setIsAddLinkOpen)} />
            <AddTodoListModal isOpen={isAddTodoListOpen} onClose={() => handleModalClose(setIsAddTodoListOpen)} />

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={visibleSidebarWidgets} strategy={verticalListSortingStrategy}>
                    {visibleSidebarWidgets.map((widgetId) => (
                        <SortableWidget
                            key={widgetId}
                            id={widgetId}
                            onPromote={() => onFeaturedWidgetChange(widgetId)}
                        >
                            {widgets[widgetId]}
                        </SortableWidget>
                    ))}
                </SortableContext>
            </DndContext>
        </aside>
    );
}
