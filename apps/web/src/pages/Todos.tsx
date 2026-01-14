import { useState, useEffect, useCallback, useRef } from 'react';
import { todosApi } from '../lib';
import type { Todo, TodoList, TodoFilters } from '../types';
import { EmptyState } from '../hooks/useApi';
import { useTodos, useTodoLists } from '../hooks/useTodos';
import { TodoGridSkeleton } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';
import ActionMenu from '../components/ActionMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import AddTodoListModal from '../components/AddTodoListModal';
import {
    Plus, Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight,
    Circle, CheckCircle2, Inbox, MoreVertical, X,
    Trash2, Sun, CalendarClock, RotateCcw
} from 'lucide-react';

type FilterView = 'all' | 'today' | 'upcoming' | 'completed';





export default function Todos() {
    const [filterView, setFilterView] = useState<FilterView>('all');
    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const { showToast } = useToast();

    // Build filters based on current view
    const filters: TodoFilters = {};
    if (selectedListId) filters.listId = selectedListId;
    if (filterView === 'today') filters.dueDate = 'today';
    else if (filterView === 'upcoming') filters.dueDate = 'upcoming';
    else if (filterView === 'completed') filters.completed = true;

    // Use SWR hooks for cached data with background sync
    const { todos: cachedTodos, isLoading: todosLoading, refresh: refreshTodos, setTodos } = useTodos(filters);
    const { lists: cachedLists, isLoading: listsLoading, refresh: refreshLists } = useTodoLists();

    // Local state synced from SWR
    const [todos, setTodosLocal] = useState<Todo[]>([]);
    const [lists, setLists] = useState<TodoList[]>([]);

    // Sync SWR data to local state
    useEffect(() => {
        if (cachedTodos.length > 0 || !todosLoading) {
            setTodosLocal(cachedTodos);
        }
    }, [cachedTodos, todosLoading]);

    useEffect(() => {
        if (cachedLists.length > 0 || !listsLoading) {
            setLists(cachedLists);
        }
    }, [cachedLists, listsLoading]);

    // Quick add state
    const [quickAddValue, setQuickAddValue] = useState('');
    const [isQuickAdding, setIsQuickAdding] = useState(false);
    const quickAddRef = useRef<HTMLInputElement>(null);
    const [quickAddDueDate, setQuickAddDueDate] = useState<Date | undefined>(undefined);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const datePickerRef = useRef<HTMLDivElement>(null);

    // Date helper functions
    const getToday = () => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    };

    const getTomorrow = () => {
        const date = getToday();
        date.setDate(date.getDate() + 1);
        return date;
    };

    const getNextWeek = () => {
        const date = getToday();
        date.setDate(date.getDate() + 7);
        return date;
    };

    const formatQuickAddDate = (date: Date | undefined) => {
        if (!date) return 'No date';
        // Always return the formatted date, ignoring "Today"/"Tomorrow" aliases
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Edit state
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
    const [editTitle, setEditTitle] = useState('');

    // Delete confirmation
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // New list modal
    const [showNewListModal, setShowNewListModal] = useState(false);

    const fetchTodos = useCallback(async () => {
        refreshTodos();
    }, [refreshTodos]);

    const fetchLists = useCallback(async () => {
        refreshLists();
    }, [refreshLists]);

    // Click outside handler for date picker
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleQuickAdd = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && quickAddValue.trim()) {
            setIsQuickAdding(true);
            try {
                const result = await todosApi.create({
                    title: quickAddValue.trim(),
                    listId: selectedListId || undefined,
                    dueDate: quickAddDueDate?.toISOString(),
                });
                if (result.success) {
                    setQuickAddValue('');
                    setQuickAddDueDate(undefined);
                    fetchTodos();
                    fetchLists();
                    showToast('Todo added', 'success');
                } else {
                    showToast(result.error || 'Failed to add todo', 'error');
                }
            } catch {
                showToast('Network error', 'error');
            } finally {
                setIsQuickAdding(false);
            }
        }
    };

    const handleToggle = async (todo: Todo) => {
        // Optimistic update - update UI immediately
        const previousTodos = [...todos];
        const newStatus = !todo.isCompleted;

        setTodos(prev => prev.map(t =>
            t.id === todo.id ? {
                ...t,
                isCompleted: newStatus,
                // Clear due date if uncompleting
                dueDate: !newStatus ? undefined : t.dueDate
            } : t
        ));

        // Show toast immediately
        const firstWord = todo.title.split(' ')[0];
        if (newStatus) {
            showToast(`${firstWord} Completed 🎉`, 'success');
        } else {
            showToast(`${firstWord} Uncompleted`, 'success');
        }

        try {
            const result = await todosApi.toggle(todo.id);
            if (result.success) {
                // If uncompleting, explicitly clear the due date on the backend
                if (!newStatus) {
                    // Cast to any to bypass strict type checking if needed, assuming backend handles null/undefined to clear
                    await todosApi.update(todo.id, { dueDate: null } as any);
                    // Refresh todos to sync the null date
                    fetchTodos();
                }
                // Silently refresh lists count in background
                fetchLists();
            } else {
                // Rollback on error
                setTodosLocal(previousTodos);
                showToast(result.error || 'Failed to toggle todo', 'error');
            }
        } catch {
            // Rollback on network error
            setTodosLocal(previousTodos);
            showToast('Network error', 'error');
        }
    };

    const handleUpdateTodo = async (id: string, data: Partial<Todo>) => {
        try {
            const result = await todosApi.update(id, data);
            if (result.success) {
                fetchTodos();
                setEditingTodo(null);
            } else {
                showToast(result.error || 'Failed to update todo', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        }
    };

    const handleDeleteClick = (todo: Todo) => {
        setTodoToDelete(todo);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!todoToDelete) return;
        setIsDeleting(true);
        try {
            const result = await todosApi.delete(todoToDelete.id);
            if (result.success) {
                showToast('Todo deleted', 'success');
                fetchTodos();
                fetchLists();
            } else {
                showToast(result.error || 'Failed to delete todo', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        } finally {
            setIsDeleting(false);
            setDeleteConfirmOpen(false);
            setTodoToDelete(null);
        }
    };



    const handleDeleteList = async (listId: string) => {
        try {
            const result = await todosApi.deleteList(listId);
            if (result.success) {
                showToast('List deleted', 'success');
                if (selectedListId === listId) {
                    setSelectedListId(null);
                }
                fetchLists();
                fetchTodos();
            } else {
                showToast(result.error || 'Failed to delete list', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        }
    };

    const handleResetList = async (listId: string) => {
        try {
            const result = await todosApi.resetList(listId);
            if (result.success) {
                showToast(`List reset! ${result.data?.count || 0} todos uncompleted`, 'success');
                fetchLists();
                fetchTodos();
            } else {
                showToast(result.error || 'Failed to reset list', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        }
    };



    const formatDueDate = (dueDate: string) => {
        const date = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dateOnly = new Date(date);
        dateOnly.setHours(0, 0, 0, 0);

        if (dateOnly < today) return `Overdue: ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };



    const listColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-yellow-500'];

    const getListColor = (index: number) => {
        return listColors[index % listColors.length] + ' transition-colors';
    };

    const renderTodoItem = (todo: Todo) => {
        const isEditing = editingTodo?.id === todo.id;

        return (
            <div key={todo.id} className="relative group/item [&:has([data-state=open])]:z-50">
                <div
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${todo.isCompleted
                        ? 'bg-white border-border-light opacity-60'
                        : 'bg-white border-border-light hover:border-gray-300 hover:shadow-sm'
                        }`}
                >
                    {/* Checkbox */}
                    <button
                        onClick={() => handleToggle(todo)}
                        className={`shrink-0 ${todo.isCompleted ? 'text-gray-900' : 'text-gray-300 hover:text-gray-400'}`}
                    >
                        {todo.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>

                    {/* Date */}
                    <span className="text-xs text-gray-500 font-semibold shrink-0">
                        {todo.dueDate ? formatDueDate(todo.dueDate) : 'No date'}
                    </span>

                    {/* Separator */}
                    <span className="text-gray-300">|</span>

                    {/* Task Title */}
                    {isEditing ? (
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleUpdateTodo(todo.id, { title: editTitle });
                                } else if (e.key === 'Escape') {
                                    setEditingTodo(null);
                                }
                            }}
                            onBlur={() => setEditingTodo(null)}
                            autoFocus
                            className="flex-1 px-2 py-1 text-sm border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    ) : (
                        <span
                            className={`flex-1 text-sm font-medium truncate cursor-pointer select-none ${todo.isCompleted ? 'text-gray-400 line-through' : 'text-text-primary'}`}
                            onClick={() => handleToggle(todo)}
                            onDoubleClick={(e) => {
                                e.stopPropagation();
                                setEditingTodo(todo);
                                setEditTitle(todo.title);
                            }}
                        >
                            {todo.title}
                        </span>
                    )}

                    {/* Actions */}
                    <div className="opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0">
                        <ActionMenu
                            items={[
                                {
                                    label: 'Edit',
                                    icon: 'edit',
                                    onClick: () => {
                                        setEditingTodo(todo);
                                        setEditTitle(todo.title);
                                    },
                                },
                                {
                                    label: 'Delete',
                                    icon: 'delete',
                                    onClick: () => handleDeleteClick(todo),
                                    variant: 'danger' as const,
                                },
                            ]}
                            trigger={<MoreVertical size={16} className="text-gray-400" />}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const activeTodos = todos.filter(t => !t.isCompleted);
    const completedTodos = todos.filter(t => t.isCompleted);

    return (
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
            {/* Header - Full width spanning above sidebar and content */}
            <header className="p-6 border-b border-border-light bg-[#fdfdfd] shrink-0">
                <div className="flex flex-col gap-1">
                    <h2 className="text-text-primary text-3xl font-extrabold tracking-tight">
                        Todo List
                    </h2>
                    <p className="text-text-secondary text-base font-normal">Manage your tasks and stay productive.</p>
                </div>
            </header>

            {/* Content area with sidebar and main */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 border-r border-border-light bg-background-light flex flex-col shrink-0">
                    <nav className="flex-1 px-3 pt-4 pb-3 space-y-1 overflow-y-auto">
                        {/* Smart Views */}
                        <div className="mb-4 space-y-1">
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Views</div>
                            <button
                                onClick={() => { setFilterView('all'); setSelectedListId(null); }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterView === 'all' && !selectedListId
                                    ? 'bg-surface-light text-primary'
                                    : 'text-gray-600 hover:bg-surface-light'
                                    }`}
                            >
                                <Inbox size={18} />
                                <span className="flex-1 text-left">All Tasks</span>
                                <span className="text-xs text-gray-400">{todos.length}</span>
                            </button>
                            <button
                                onClick={() => { setFilterView('today'); setSelectedListId(null); }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterView === 'today'
                                    ? 'bg-surface-light text-primary'
                                    : 'text-gray-600 hover:bg-surface-light'
                                    }`}
                            >
                                <Sun size={18} />
                                <span className="flex-1 text-left">Today</span>
                            </button>
                            <button
                                onClick={() => { setFilterView('upcoming'); setSelectedListId(null); }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterView === 'upcoming'
                                    ? 'bg-surface-light text-primary'
                                    : 'text-gray-600 hover:bg-surface-light'
                                    }`}
                            >
                                <CalendarClock size={18} />
                                <span className="flex-1 text-left">Upcoming</span>
                            </button>
                            <button
                                onClick={() => { setFilterView('completed'); setSelectedListId(null); }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterView === 'completed'
                                    ? 'bg-surface-light text-primary'
                                    : 'text-gray-600 hover:bg-surface-light'
                                    }`}
                            >
                                <CheckCircle2 size={18} />
                                <span className="flex-1 text-left">Completed</span>
                            </button>
                        </div>

                        {/* Lists */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between px-2 mb-2">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Lists</span>
                                <button
                                    onClick={() => setShowNewListModal(true)}
                                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            {/* Custom Lists */}
                            {lists.map((list, index) => (
                                <div key={list.id} className="group relative">
                                    <button
                                        onClick={() => { setSelectedListId(list.id); setFilterView('all'); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedListId === list.id
                                            ? 'bg-surface-light text-primary'
                                            : 'text-gray-600 hover:bg-surface-light'
                                            }`}
                                    >
                                        <div className="w-[18px] flex justify-center">
                                            <div className={`w-3 h-3 rounded-full ${getListColor(index)}`} />
                                        </div>
                                        <span className="flex-1 text-left truncate">{list.name}</span>
                                        {list.todoCount > 0 && (
                                            <span className="text-xs text-gray-400 group-hover:opacity-0 transition-opacity">{list.todoCount}</span>
                                        )}
                                    </button>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleResetList(list.id); }}
                                            className="p-1 text-gray-400 hover:text-primary transition-colors"
                                            title="Reset list (uncomplete all)"
                                        >
                                            <RotateCcw size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id); }}
                                            className="p-1 text-gray-400 hover:text-primary transition-colors"
                                            title="Delete list"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Quick Add & Search Bar */}
                    <div className="flex flex-col gap-3 p-6 bg-[#fdfdfd] border-b border-border-light">
                        {/* Quick Add */}
                        <div className="flex gap-2 items-start">
                            <div className="relative flex-1">
                                <Plus size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    ref={quickAddRef}
                                    type="text"
                                    value={quickAddValue}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setQuickAddValue(val.charAt(0).toUpperCase() + val.slice(1));
                                    }}
                                    onKeyDown={handleQuickAdd}
                                    placeholder="Add a Task... (press Enter)"
                                    disabled={isQuickAdding}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-border-light rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
                                />
                            </div>

                            {/* Date Picker Button & Dropdown */}
                            <div className="relative" ref={datePickerRef}>
                                <button
                                    onClick={() => setShowDatePicker(!showDatePicker)}
                                    className="flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition-colors bg-white border-border-light text-gray-500 hover:bg-gray-50"
                                >
                                    <CalendarIcon size={16} />
                                    <span className="hidden sm:inline">{formatQuickAddDate(quickAddDueDate)}</span>
                                    <ChevronDown size={14} />
                                </button>

                                {showDatePicker && (
                                    <div className="absolute right-0 top-full mt-2 bg-white rounded-xl border border-border-light shadow-lg z-50 min-w-[280px]">
                                        {/* Quick Options */}
                                        <div className="p-2 border-b border-border-light">
                                            <button
                                                onClick={() => { setQuickAddDueDate(getToday()); setShowDatePicker(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                                            >
                                                <Sun size={16} className="text-orange-500" />
                                                <span>Today</span>
                                                <span className="ml-auto text-xs text-gray-400">
                                                    {getToday().toLocaleDateString('en-US', { weekday: 'short' })}
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => { setQuickAddDueDate(getTomorrow()); setShowDatePicker(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                                            >
                                                <CalendarIcon size={16} className="text-blue-500" />
                                                <span>Tomorrow</span>
                                                <span className="ml-auto text-xs text-gray-400">
                                                    {getTomorrow().toLocaleDateString('en-US', { weekday: 'short' })}
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => { setQuickAddDueDate(getNextWeek()); setShowDatePicker(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                                            >
                                                <CalendarClock size={16} className="text-purple-500" />
                                                <span>Next Week</span>
                                                <span className="ml-auto text-xs text-gray-400">
                                                    {getNextWeek().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => { setQuickAddDueDate(undefined); setShowDatePicker(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors text-gray-500"
                                            >
                                                <X size={16} />
                                                <span>No Date</span>
                                            </button>
                                        </div>

                                        {/* Custom Calendar - matching Home page style */}
                                        <div className="p-3">
                                            {/* Month Navigation */}
                                            <div className="flex items-center justify-between mb-3">
                                                <button
                                                    onClick={() => {
                                                        const prev = new Date(calendarMonth);
                                                        prev.setMonth(prev.getMonth() - 1);
                                                        setCalendarMonth(prev);
                                                    }}
                                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                >
                                                    <ChevronLeft size={14} className="text-gray-500" />
                                                </button>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        const next = new Date(calendarMonth);
                                                        next.setMonth(next.getMonth() + 1);
                                                        setCalendarMonth(next);
                                                    }}
                                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                >
                                                    <ChevronRight size={14} className="text-gray-500" />
                                                </button>
                                            </div>

                                            {/* Days Header */}
                                            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2 font-medium">
                                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <div key={i}>{day}</div>)}
                                            </div>

                                            {/* Dates Grid */}
                                            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                                                {/* Empty placeholders for alignment */}
                                                {[...Array(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay())].map((_, i) => (
                                                    <div key={`empty-${i}`} className="aspect-square w-8"></div>
                                                ))}
                                                {/* Current month days */}
                                                {[...Array(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate())].map((_, i) => {
                                                    const day = i + 1;
                                                    const dateToCheck = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                                                    dateToCheck.setHours(0, 0, 0, 0);
                                                    const todayCheck = new Date();
                                                    todayCheck.setHours(0, 0, 0, 0);
                                                    const isToday = dateToCheck.getTime() === todayCheck.getTime();
                                                    const isPast = dateToCheck < todayCheck;
                                                    const isSelected = quickAddDueDate &&
                                                        dateToCheck.getTime() === new Date(quickAddDueDate.getFullYear(), quickAddDueDate.getMonth(), quickAddDueDate.getDate()).getTime();

                                                    return (
                                                        <button
                                                            key={day}
                                                            onClick={() => {
                                                                if (!isPast) {
                                                                    setQuickAddDueDate(dateToCheck);
                                                                    setShowDatePicker(false);
                                                                }
                                                            }}
                                                            disabled={isPast}
                                                            className={`aspect-square w-8 flex items-center justify-center rounded-lg transition-all ${isSelected
                                                                ? 'bg-gray-900 text-white font-semibold'
                                                                : isPast
                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                    : isToday
                                                                        ? 'bg-gray-100 text-gray-900 font-semibold cursor-pointer'
                                                                        : 'hover:bg-gray-100 text-gray-600 cursor-pointer'
                                                                }`}
                                                        >
                                                            {day}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Todo List */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {todosLoading && todos.length === 0 ? (
                            <TodoGridSkeleton count={6} />
                        ) : todos.length === 0 ? (
                            <EmptyState
                                message="No tasks yet. Add one above!"
                                icon="tasks"
                            />
                        ) : (
                            <div className="space-y-6">
                                {/* Active Todos */}
                                {activeTodos.length > 0 && (
                                    <div className="space-y-2">
                                        {filterView !== 'completed' && (
                                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                                                Active ({activeTodos.length})
                                            </h3>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {activeTodos.map(todo => renderTodoItem(todo))}
                                        </div>
                                    </div>
                                )}

                                {/* Completed Todos */}
                                {completedTodos.length > 0 && filterView !== 'completed' && (
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                                            Completed ({completedTodos.length})
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {completedTodos.map(todo => renderTodoItem(todo))}
                                        </div>
                                    </div>
                                )}

                                {filterView === 'completed' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {completedTodos.map(todo => renderTodoItem(todo))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Delete Confirmation */}
                <ConfirmDialog
                    isOpen={deleteConfirmOpen}
                    onClose={() => { setDeleteConfirmOpen(false); setTodoToDelete(null); }}
                    onConfirm={handleDeleteConfirm}
                    title="Delete Task"
                    message={`Are you sure you want to delete "${todoToDelete?.title}"? This action cannot be undone.`}
                    confirmLabel="Delete"
                    variant="danger"
                    isLoading={isDeleting}
                />

                {/* New List Modal */}
                <AddTodoListModal
                    isOpen={showNewListModal}
                    onClose={() => setShowNewListModal(false)}
                    onSuccess={() => {
                        fetchLists();
                        fetchTodos();
                    }}
                />
            </div>
        </main >
    );
}
