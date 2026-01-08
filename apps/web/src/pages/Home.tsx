import { useState, useCallback, useEffect } from 'react';
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
import ActivityCards from '../components/ActivityCards';
import AddHabitModal from '../components/AddHabitModal';
import AddScheduleModal from '../components/AddScheduleModal';
import AddNoteModal from '../components/AddNoteModal';
import AddLinkModal from '../components/AddLinkModal';
import PomodoroTimer from '../components/PomodoroTimer';
import ClockWidget from '../components/ClockWidget';
import LocationWidget from '../components/LocationWidget';
import { schedulesApi } from '../lib';
import { ScheduleEventListSkeleton } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';
import { GripVertical, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Plus, CalendarDays, FileEdit, Link as LinkIcon, CalendarX, CalendarClock, MapPin, ListTodo } from 'lucide-react';

const WIDGET_ORDER_KEY = 'corehub_widget_order_v4';
const GREETING_SHOWN_KEY = 'corehub_greeting_shown';

type WidgetId = 'time' | 'quickAction' | 'calendar' | 'pomodoro';

interface ScheduleItem {
    id: string;
    title: string;
    startTime: string;
    endTime?: string;
    location?: string;
    description?: string;
}

// DragHandle type for widgets
interface DragHandleProps {
    titleProps: React.HTMLAttributes<HTMLDivElement>;
    icon: React.ReactNode;
}

// Sortable widget wrapper - passes dragHandle to children
function SortableWidget({
    id,
    children,
    isMain
}: {
    id: string;
    children: (dragHandle: DragHandleProps) => React.ReactNode;
    isMain?: boolean
}) {
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

    // Drag handle: returns object with titleProps (for row) and icon (just the indicator)
    // Usage: wrap entire title row with titleProps, show dragIcon next to title
    const dragHandle = {
        // Props to spread on title row div to make it draggable
        titleProps: {
            ...attributes,
            ...listeners,
            className: "flex items-center mb-4 cursor-grab active:cursor-grabbing select-none group/title",
        },
        // Just the drag indicator icon
        icon: (
            <span className="ml-2 opacity-0 group-hover/title:opacity-100 transition-opacity inline-flex items-center">
                <GripVertical size={20} className="text-gray-400" />
            </span>
        ),
    };

    return (
        <div ref={setNodeRef} style={style} className={`relative group/widget ${isMain ? 'flex-1 flex flex-col' : 'h-full'}`}>
            {children(dragHandle)}
        </div>
    );
}

