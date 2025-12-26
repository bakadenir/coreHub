import { useState, useEffect, useCallback, useMemo } from 'react';
import AddHabitModal from '../components/AddHabitModal';
import EditHabitModal from '../components/EditHabitModal';
import ActionMenu from '../components/ActionMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import { habitsApi } from '../lib';
import type { Habit } from '../types';
import { EmptyState, ErrorState } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';

// Generate heatmap data for last 12 weeks
function generateHeatmapData(completions: { completed_at: string }[] = []) {
    const weeks = 12;
    const today = new Date();
    const heatmap: { date: string; completed: boolean; isToday: boolean; isFuture: boolean }[][] = [];

    // Create a Set of completed dates for O(1) lookup
    const completedDates = new Set(
        completions.map(c => c.completed_at?.split('T')[0])
    );

    // Start from (weeks-1) weeks ago, on the Monday of that week
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (weeks - 1) * 7);
    // Align to Monday (0 = Sunday, 1 = Monday, etc.)
    const dayOffset = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1;
    startDate.setDate(startDate.getDate() - dayOffset);

    for (let week = 0; week < weeks; week++) {
        const weekData: { date: string; completed: boolean; isToday: boolean; isFuture: boolean }[] = [];
        for (let day = 0; day < 7; day++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + week * 7 + day);
            const dateStr = currentDate.toISOString().split('T')[0];

            const isToday = dateStr === today.toISOString().split('T')[0];
            const isFuture = currentDate > today;

            weekData.push({
                date: dateStr,
                completed: completedDates.has(dateStr),
                isToday,
                isFuture,
            });
        }
        heatmap.push(weekData);
    }

    return heatmap;
}

// Calculate stats from completions
function calculateStats(completions: { completed_at: string }[] = []) {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    let monthCount = 0;
    let yearCount = 0;

    completions.forEach(c => {
        if (!c.completed_at) return;
        const date = new Date(c.completed_at);
        if (date.getFullYear() === thisYear) {
            yearCount++;
            if (date.getMonth() === thisMonth) {
                monthCount++;
            }
        }
    });

    return { monthCount, yearCount };
}

// Get the date range text for the heatmap
function getDateRangeText() {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 11 * 7);

    const formatDate = (d: Date) => {
        const day = d.getDate();
        const month = d.toLocaleDateString('en-US', { month: 'short' });
        return `${day}-${month}`;
    };

    return `${formatDate(startDate)} — ${formatDate(today)}`;
}

// Habit Card Component with Heatmap
function HabitCard({
    habit,
    onComplete,
    onEdit,
    onArchive,
    onDelete,
}: {
    habit: Habit;
    onComplete: (id: string, completed: boolean) => void;
    onEdit: (habit: Habit) => void;
    onArchive: (habit: Habit) => void;
    onDelete: (habit: Habit) => void;
}) {
    const heatmap = useMemo(() => generateHeatmapData(habit.completions), [habit.completions]);
    const stats = useMemo(() => calculateStats(habit.completions), [habit.completions]);
    const dateRange = useMemo(() => getDateRangeText(), []);

    // Calculate completion rate for progress bar (last 4 weeks)
    const last4WeeksCompletions = useMemo(() => {
        const last4Weeks = heatmap.slice(-4);
        let total = 0;
        let completed = 0;
        last4Weeks.forEach(week => {
            week.forEach(day => {
                if (!day.isFuture) {
                    total++;
                    if (day.completed) completed++;
                }
            });
        });
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    }, [heatmap]);

    const actionMenuItems = [
        { label: 'Edit', icon: 'edit', onClick: () => onEdit(habit) },
        { label: habit.isArchived ? 'Unarchive' : 'Archive', icon: habit.isArchived ? 'unarchive' : 'archive', onClick: () => onArchive(habit) },
        { label: 'Delete', icon: 'delete', onClick: () => onDelete(habit), variant: 'danger' as const },
    ];

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="bg-white border border-border-light rounded-xl p-5 shadow-sm hover:shadow-md transition-all group">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg shadow-inner">
                        {habit.icon || '✓'}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-text-primary leading-tight">{habit.name}</h3>
                        <p className="text-xs text-text-secondary capitalize">{habit.frequency}</p>
                    </div>
                </div>
                <ActionMenu items={actionMenuItems} />
            </div>

            {/* Completed Today Status */}
            <div className="mb-2">
                {habit.completed ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
                        <span className="material-icons-outlined text-sm">check_circle</span>
                        Completed Today
                    </span>
                ) : habit.hasStarted === false ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                        <span className="material-icons-outlined text-sm">schedule</span>
                        Starts {new Date(habit.startDate!).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    </span>
                ) : habit.isDueToday === false ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                        <span className="material-icons-outlined text-sm">event_busy</span>
                        Not scheduled today
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                        <span className="material-icons-outlined text-sm">radio_button_unchecked</span>
                        Not completed yet
                    </span>
                )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
                <span className="material-icons-outlined text-sm text-primary">bar_chart</span>
                <span>This Month: <span className="font-semibold text-text-primary">{stats.monthCount}</span></span>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2 mb-3 text-xs text-text-secondary">
                <span className="material-icons-outlined text-sm">date_range</span>
                <span className="font-mono">{dateRange}</span>
            </div>

            {/* Heatmap Grid */}
            <div className="mb-4 overflow-x-auto">
                <div className="flex gap-[3px] min-w-max">
                    {/* Day Labels */}
                    <div className="flex flex-col gap-[3px] mr-1">
                        {dayLabels.map((day, i) => (
                            <div key={i} className="h-[14px] text-[9px] text-text-secondary flex items-center justify-end pr-1 font-mono">
                                {i % 2 === 0 ? day : ''}
                            </div>
                        ))}
                    </div>
                    {/* Weeks */}
                    {heatmap.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-[3px]">
                            {week.map((day, dayIndex) => (
                                <div
                                    key={dayIndex}
                                    className={`w-[14px] h-[14px] rounded-[3px] transition-colors ${day.isFuture
                                        ? 'bg-gray-100'
                                        : day.isToday
                                            ? day.completed
                                                ? 'bg-primary ring-2 ring-primary/30 ring-offset-1'
                                                : 'bg-gray-300 ring-2 ring-gray-400/30 ring-offset-1'
                                            : day.completed
                                                ? 'bg-primary'
                                                : 'bg-gray-200 hover:bg-gray-300'
                                        }`}
                                    title={`${day.date}${day.completed ? ' ✓' : ''}`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-text-secondary">Last 4 weeks</span>
                    <span className="text-xs font-bold text-text-primary">{last4WeeksCompletions}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${last4WeeksCompletions}%` }}
                    />
                </div>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🔥</span>
                <span className="text-sm font-bold text-text-primary">{habit.streak || 0} day streak</span>
                {(habit.streak || 0) > 0 && (
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">Keep it up!</span>
                )}
            </div>

            {/* Mark as Completed Button */}
            {habit.hasStarted !== false && habit.isDueToday !== false && (
                <button
                    onClick={() => onComplete(habit.id, habit.completed)}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${habit.completed
                        ? 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                        : 'bg-primary text-white hover:bg-text-primary shadow-sm'
                        }`}
                >
                    {habit.completed ? '✓ Completed' : 'Mark as completed'}
                </button>
            )}
        </div>
    );
}

