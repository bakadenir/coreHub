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
import Header from '../components/Header';
import NavigationSidebar from '../components/NavigationSidebar';
import ActivityCards from '../components/ActivityCards';
import AddHabitModal from '../components/AddHabitModal';
import AddScheduleModal from '../components/AddScheduleModal';
import AddNoteModal from '../components/AddNoteModal';
import AddLinkModal from '../components/AddLinkModal';
import PomodoroTimer from '../components/PomodoroTimer';
import ClockWidget from '../components/ClockWidget';
import LocationWidget from '../components/LocationWidget';
import { schedulesApi } from '../lib';

const WIDGET_ORDER_KEY = 'corehub_widget_order_v4';

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
                <span className="material-icons-outlined text-gray-400">drag_indicator</span>
            </span>
        ),
    };

    return (
        <div ref={setNodeRef} style={style} className={`relative group/widget ${isMain ? 'flex-1 flex flex-col' : ''}`}>
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
                        startTime: (s as any).startTime || s.time || '',
                        endTime: (s as any).endTime,
                        location: (s as any).location,
                        description: (s as any).description
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
    const formatMonth = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
    const navigateMonth = (direction: number) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));

    const today = new Date();
    const isCurrentMonth = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
    const todayDay = today.getDate();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const prevMonthDays = getDaysInMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

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
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <div {...dragHandle?.titleProps}>
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Time</h2>
                            {dragHandle?.icon}
                        </div>
                        <div className="text-center py-2">
                            <ClockWidget compact />
                            <div className="mt-2"><LocationWidget /></div>
                        </div>
                    </div>
                );

            case 'pomodoro':
                return isMain ? (
                    <div className="z-10 flex-1 flex items-center justify-center">
                        <div className="w-full max-w-md"><PomodoroTimer /></div>
                    </div>
                ) : <PomodoroTimer dragHandle={dragHandle} />;

            case 'quickAction':
                return (
                    <div className={isMain ? "z-10 flex-1 flex items-center justify-center" : "bg-white border border-gray-200 rounded-xl p-5 shadow-sm"}>
                        {!isMain && (
                            <div {...dragHandle?.titleProps}>
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Quick Action</h2>
                                {dragHandle?.icon}
                            </div>
                        )}
                        <nav className={isMain ? "grid grid-cols-2 gap-4 max-w-lg" : "space-y-2"}>
                            {[
                                { icon: 'add', label: 'Add Habit' },
                                { icon: 'event', label: 'Add Schedule' },
                                { icon: 'edit_note', label: 'Add Notes' },
                                { icon: 'link', label: 'Add Link' },
                            ].map((action) => (
                                <button
                                    key={action.label}
                                    onClick={() => {
                                        if (action.label === 'Add Habit') setIsAddHabitOpen(true);
                                        if (action.label === 'Add Schedule') setIsAddScheduleOpen(true);
                                        if (action.label === 'Add Notes') setIsAddNoteOpen(true);
                                        if (action.label === 'Add Link') setIsAddLinkOpen(true);
                                    }}
                                    className={`flex items-center gap-3 ${isMain ? 'px-6 py-4 text-base border border-gray-200 hover:border-gray-300' : 'w-full px-3 py-2.5 text-sm border border-transparent hover:border-gray-200'} font-medium text-gray-700 rounded-lg hover:bg-surface-light transition-all group`}
                                >
                                    <span className={`flex items-center justify-center ${isMain ? 'w-10 h-10' : 'w-6 h-6'} rounded bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-primary transition-colors shadow-sm`}>
                                        <span className={`material-icons-outlined ${isMain ? 'text-xl' : 'text-sm'}`}>{action.icon}</span>
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
                        className={isMain ? "z-10 flex-1 flex flex-col" : "bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col"}
                        onMouseLeave={() => handleDayHover(null)}
                    >
                        <div className={isMain ? "flex flex-col lg:flex-row gap-6 flex-1" : ""}>
                            {/* Calendar Grid */}
                            <div className={isMain ? "lg:w-1/2" : ""}>
                                <div className="flex items-center justify-between mb-4">
                                    <div
                                        className={`flex items-center ${dragHandle ? 'cursor-grab active:cursor-grabbing select-none group/title' : ''}`}
                                        {...(dragHandle ? (({ className: _unused, ...rest }) => rest)(dragHandle.titleProps) : {})}
                                    >
                                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Calendar</h2>
                                        {dragHandle?.icon}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => navigateMonth(-1)} className="p-1 hover:bg-gray-100 rounded transition-colors">
                                            <span className="material-icons-outlined text-sm text-gray-500">chevron_left</span>
                                        </button>
                                        <span className="text-xs font-mono text-gray-500 min-w-[80px] text-center">{formatMonth(currentDate)}</span>
                                        <button onClick={() => navigateMonth(1)} className="p-1 hover:bg-gray-100 rounded transition-colors">
                                            <span className="material-icons-outlined text-sm text-gray-500">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                                <div className={`grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2 font-medium`}>
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <div key={i}>{day}</div>)}
                                </div>
                                <div className={`grid grid-cols-7 gap-1 text-center ${isMain ? 'text-base' : 'text-sm'}`}>
                                    {[...Array(firstDay)].map((_, i) => (
                                        <div key={`prev-${i}`} className="p-2 text-gray-300">{prevMonthDays - firstDay + i + 1}</div>
                                    ))}
                                    {[...Array(daysInMonth)].map((_, i) => {
                                        const day = i + 1;
                                        const isToday = isCurrentMonth && day === todayDay;
                                        return (
                                            <div
                                                key={day}
                                                onMouseEnter={() => handleDayHover(day)}
                                                className={`p-2 rounded transition-all cursor-default ${isToday ? 'bg-primary text-white font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}
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
                                <div className="lg:w-1/2 border-t lg:border-t-0 lg:border-l border-gray-200 pt-4 lg:pt-0 lg:pl-6 mt-4 lg:mt-0 flex flex-col">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                                        {hoveredDate ? 'Schedule' : 'Select a date'}
                                    </h3>
                                    {hoveredDate ? (
                                        <>
                                            <p className="text-base font-medium text-gray-700 mb-3">{formatDateHeader(hoveredDate)}</p>
                                            {isLoadingSchedules ? (
                                                <div className="flex-1 flex items-center justify-center">
                                                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                                                </div>
                                            ) : schedules.length === 0 ? (
                                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                                    <span className="material-icons-outlined text-4xl mb-2">event_busy</span>
                                                    <p className="text-sm font-medium">No schedule for this day</p>
                                                </div>
                                            ) : (
                                                <div className="flex-1 overflow-y-auto space-y-2">
                                                    {schedules.map((schedule) => (
                                                        <div key={schedule.id} className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm">
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
                                            <span className="material-icons-outlined text-4xl mb-2">event_note</span>
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
        <div className="flex flex-col h-screen w-full bg-background-light text-text-primary font-sans overflow-hidden">
            <Header />
            <AddHabitModal isOpen={isAddHabitOpen} onClose={() => handleModalClose(setIsAddHabitOpen)} />
            <AddScheduleModal isOpen={isAddScheduleOpen} onClose={() => handleModalClose(setIsAddScheduleOpen)} />
            <AddNoteModal isOpen={isAddNoteOpen} onClose={() => handleModalClose(setIsAddNoteOpen)} />
            <AddLinkModal isOpen={isAddLinkOpen} onClose={() => handleModalClose(setIsAddLinkOpen)} />

            <div className="flex flex-1 overflow-hidden w-full">
                <NavigationSidebar />
                <main className="flex-1 flex flex-col h-full relative overflow-y-auto">
                    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
                                {/* Main Layout: Sidebar + Right Column using Grid for height matching */}
                                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr] gap-6">
                                    {/* Sidebar - 3 widgets stacked */}
                                    <aside className="space-y-6 flex flex-col">
                                        {sidebarWidgets.map((widgetId) => (
                                            <SortableWidget key={widgetId} id={widgetId}>
                                                {(dragHandle) => renderWidget(widgetId, false, dragHandle)}
                                            </SortableWidget>
                                        ))}
                                    </aside>

                                    {/* Right Column: Main Widget + Activity Cards */}
                                    <div className="flex flex-col gap-6">
                                        {/* Main Widget - stretches to fill space */}
                                        {isShowingSchedule ? (
                                            <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex-1 flex flex-col">
                                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Schedule</h2>
                                                <div className="text-center mb-4">
                                                    <p className="text-lg font-medium text-gray-900">{formatDateHeader(hoveredDate)}</p>
                                                </div>
                                                {isLoadingSchedules ? (
                                                    <div className="flex-1 flex items-center justify-center">
                                                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
                                                    </div>
                                                ) : schedules.length === 0 ? (
                                                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                                        <span className="material-icons-outlined text-5xl mb-3">event_busy</span>
                                                        <p className="text-base font-medium">No schedule for this day</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex-1 overflow-y-auto space-y-3">
                                                        {schedules.map((schedule) => (
                                                            <div key={schedule.id} className="bg-gray-50 border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors">
                                                                <div className="flex items-start gap-4">
                                                                    <div className="text-center min-w-[60px]">
                                                                        <span className="text-lg font-mono font-bold text-primary">{formatTime(schedule.startTime)}</span>
                                                                        {schedule.endTime && (
                                                                            <>
                                                                                <div className="text-xs text-gray-400">to</div>
                                                                                <span className="text-sm font-mono text-gray-500">{formatTime(schedule.endTime)}</span>
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
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </section>
                                        ) : (
                                            <SortableWidget id={mainWidget} isMain>
                                                {(dragHandle) => mainWidget === 'pomodoro' || mainWidget === 'calendar' ? (
                                                    // Pomodoro and Calendar have their own container
                                                    <div className="relative group flex-1 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                                        {renderWidget(mainWidget, true, dragHandle)}
                                                    </div>
                                                ) : (
                                                    <section className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col relative overflow-hidden shadow-sm group flex-1">
                                                        <div {...(dragHandle ? dragHandle.titleProps : { className: 'flex items-center mb-4' })}>
                                                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                                                {widgetLabels[mainWidget]}
                                                            </h2>
                                                            {dragHandle?.icon}
                                                        </div>
                                                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
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
            </div>
        </div>
    );
}
