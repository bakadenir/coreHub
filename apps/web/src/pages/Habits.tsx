import { useState, useEffect, useCallback } from 'react';
import AddHabitModal from '../components/AddHabitModal';
import EditHabitModal from '../components/EditHabitModal';
import ActionMenu from '../components/ActionMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import { habitsApi } from '../lib';
import type { Habit } from '../types';
import { TableSkeleton, EmptyState, ErrorState } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';

export default function Habits() {
    const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
    const [isEditHabitOpen, setIsEditHabitOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'archived'>('all');
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
                setHabits(result.data);
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

    const getActionMenuItems = (habit: Habit) => [
        {
            label: 'Edit',
            icon: 'edit',
            onClick: () => handleEdit(habit),
        },
        {
            label: habit.isArchived ? 'Unarchive' : 'Archive',
            icon: habit.isArchived ? 'unarchive' : 'archive',
            onClick: () => handleArchive(habit),
        },
        {
            label: 'Delete',
            icon: 'delete',
            onClick: () => handleDeleteClick(habit),
            variant: 'danger' as const,
        },
    ];

    // Calculate stats
    const todayCompleted = habits.filter(h => h.completed).length;
    const completionRate = habits.length > 0 ? Math.round((todayCompleted / habits.length) * 100) : 0;
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
            <header className="flex items-center justify-between p-6 border-b border-border-light bg-white shrink-0">
                <div className="flex flex-col gap-1">
                    <h2 className="text-text-primary text-3xl font-extrabold tracking-tight">Habits</h2>
                    <p className="text-text-secondary text-base font-normal">A consolidated view of your habits and progress.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAddHabitOpen(true)}
                        className="flex items-center justify-center rounded-lg h-10 px-5 bg-primary hover:bg-text-primary text-white gap-2 text-sm font-bold shadow-sm transition-all shadow-gray-200/50"
                    >
                        <span className="material-icons-outlined text-[20px]">add</span>
                        <span className="whitespace-nowrap">Add Habits</span>
                    </button>
                </div>
            </header>
            <div className="flex flex-1 overflow-hidden overflow-y-auto w-full p-8 md:p-12">
                <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-3 rounded-lg p-5 bg-gray-50 border border-border-light shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-gray-500 text-sm font-medium">Today's Completion</p>
                                <span className="material-icons-outlined text-gray-400">donut_large</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-text-primary text-4xl font-bold">{completionRate}%</p>
                                <p className="text-gray-500 text-base">{todayCompleted}/{habits.length} done</p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${completionRate}%` }}></div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 rounded-lg p-5 bg-gray-50 border border-border-light shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-gray-500 text-sm font-medium">Longest Streak</p>
                                <span className="material-icons-outlined text-red-500">local_fire_department</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-text-primary text-4xl font-bold">{longestStreak} Days</p>
                            </div>
                            <p className="text-gray-500 text-sm mt-2">Keep building your habits!</p>
                        </div>
                        <div className="flex flex-col gap-3 rounded-lg p-5 bg-gray-50 border border-border-light shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-gray-500 text-sm font-medium">Total Active</p>
                                <span className="material-icons-outlined text-gray-400">list_alt</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-text-primary text-4xl font-bold">{habits.length}</p>
                                <p className="text-gray-500 text-base">Habits</p>
                            </div>
                        </div>
                    </div>

                    {/* Filter & List */}
                    <div className="px-6 md:px-10 py-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 bg-white p-2 rounded-lg border border-border-light">
                            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                                {(['all', 'daily', 'weekly', 'archived'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'
                                            }`}
                                    >
                                        {f === 'all' ? 'All Habits' : f.charAt(0).toUpperCase() + f.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        {isLoading ? (
                            <TableSkeleton rows={5} />
                        ) : error ? (
                            <ErrorState message={error} onRetry={fetchHabits} />
                        ) : habits.length === 0 ? (
                            <EmptyState message="No habits yet. Create your first habit!" icon="self_improvement" />
                        ) : (
                            <div className="bg-white rounded-xl border border-border-light overflow-hidden shadow-sm">
                                <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-border-light bg-gray-50 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                    <div className="col-span-5 pl-2">Habit Name</div>
                                    <div className="col-span-2 text-center">Frequency</div>
                                    <div className="col-span-2 text-center">Streak</div>
                                    <div className="col-span-2 text-center">Status</div>
                                    <div className="col-span-1 text-right pr-2">Actions</div>
                                </div>
                                {habits.map((habit) => (
                                    <div key={habit.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center border-b border-border-light hover:bg-gray-50 transition-colors group">
                                        <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center text-text-primary">
                                                <span className="material-icons-outlined">{habit.icon || 'check_circle'}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-text-primary font-semibold text-sm">{habit.name}</p>
                                                <p className="text-text-secondary text-xs">{habit.time || ''} • {habit.category || 'General'}</p>
                                            </div>
                                        </div>
                                        <div className="col-span-6 md:col-span-2 flex md:justify-center items-center">
                                            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-text-primary text-xs font-medium border border-border-light">{habit.frequency}</span>
                                        </div>
                                        <div className="col-span-6 md:col-span-2 flex md:justify-center items-center gap-1.5">
                                            <span className={`material-icons-outlined text-[18px] ${(habit.streak || 0) > 0 ? 'text-red-500' : 'text-gray-400'}`}>local_fire_department</span>
                                            <span className={`${(habit.streak || 0) > 0 ? 'text-text-primary' : 'text-text-secondary'} font-bold text-sm`}>{habit.streak || 0}</span>
                                        </div>
                                        <div className="col-span-12 md:col-span-2 flex md:justify-center items-center">
                                            {habit.completed ? (
                                                <button
                                                    onClick={() => handleComplete(habit.id, true)}
                                                    className="group/check flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-100 hover:bg-green-200 transition-colors w-full md:w-auto justify-center"
                                                >
                                                    <span className="material-icons-outlined text-green-600 text-[18px]">check_circle</span>
                                                    <span className="text-green-600 text-xs font-bold">Done</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleComplete(habit.id, false)}
                                                    className="group/check flex items-center gap-2 px-3 py-1.5 rounded-md border border-border-light hover:border-text-primary hover:bg-gray-50 transition-all w-full md:w-auto justify-center bg-white"
                                                >
                                                    <div className="size-4 rounded border border-gray-400 group-hover/check:border-text-primary"></div>
                                                    <span className="text-text-secondary text-xs font-medium group-hover/check:text-text-primary">Mark Done</span>
                                                </button>
                                            )}
                                        </div>
                                        <div className="col-span-12 md:col-span-1 flex justify-end items-center pr-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <ActionMenu items={getActionMenuItems(habit)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