// Loading Skeleton
function HabitCardSkeleton() {
    return (
        <div className="bg-white border border-border-light rounded-xl p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gray-200" />
                <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                </div>
            </div>
            <div className="h-4 w-28 bg-gray-200 rounded mb-4" />
            <div className="space-y-1.5 mb-4">
                <div className="h-3 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-28 bg-gray-200 rounded" />
            </div>
            <div className="h-3 w-36 bg-gray-200 rounded mb-3" />
            <div className="flex gap-[3px] mb-4">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-[3px]">
                        {Array.from({ length: 7 }).map((_, j) => (
                            <div key={j} className="w-[14px] h-[14px] bg-gray-200 rounded-[3px]" />
                        ))}
                    </div>
                ))}
            </div>
            <div className="h-2 bg-gray-200 rounded-full mb-4" />
            <div className="h-10 bg-gray-200 rounded-xl" />
        </div>
    );
}

export default function Habits() {
    const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
    const [isEditHabitOpen, setIsEditHabitOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'today' | 'daily' | 'weekly' | 'archived'>('today');
    const { showToast } = useToast();

    // Delete confirmation state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchHabits = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const filters: { frequency?: string; archived?: boolean } = {};
            if (filter === 'daily') filters.frequency = 'daily';
            if (filter === 'weekly') filters.frequency = 'weekly';
            if (filter === 'archived') filters.archived = true;

            const result = await habitsApi.getAll(filters);
            if (result.success && result.data) {
                let filteredData = result.data;

                // Client-side filter for 'today' - only show habits that are due today
                if (filter === 'today') {
                    filteredData = result.data.filter(h =>
                        h.hasStarted !== false && h.isDueToday !== false && !h.isArchived
                    );
                }

                setHabits(filteredData);
            } else {
                setError(result.error || 'Failed to fetch habits');
            }
        } catch {
            setError('Network error');
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchHabits();
    }, [fetchHabits]);

    const handleComplete = async (habitId: string, currentlyCompleted: boolean) => {
        try {
            if (currentlyCompleted) {
                await habitsApi.uncomplete(habitId);
                showToast('Habit uncompleted', 'success');
            } else {
                await habitsApi.complete(habitId);
                showToast('Habit completed! 🎉', 'success');
            }
            fetchHabits();
        } catch {
            showToast('Failed to update habit', 'error');
        }
    };

    const handleEdit = (habit: Habit) => {
        setEditingHabit(habit);
        setIsEditHabitOpen(true);
    };

    const handleDeleteClick = (habit: Habit) => {
        setHabitToDelete(habit);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!habitToDelete) return;

        setIsDeleting(true);
        try {
            const result = await habitsApi.delete(habitToDelete.id);
            if (result.success) {
                showToast('Habit deleted successfully', 'success');
                fetchHabits();
            } else {
                showToast(result.error || 'Failed to delete habit', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        } finally {
            setIsDeleting(false);
            setDeleteConfirmOpen(false);
            setHabitToDelete(null);
        }
    };

    const handleArchive = async (habit: Habit) => {
        try {
            const newArchived = !habit.isArchived;
            const result = await habitsApi.archive(habit.id, newArchived);
            if (result.success) {
                showToast(newArchived ? 'Habit archived' : 'Habit unarchived', 'success');
                fetchHabits();
            } else {
                showToast('Failed to update habit', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        }
    };

    // Calculate overall stats (only habits that are due today)
    const activeHabits = habits.filter(h => h.hasStarted !== false && h.isDueToday !== false && !h.isArchived);
    const completedToday = activeHabits.filter(h => h.completed).length;
    const completionRate = activeHabits.length > 0 ? Math.round((completedToday / activeHabits.length) * 100) : 0;
    const longestStreak = Math.max(...habits.map(h => h.streak || 0), 0);

    return (
        <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light">
            <AddHabitModal isOpen={isAddHabitOpen} onClose={() => { setIsAddHabitOpen(false); fetchHabits(); }} />
            <EditHabitModal
                isOpen={isEditHabitOpen}
                onClose={() => { setIsEditHabitOpen(false); setEditingHabit(null); fetchHabits(); }}
                habit={editingHabit}
            />
            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => { setDeleteConfirmOpen(false); setHabitToDelete(null); }}
                onConfirm={handleDeleteConfirm}
                title="Delete Habit"
                message={`Are you sure you want to delete "${habitToDelete?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                isLoading={isDeleting}
            />

            {/* Header */}
            <header className="flex items-center justify-between p-6 border-b border-border-light bg-white shrink-0">
                <div className="flex flex-col gap-1">
                    <h2 className="text-text-primary text-3xl font-extrabold tracking-tight">Habits</h2>
                    <p className="text-text-secondary text-base font-normal">Track your daily habits and build consistency.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAddHabitOpen(true)}
                        className="flex items-center justify-center rounded-xl h-10 px-5 bg-primary hover:bg-text-primary text-white gap-2 text-sm font-bold shadow-sm transition-all shadow-gray-200/50"
                    >
                        <span className="material-icons-outlined text-[20px]">add</span>
                        <span className="whitespace-nowrap">Add Habit</span>
                    </button>
                </div>
            </header>

            {/* Stats Bar + Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border-b border-border-light">
                {/* Filter Tabs */}
                <div className="flex h-10 items-center justify-center rounded-xl bg-gray-100 p-1 border border-transparent">
                    {(['today', 'all', 'daily', 'weekly', 'archived'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${filter === f
                                ? 'bg-white text-text-primary shadow-sm'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            {f === 'all' ? 'All' : f === 'today' ? 'Today' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                            <span className="material-icons-outlined text-green-600">check_circle</span>
                        </div>
                        <div>
                            <p className="text-xs text-text-secondary">Today</p>
                            <p className="text-sm font-bold text-text-primary">{completedToday}/{activeHabits.length} done</p>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-border-light" />
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <span className="material-icons-outlined text-blue-600">percent</span>
                        </div>
                        <div>
                            <p className="text-xs text-text-secondary">Completion</p>
                            <p className="text-sm font-bold text-text-primary">{completionRate}%</p>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-border-light hidden md:block" />
                    <div className="hidden md:flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                            <span className="text-lg">🔥</span>
                        </div>
                        <div>
                            <p className="text-xs text-text-secondary">Best Streak</p>
                            <p className="text-sm font-bold text-text-primary">{longestStreak} days</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <HabitCardSkeleton key={i} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex-1 flex items-center justify-center">
                        <ErrorState message={error} onRetry={fetchHabits} />
                    </div>
                ) : habits.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16">
                        <EmptyState
                            message={
                                filter === 'archived'
                                    ? 'No archived habits'
                                    : filter === 'today'
                                        ? 'No habits scheduled for today'
                                        : filter === 'daily'
                                            ? 'No daily habits'
                                            : filter === 'weekly'
                                                ? 'No weekly habits'
                                                : 'No habits yet. Start tracking your first habit!'
                            }
                            icon={filter === 'archived' ? 'inventory_2' : 'self_improvement'}
                        />
                        {filter !== 'archived' && (
                            <button
                                onClick={() => setIsAddHabitOpen(true)}
                                className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-text-primary transition-colors shadow-sm"
                            >
                                {filter === 'all' ? 'Create Your First Habit' : 'Add Habit'}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {habits.map((habit) => (
                            <HabitCard
                                key={habit.id}
                                habit={habit}
                                onComplete={handleComplete}
                                onEdit={handleEdit}
                                onArchive={handleArchive}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