export default function Home() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);

    // Modal states
    const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
    const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
    const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
    const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);

    // Toast for greeting
    const { showToast } = useToast();

    // Show greeting for new users (first time visiting dashboard)
    useEffect(() => {
        const hasSeenGreeting = localStorage.getItem(GREETING_SHOWN_KEY);
        if (!hasSeenGreeting) {
            // Small delay to let page render first
            const timer = setTimeout(() => {
                showToast('Welcome to coreHub! Your productivity journey starts now 🚀', 'success');
                localStorage.setItem(GREETING_SHOWN_KEY, 'true');
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    // Widget order: first item is main (big), rest are sidebar
    const [widgetOrder, setWidgetOrder] = useState<WidgetId[]>(() => {
        try {
            const saved = localStorage.getItem(WIDGET_ORDER_KEY);
            if (saved) return JSON.parse(saved);
        } catch { /* ignore */ }
        return ['time', 'quickAction', 'calendar', 'pomodoro'];
    });

    // Save to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(WIDGET_ORDER_KEY, JSON.stringify(widgetOrder));
        } catch { /* ignore */ }
    }, [widgetOrder]);

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setWidgetOrder((items) => {
                const oldIndex = items.indexOf(active.id as WidgetId);
                const newIndex = items.indexOf(over.id as WidgetId);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }, []);

    const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

    const handleDateHover = useCallback((date: Date | null) => {
        setHoveredDate(date);
    }, []);

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

    // Calendar helpers
    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const navigateMonth = (direction: number) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));

    const today = new Date();
    const isCurrentMonth = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
    const todayDay = today.getDate();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    const handleDayHover = (day: number | null) => {
        if (day !== null) {
            handleDateHover(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
        } else {
            handleDateHover(null);
        }
    };

    const handleModalClose = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        setter(false);
        triggerRefresh();
    };

    const formatTime = (isoString: string) => {
        if (!isoString) return '';
        try {
            return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        } catch { return isoString; }
    };

    const formatDateHeader = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Widget renderers - dragHandle is placed next to titles
    const renderWidget = (widgetId: WidgetId, isMain: boolean, dragHandle?: DragHandleProps) => {
        switch (widgetId) {
            case 'time':
                return isMain ? (
                    <div className="z-10 text-center transform transition-transform duration-500 group-hover:scale-[1.02] flex-1 flex flex-col items-center justify-center">
                        <ClockWidget />
                        <div className="mt-2"><LocationWidget /></div>
                    </div>
                ) : (
                    <div className="bg-[#fdfdfd] border border-gray-200 rounded-xl p-5 shadow-sm h-full flex flex-col min-h-[180px] relative overflow-hidden group">
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                            backgroundSize: '24px 24px',
                        }}></div>
                        <div {...dragHandle?.titleProps}>
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Time</h2>
                            {dragHandle?.icon}
                        </div>
                        <div className="text-center py-2 flex-1 flex flex-col justify-center">
                            <ClockWidget compact />
                            <div className="mt-2 pb-4"><LocationWidget /></div>
                        </div>
                    </div>
                );

            case 'pomodoro':
                return isMain ? (
                    <PomodoroTimer isMain />
                ) : <PomodoroTimer dragHandle={dragHandle} />;

            case 'quickAction':
                return (
                    <div className={isMain ? "z-10 flex-1 flex items-center justify-center" : "bg-[#fdfdfd] border border-gray-200 rounded-xl p-5 shadow-sm h-full flex flex-col relative overflow-hidden group"}>
                        {!isMain && (
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                                backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                                backgroundSize: '24px 24px',
                            }}></div>
                        )}
                        {!isMain && (
                            <div {...dragHandle?.titleProps}>
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Quick Action</h2>
                                {dragHandle?.icon}
                            </div>
                        )}
                        <nav className={isMain ? "grid grid-cols-2 gap-3 max-w-lg" : "space-y-1 flex-1 flex flex-col justify-center"}>
                            {[
                                { icon: <ListTodo size={isMain ? 20 : 14} />, label: 'Add Todo List' },
                                { icon: <CalendarDays size={isMain ? 20 : 14} />, label: 'Add Schedule' },
                                { icon: <Plus size={isMain ? 20 : 14} />, label: 'Add Habit' },
                                { icon: <FileEdit size={isMain ? 20 : 14} />, label: 'Add Notes' },
                                { icon: <LinkIcon size={isMain ? 20 : 14} />, label: 'Add Link' },
                            ].map((action, index) => (
                                <button
                                    key={action.label}
                                    onClick={() => {
                                        if (action.label === 'Add Habit') setIsAddHabitOpen(true);
                                        if (action.label === 'Add Schedule') setIsAddScheduleOpen(true);
                                        if (action.label === 'Add Notes') setIsAddNoteOpen(true);
                                        if (action.label === 'Add Link') setIsAddLinkOpen(true);
                                        if (action.label === 'Add Todo List') window.location.href = '/todos';
                                    }}
                                    className={`flex items-center gap-3 ${isMain ? 'px-5 py-3 text-sm border border-gray-200' : 'w-full px-2 py-2 text-sm'} font-medium text-gray-700 rounded-lg hover:bg-surface-light transition-all group ${isMain && index === 0 ? 'col-span-2 justify-center' : ''}`}
                                >
                                    <span className={`flex items-center justify-center ${isMain ? 'w-8 h-8' : 'w-5 h-5'} rounded bg-gray-100 text-gray-500 group-hover:bg-[#fdfdfd] group-hover:text-zinc-900 transition-colors`}>
                                        {action.icon}
                                    </span>
                                    {action.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                );

            case 'calendar':
                return (
                    <div
                        className={isMain ? "z-10 flex-1 flex flex-col" : "bg-[#fdfdfd] border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col relative overflow-hidden group"}
                        onMouseLeave={() => handleDayHover(null)}
                    >
                        {!isMain && (
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                                backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                                backgroundSize: '24px 24px',
                            }}></div>
                        )}
                        <div className={isMain ? "flex flex-col lg:flex-row lg:items-stretch flex-1" : ""}>
                            {/* Calendar Grid */}
                            <div className={isMain ? "lg:w-1/2 flex flex-col" : ""}>
                                {/* Title + Navigation Row */}
                                {isMain ? (
                                    <>
                                        {/* Main: Title on its own row */}
                                        <div
                                            className={`flex items-center mb-3 ${dragHandle ? 'cursor-grab active:cursor-grabbing select-none group/title' : ''}`}
                                            {...(dragHandle ? Object.fromEntries(Object.entries(dragHandle.titleProps).filter(([k]) => k !== 'className')) : {})}
                                        >
                                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Calendar</h2>
                                            {dragHandle?.icon}
                                        </div>
                                        {/* Main: Month navigation centered on its own row */}
                                        <div className="flex items-center justify-center gap-1 mb-4">
                                            <button onClick={() => navigateMonth(-12)} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Previous year">
                                                <ChevronsLeft size={14} className="text-gray-400" />
                                            </button>
                                            <button onClick={() => navigateMonth(-1)} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Previous month">
                                                <ChevronLeft size={14} className="text-gray-500" />
                                            </button>
                                            <span className="text-xs font-mono text-gray-500 min-w-[120px] text-center">
                                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
                                            </span>
                                            <button onClick={() => navigateMonth(1)} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Next month">
                                                <ChevronRight size={14} className="text-gray-500" />
                                            </button>
                                            <button onClick={() => navigateMonth(12)} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Next year">
                                                <ChevronsRight size={14} className="text-gray-400" />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    /* Sidebar: Original format - title and nav on same row */
                                    <div className="flex items-center justify-between mb-4">
                                        <div
                                            className={`flex items-center ${dragHandle ? 'cursor-grab active:cursor-grabbing select-none group/title' : ''}`}
                                            {...(dragHandle ? Object.fromEntries(Object.entries(dragHandle.titleProps).filter(([k]) => k !== 'className')) : {})}
                                        >
                                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Calendar</h2>
                                            {dragHandle?.icon}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => navigateMonth(-1)} className="p-1 hover:bg-gray-100 rounded transition-colors">
                                                <ChevronLeft size={14} className="text-gray-500" />
                                            </button>
                                            <span className="text-xs font-mono text-gray-500 min-w-[80px] text-center">
                                                {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                                            </span>
                                            <button onClick={() => navigateMonth(1)} className="p-1 hover:bg-gray-100 rounded transition-colors">
                                                <ChevronRight size={14} className="text-gray-500" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Days Header */}
                                <div className={`grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2 font-medium`}>
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <div key={i}>{day}</div>)}
                                </div>

                                {/* Dates Grid */}
                                <div className={`grid grid-cols-7 gap-1 text-center ${isMain ? 'text-base' : 'text-sm'}`}>
                                    {/* Empty placeholders for alignment */}
                                    {[...Array(firstDay)].map((_, i) => (
                                        <div key={`empty-${i}`} className={`${isMain ? 'aspect-square w-10' : 'aspect-square w-8'}`}></div>
                                    ))}
                                    {[...Array(daysInMonth)].map((_, i) => {
                                        const day = i + 1;
                                        const isToday = isCurrentMonth && day === todayDay;
                                        return (
                                            <div
                                                key={day}
                                                onMouseEnter={() => handleDayHover(day)}
                                                className={`${isMain ? 'aspect-square w-10' : 'aspect-square w-8'} flex items-center justify-center rounded-lg transition-all cursor-default ${isToday ? 'bg-primary text-white font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}
                                            >
                                                {day}
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-gray-400 text-center mt-3">Hover on a date to preview schedule</p>
                            </div>

                            {/* Inline Schedule Preview - only shown when Calendar is main */}
                            {isMain && (
                                <div className="lg:w-1/2 border-t lg:border-t-0 lg:border-l border-gray-200 pt-4 lg:pt-0 lg:pl-6 lg:pb-4 mt-4 lg:mt-0 flex flex-col justify-center">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                                        {hoveredDate ? 'Schedule' : 'Select a date'}
                                    </h3>
                                    {hoveredDate ? (
                                        <>
                                            <p className="text-base font-medium text-gray-700 mb-3">{formatDateHeader(hoveredDate)}</p>
                                            {isLoadingSchedules ? (
                                                <div className="flex-1">
                                                    <ScheduleEventListSkeleton count={3} />
                                                </div>
                                            ) : schedules.length === 0 ? (
                                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                                    <CalendarX size={36} className="mb-2" />
                                                    <p className="text-sm font-medium">No schedule for this day</p>
                                                </div>
                                            ) : (
                                                <div className="flex-1 overflow-y-auto space-y-2">
                                                    {schedules.map((schedule) => (
                                                        <div key={schedule.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono font-bold text-primary">{formatTime(schedule.startTime)}</span>
                                                                <span className="font-medium text-gray-900">{schedule.title}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                            <CalendarClock size={36} className="mb-2" />
                                            <p className="text-sm">Hover over a date to see schedule</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const mainWidget = widgetOrder[0];
    const sidebarWidgets = widgetOrder.slice(1);
    // Only show schedule preview in main area when Calendar is NOT the main widget
    const isShowingSchedule = hoveredDate !== null && mainWidget !== 'calendar';

    const widgetLabels: Record<WidgetId, string> = {
        time: 'Time',
        pomodoro: 'Pomodoro',
        quickAction: 'Quick Action',
        calendar: 'Calendar',
    };

    return (
        <main className="flex-1 flex flex-col h-full relative overflow-y-auto">
            <AddHabitModal isOpen={isAddHabitOpen} onClose={() => handleModalClose(setIsAddHabitOpen)} />
            <AddScheduleModal isOpen={isAddScheduleOpen} onClose={() => handleModalClose(setIsAddScheduleOpen)} />
            <AddNoteModal isOpen={isAddNoteOpen} onClose={() => handleModalClose(setIsAddNoteOpen)} />
            <AddLinkModal isOpen={isAddLinkOpen} onClose={() => handleModalClose(setIsAddLinkOpen)} />

            <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
                        {/* Main Layout: Sidebar + Right Column using Grid for height matching */}
                        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr] gap-6 items-stretch">
                            {/* Sidebar - 3 widgets stacked, stretch to full height */}
                            <aside className="flex flex-col gap-6 h-full">
                                {sidebarWidgets.map((widgetId, index) => (
                                    <div key={widgetId} className={index === sidebarWidgets.length - 1 ? 'flex-1 flex flex-col [&>*]:h-full' : ''}>
                                        <SortableWidget id={widgetId}>
                                            {(dragHandle) => renderWidget(widgetId, false, dragHandle)}
                                        </SortableWidget>
                                    </div>
                                ))}
                            </aside>

                            {/* Right Column: Main Widget + Activity Cards */}
                            <div className="flex flex-col gap-6">
                                {/* Main Widget - stretches to fill space */}
                                {isShowingSchedule ? (
                                    <section className="bg-[#fdfdfd] border border-gray-200 rounded-xl p-5 shadow-sm flex-1 flex flex-col relative overflow-hidden group">
                                        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
                                            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                                            backgroundSize: '24px 24px',
                                        }}></div>
                                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Schedule</h2>
                                        <div className="text-center mb-4">
                                            <p className="text-lg font-medium text-gray-900">{formatDateHeader(hoveredDate)}</p>
                                        </div>
                                        {isLoadingSchedules ? (
                                            <div className="flex-1 p-4">
                                                <ScheduleEventListSkeleton count={4} />
                                            </div>
                                        ) : schedules.length === 0 ? (
                                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                                <CalendarX size={48} className="mb-3" />
                                                <p className="text-base font-medium">No schedule for this day</p>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex items-center justify-center">
                                                <div className="grid grid-cols-2 gap-3 w-full max-w-2xl">
                                                    {schedules.slice(0, 6).map((schedule) => (
                                                        <div key={schedule.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                                                            <div className="flex items-start gap-3">
                                                                <div className="text-center min-w-[50px]">
                                                                    <span className="text-base font-mono font-bold text-primary">{formatTime(schedule.startTime)}</span>
                                                                    {schedule.endTime && (
                                                                        <>
                                                                            <div className="text-xs text-gray-400">to</div>
                                                                            <span className="text-xs font-mono text-gray-500">{formatTime(schedule.endTime)}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-bold text-gray-900 mb-1 truncate">{schedule.title}</h4>
                                                                    {schedule.location && (
                                                                        <div className="flex items-center gap-1 text-sm text-gray-500 truncate">
                                                                            <MapPin size={12} className="shrink-0" />
                                                                            <span className="truncate">{schedule.location}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {schedules.length > 6 && (
                                                        <div className="col-span-2 text-center text-sm text-gray-400 mt-2">
                                                            +{schedules.length - 6} more schedules
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </section>
                                ) : (
                                    <SortableWidget id={mainWidget} isMain>
                                        {(dragHandle) => mainWidget === 'calendar' ? (
                                            // Calendar has its own container
                                            <div className="relative group flex-1 bg-[#fdfdfd] border border-gray-200 rounded-xl p-5 shadow-sm overflow-hidden">
                                                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
                                                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                                                    backgroundSize: '24px 24px',
                                                }}></div>
                                                {renderWidget(mainWidget, true, dragHandle)}
                                            </div>
                                        ) : mainWidget === 'pomodoro' ? (
                                            // Pomodoro - use section container like other widgets
                                            <section className="bg-[#fdfdfd] border border-gray-200 rounded-xl p-5 flex flex-col relative overflow-hidden shadow-sm group flex-1">
                                                <div {...(dragHandle ? dragHandle.titleProps : { className: 'flex items-center mb-4' })}>
                                                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                                        {widgetLabels[mainWidget]}
                                                    </h2>
                                                    {dragHandle?.icon}
                                                </div>
                                                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
                                                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                                                    backgroundSize: '24px 24px',
                                                }}></div>
                                                {renderWidget(mainWidget, true)}
                                            </section>
                                        ) : (
                                            <section className="bg-[#fdfdfd] border border-gray-200 rounded-xl p-5 flex flex-col relative overflow-hidden shadow-sm group flex-1">
                                                <div {...(dragHandle ? dragHandle.titleProps : { className: 'flex items-center mb-4' })}>
                                                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                                        {widgetLabels[mainWidget]}
                                                    </h2>
                                                    {dragHandle?.icon}
                                                </div>
                                                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
                                                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                                                    backgroundSize: '24px 24px',
                                                }}></div>
                                                {renderWidget(mainWidget, true)}
                                            </section>
                                        )}
                                    </SortableWidget>
                                )}

                                {/* Activity Cards - fixed at bottom */}
                                <section className="shrink-0">
                                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                        Your Activity
                                        <span className="h-px bg-gray-200 flex-1 ml-2"></span>
                                    </h3>
                                    <ActivityCards refreshTrigger={refreshTrigger} />
                                </section>
                            </div>
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        </main>
    );
}
