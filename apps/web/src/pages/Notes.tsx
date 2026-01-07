import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ActionMenu from '../components/ActionMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import RichTextEditor from '../components/RichTextEditor';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { notesApi } from '../lib';
import type { Note } from '../types';
import { EmptyState, ErrorState } from '../hooks/useApi';
import { NoteGridSkeleton, NoteSidebarSkeleton } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';
import { useLocation } from 'react-router-dom';
import { Plus, ArrowUpDown, Search, MoreHorizontal, Pin, Globe, Lock, Link, Edit3, Eye, FileText, Code2, ChevronDown, Cloud, CloudOff, Loader2, ArrowLeft } from 'lucide-react';
import DOMPurify from 'dompurify';

export default function Notes() {
    const location = useLocation();
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const { showToast } = useToast();

    // Handle navigation from other pages (e.g. ActivityCards)
    useEffect(() => {
        if (location.state?.noteId) {
            setSelectedNoteId(String(location.state.noteId));
            // Optional: Clear state so refresh doesn't keep selecting it, or keep it.
            // keeping it is fine.
        }
    }, [location.state]);

    // Editing state
    const [editingTitle, setEditingTitle] = useState('');
    const [editingContent, setEditingContent] = useState('');
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
    const titleInputRef = useRef<HTMLInputElement>(null);
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSavedRef = useRef<{ title: string; content: string }>({ title: '', content: '' });
    const isSavingRef = useRef(false); // Prevent concurrent saves
    const pendingSaveRef = useRef(false); // Track if there's pending changes during save
    const prevNoteIdRef = useRef<string | null>(null); // Track previous note ID for sync

    // Delete confirmation state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Creating new note state
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateMenu, setShowCreateMenu] = useState(false);

    // Publishing state
    const [isPublishing, setIsPublishing] = useState(false);

    // View mode state (edit or preview)
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

    const fetchNotes = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await notesApi.getAll(searchTerm ? { search: searchTerm } : {});
            if (result.success && result.data) {
                setNotes(result.data);
            } else {
                setError(result.error || 'Failed to fetch notes');
            }
        } catch {
            setError('Network error');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm]);

    // Helper to load note content into editing state
    const loadNoteContent = useCallback((note: Note, noteId: string) => {
        const title = note.title || '';
        const content = note.content || '';
        setEditingTitle(title);
        setEditingContent(content);
        lastSavedRef.current = { title, content };
        setSaveStatus('saved');
        prevNoteIdRef.current = noteId;
        setSelectedNoteId(noteId);
    }, []);

    // Handle initial selection logic - only select if noteId is provided
    useEffect(() => {
        if (!isLoading && notes.length > 0) {
            // Only select a note if we have a specific noteId from navigation
            if (location.state?.noteId) {
                const targetId = String(location.state.noteId);
                if (selectedNoteId !== targetId) {
                    const targetNote = notes.find(n => String(n.id) === targetId);
                    if (targetNote) {
                        loadNoteContent(targetNote, targetId);
                    }
                }
            }
            // Don't auto-select first note - leave empty state
        }
    }, [notes, isLoading, location.state, selectedNoteId, loadNoteContent]);

    useEffect(() => {
        fetchNotes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]); // Only re-fetch when search changes, not selectedNoteId

    // Sort notes based on sortBy, but always keep pinned notes at top
    const sortedNotes = [...notes].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        switch (sortBy) {
            case 'oldest':
                return new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
            case 'title':
                return (a.title || '').localeCompare(b.title || '');
            case 'newest':
            default:
                return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        }
    });

    // Find the currently selected note object by ID - memoized to prevent unnecessary re-renders
    const selectedNote = useMemo(() =>
        notes.find(n => String(n.id) === selectedNoteId) || null,
        [notes, selectedNoteId]
    );

    // Professional auto-save function with proper state management
    const performAutoSave = useCallback(async (noteId: string, title: string, content: string) => {
        if (!noteId || !title.trim()) return;

        // Skip if no actual changes
        if (title === lastSavedRef.current.title && content === lastSavedRef.current.content) {
            setSaveStatus('saved');
            return;
        }

        // If already saving, mark as pending - the debounce will handle retry
        if (isSavingRef.current) {
            pendingSaveRef.current = true;
            setSaveStatus('unsaved');
            return;
        }

        isSavingRef.current = true;
        pendingSaveRef.current = false;
        setSaveStatus('saving');

        try {
            const result = await notesApi.update(noteId, {
                title: title.trim(),
                content: content,
            });

            if (result.success) {
                // Update lastSaved ONLY after successful save
                lastSavedRef.current = { title: title.trim(), content };
                setSaveStatus('saved');

                // Update notes list for sidebar (title preview)
                setNotes(prevNotes => prevNotes.map(note =>
                    String(note.id) === noteId
                        ? { ...note, title: title.trim(), content, updatedAt: new Date().toISOString() }
                        : note
                ));
            } else {
                setSaveStatus('error');
                if (result.error !== 'Unauthorized') {
                    showToast(result.error || 'Failed to save', 'error');
                }
            }
        } catch {
            setSaveStatus('error');
        } finally {
            isSavingRef.current = false;
        }
    }, [showToast]);

    // NOTE: Content loading is now handled synchronously in:
    // 1. Initial selection effect (when page loads)
    // 2. handleNoteSelect (when user clicks a note)
    // This prevents race conditions with RichTextEditor mounting with stale content.

    // Handle creating a new note
    const handleCreateNote = async (contentType: 'rich' | 'markdown') => {
        setIsCreating(true);
        setShowCreateMenu(false);
        try {
            const result = await notesApi.create({
                title: 'Untitled',
                content: '',
                contentType,
            });

            if (result.success && result.data) {
                showToast(`${contentType === 'rich' ? 'Rich Text' : 'Markdown'} note created`, 'success');
                const newNote = result.data;

                // Add the new note to local state directly (at the beginning)
                setNotes(prevNotes => [newNote, ...prevNotes]);

                // Set up editing state for the new note BEFORE selecting it
                setEditingTitle('Untitled');
                setEditingContent('');
                lastSavedRef.current = { title: 'Untitled', content: '' };
                setSaveStatus('saved');
                setViewMode('edit');

                // Select the new note
                setSelectedNoteId(String(newNote.id));

                // Focus title after render
                setTimeout(() => {
                    titleInputRef.current?.focus();
                    titleInputRef.current?.select();
                }, 50);
            } else {
                showToast(result.error || 'Failed to create note', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        } finally {
            setIsCreating(false);
        }
    };

    // Debounced auto-save effect - 1.5 seconds (industry standard)
    useEffect(() => {
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        if (!selectedNoteId) return;

        // Mark as unsaved if there are changes
        if (editingTitle !== lastSavedRef.current.title || editingContent !== lastSavedRef.current.content) {
            setSaveStatus('unsaved');
        }

        // Set 1.5s timer for auto-save (Notion-style)
        const noteId = String(selectedNoteId);
        const title = editingTitle;
        const content = editingContent;

        autoSaveTimerRef.current = setTimeout(() => {
            performAutoSave(noteId, title, content);
        }, 1500); // 1.5 seconds - responsive but not too aggressive

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [editingTitle, editingContent, selectedNoteId, performAutoSave]);

    // Save immediately function (for blur, visibility change, note switch)
    const saveNow = useCallback(() => {
        if (!selectedNoteId) return;
        if (editingTitle === lastSavedRef.current.title && editingContent === lastSavedRef.current.content) return;

        // Clear pending debounce timer
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        performAutoSave(String(selectedNoteId), editingTitle, editingContent);
    }, [selectedNoteId, editingTitle, editingContent, performAutoSave]);

    // Setup global listeners to flush save on visibility change / unload
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                saveNow();
            }
        };

        const handleBeforeUnload = () => {
            saveNow();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [saveNow]);

    // Save on component unmount
    useEffect(() => {
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, []);

    const handleNoteSelect = (newId: string) => {
        if (newId === selectedNoteId) return;

        // Save current note before switching
        saveNow();

        // Find the new note and load its content
        const newNote = notes.find(n => String(n.id) === newId);
        if (newNote) {
            loadNoteContent(newNote, newId);
        }
    };

    const handleTitleChange = (value: string) => {
        setEditingTitle(value);
    };

    const handleContentChange = (value: string) => {
        setEditingContent(value);
    };

    const handleDeleteClick = (note: Note) => {
        setNoteToDelete(note);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!noteToDelete) return;

        setIsDeleting(true);
        try {
            const result = await notesApi.delete(String(noteToDelete.id));
            if (result.success) {
                showToast('Note deleted successfully', 'success');
                // Remove from local state
                const remainingNotes = notes.filter(n => String(n.id) !== String(noteToDelete.id));
                setNotes(remainingNotes);
                // Select first note if available
                if (remainingNotes.length > 0) {
                    // If we deleted the selected note, select another one
                    if (String(noteToDelete.id) === selectedNoteId) {
                        setSelectedNoteId(String(remainingNotes[0].id));
                    }
                } else {
                    setSelectedNoteId(null);
                }
            } else {
                showToast(result.error || 'Failed to delete note', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        } finally {
            setIsDeleting(false);
            setDeleteConfirmOpen(false);
            setNoteToDelete(null);
        }
    };

    const handlePin = async (note: Note) => {
        try {
            const newPinned = !note.isPinned;
            const result = await notesApi.pin(String(note.id), newPinned);
            if (result.success) {
                showToast(newPinned ? 'Note pinned' : 'Note unpinned', 'success');
                // Update local state instead of fetchNotes to preserve selection/editing
                setNotes(prevNotes => prevNotes.map(n =>
                    String(n.id) === String(note.id) ? { ...n, isPinned: newPinned } : n
                ));
            } else {
                showToast('Failed to update note', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        }
    };

    const handleExportMarkdown = (note: Note) => {
        let markdown = note.content || '';
        // Basic conversion logic
        markdown = markdown.replace(/<[^>]+>/g, '').trim();
        const fullContent = `# ${note.title}\n\n${markdown}`;
        const blob = new Blob([fullContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${note.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Exported to Markdown', 'success');
    };

    const getActionMenuItems = (note: Note) => [
        {
            label: note.isPinned ? 'Unpin' : 'Pin',
            icon: 'push_pin',
            onClick: () => handlePin(note),
        },
        {
            label: 'Export .md',
            icon: 'download',
            onClick: () => handleExportMarkdown(note),
        },
        {
            label: 'Delete',
            icon: 'delete',
            onClick: () => handleDeleteClick(note),
            variant: 'danger' as const,
        },
    ];

    const handleTogglePublish = async () => {
        if (!selectedNote) return;
        setIsPublishing(true);
        try {
            if (selectedNote.isPublic) {
                const result = await notesApi.unpublish(String(selectedNote.id));
                if (result.success) {
                    showToast('Note is now private', 'success');
                    // Update local state
                    setNotes(prevNotes => prevNotes.map(n =>
                        String(n.id) === String(selectedNote.id) ? result.data! : n
                    ));
                } else {
                    showToast('Failed to unpublish', 'error');
                }
            } else {
                const result = await notesApi.publish(String(selectedNote.id));
                if (result.success) {
                    showToast('Note published! Link copied.', 'success');
                    if (result.data?.publicSlug) {
                        const url = `${window.location.origin}/note/${result.data.publicSlug}`;
                        navigator.clipboard.writeText(url);
                    }
                    // Update local state
                    setNotes(prevNotes => prevNotes.map(n =>
                        String(n.id) === String(selectedNote.id) ? result.data! : n
                    ));
                } else {
                    showToast('Failed to publish', 'error');
                }
            }
        } catch {
            showToast('Network error', 'error');
        } finally {
            setIsPublishing(false);
        }
    };

    const handleCopyPublicLink = () => {
        if (selectedNote?.publicSlug) {
            const url = `${window.location.origin}/note/${selectedNote.publicSlug}`;
            navigator.clipboard.writeText(url);
            showToast('Link copied to clipboard!', 'success');
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                showToast('Auto-save is enabled', 'info');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showToast]);

    return (
        <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#fdfdfd]">
            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => { setDeleteConfirmOpen(false); setNoteToDelete(null); }}
                onConfirm={handleDeleteConfirm}
                title="Delete Note"
                message={`Are you sure you want to delete "${noteToDelete?.title}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                isLoading={isDeleting}
            />
            <header className="flex items-center justify-between p-6 border-b border-border-light bg-[#fdfdfd] shrink-0">
                <div className="flex flex-col gap-1">
                    <h2 className="text-text-primary text-3xl font-extrabold tracking-tight">Notes</h2>
                    <p className="text-text-secondary text-base font-normal">Organize your thoughts and ideas.</p>
                </div>
                <div className="flex items-center gap-3 relative">
                    <button
                        onClick={() => setShowCreateMenu(!showCreateMenu)}
                        disabled={isCreating}
                        className="flex items-center justify-center rounded-xl h-10 px-5 bg-primary hover:bg-text-primary text-white gap-2 text-sm font-bold shadow-sm transition-all shadow-gray-200/50 disabled:opacity-50"
                    >
                        <Plus size={20} />
                        <span className="whitespace-nowrap">{isCreating ? 'Creating...' : 'Add Note'}</span>
                        <ChevronDown size={16} className={`transition-transform ${showCreateMenu ? 'rotate-180' : ''}`} />
                    </button>
                    {showCreateMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowCreateMenu(false)} />
                            <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-20 min-w-[200px]">
                                <button
                                    onClick={() => handleCreateNote('rich')}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                                >
                                    <FileText size={18} className="text-gray-600" />
                                    <div>
                                        <div className="font-medium text-gray-900">Rich Text</div>
                                        <div className="text-xs text-gray-500">WYSIWYG editor</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleCreateNote('markdown')}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                                >
                                    <Code2 size={18} className="text-gray-600" />
                                    <div>
                                        <div className="font-medium text-gray-900">Markdown</div>
                                        <div className="text-xs text-gray-500">Plain text with formatting</div>
                                    </div>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </header>
            {/* Conditional Layout: Grid View (no selection) or Sidebar+Editor (note selected) */}
            {!selectedNoteId ? (
                /* ===== GRID VIEW (No note selected) ===== */
                <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12">
                    <div className="max-w-6xl mx-auto">
                        {/* Grid Header with Search & Sort */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <input
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 border-none text-sm focus:ring-1 focus:ring-primary"
                                    placeholder="Search notes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setShowSortMenu(!showSortMenu)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors"
                                >
                                    <ArrowUpDown size={16} />
                                    Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'A-Z'}
                                </button>
                                {showSortMenu && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                                        <div className="absolute right-0 top-full mt-1 bg-[#fdfdfd] border border-gray-200 rounded-xl shadow-lg py-1 z-20 min-w-[140px]">
                                            <button onClick={() => { setSortBy('newest'); setShowSortMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">Newest</button>
                                            <button onClick={() => { setSortBy('oldest'); setShowSortMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">Oldest</button>
                                            <button onClick={() => { setSortBy('title'); setShowSortMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">A-Z</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Notes Grid */}
                        {isLoading ? (
                            <NoteGridSkeleton count={6} />
                        ) : error ? (
                            <ErrorState message={error} onRetry={fetchNotes} />
                        ) : notes.length === 0 ? (
                            <div className="flex justify-center py-20">
                                <EmptyState message="No notes yet. Create your first note!" icon="note_add" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sortedNotes.map((note) => (
                                    <div
                                        key={note.id}
                                        onClick={() => handleNoteSelect(String(note.id))}
                                        className="group flex flex-col p-4 rounded-xl border border-border-light bg-[#fdfdfd] hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-base font-bold text-text-primary line-clamp-1 flex-1">{note.title || 'Untitled'}</h4>
                                            <div className="flex items-center gap-1 ml-2">
                                                {note.isPinned && <Pin size={14} className="text-gray-900" />}
                                                <ActionMenu
                                                    items={getActionMenuItems(note)}
                                                    trigger={<MoreHorizontal size={16} className="text-gray-400" />}
                                                    className="opacity-0 group-hover:opacity-100"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-sm text-text-secondary mb-3 line-clamp-3 flex-1">
                                            {note.content?.replace(/<[^>]+>/g, '') || 'No content'}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100">
                                            <span>{formatDate(note.updatedAt || note.createdAt)}</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-200 text-gray-700">
                                                    {note.contentType === 'markdown' ? 'MD' : 'Rich'}
                                                </span>
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${note.isPublic ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                    {note.isPublic ? 'Public' : 'Private'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* ===== SIDEBAR + EDITOR VIEW (Note selected) ===== */
                <div className="flex flex-1 overflow-hidden">
                    {/* Notes List Sidebar */}
                    <aside className="w-[320px] shrink-0 flex flex-col border-r border-border-light bg-background-light overflow-y-auto">
                        {/* Sidebar Header with Back Button */}
                        <div className="p-5 border-b border-border-light sticky top-0 bg-background-light z-10 flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <button
                                    onClick={() => { saveNow(); setSelectedNoteId(null); }}
                                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    <span>All Notes ({notes.length})</span>
                                </button>
                                <div className="relative">
                                    <button onClick={() => setShowSortMenu(!showSortMenu)} className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded hover:bg-gray-100">
                                        <ArrowUpDown size={20} />
                                    </button>
                                    {showSortMenu && (
                                        <div className="absolute right-0 top-full mt-1 bg-[#fdfdfd] border border-gray-200 rounded-xl shadow-lg py-1 z-20 min-w-[140px]">
                                            <button onClick={() => { setSortBy('newest'); setShowSortMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">Newest</button>
                                            <button onClick={() => { setSortBy('oldest'); setShowSortMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">Oldest</button>
                                            <button onClick={() => { setSortBy('title'); setShowSortMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">A-Z</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 border-none text-sm focus:ring-1 focus:ring-primary"
                                    placeholder="Filter notes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        <div className="flex flex-col p-4 gap-2">
                            {isLoading ? (
                                <NoteSidebarSkeleton count={5} />
                            ) : error ? (
                                <ErrorState message={error} onRetry={fetchNotes} />
                            ) : notes.length === 0 ? (
                                <EmptyState message="No notes yet" icon="note_add" />
                            ) : (
                                sortedNotes.map((note) => (
                                    <div
                                        key={note.id}
                                        onClick={() => handleNoteSelect(String(note.id))}
                                        className={`group flex flex-col p-3 rounded-xl border transition-all cursor-pointer ${selectedNoteId === String(note.id) ? 'bg-[#fdfdfd] border-border-light shadow-sm' : 'hover:bg-gray-100 border-transparent bg-background-light'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`text-sm font-bold line-clamp-1 ${selectedNoteId === String(note.id) ? 'text-black' : 'text-text-primary'}`}>{note.title || 'Untitled'}</h4>
                                            <ActionMenu
                                                items={getActionMenuItems(note)}
                                                trigger={<MoreHorizontal size={16} />}
                                                className="opacity-0 group-hover:opacity-100"
                                            />
                                        </div>
                                        <p className="text-xs text-text-secondary mb-2 line-clamp-2">{note.content?.replace(/<[^>]+>/g, '') || 'No content'}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <span>{formatDate(note.updatedAt || note.createdAt)}</span>
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-200 text-gray-700">
                                                    {note.contentType === 'markdown' ? 'MD' : 'Rich'}
                                                </span>
                                            </div>
                                            {note.isPinned && <Pin size={14} className="text-gray-900" />}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </aside>

                    {/* Editor Area */}
                    <div className="flex-1 flex flex-col bg-[#fdfdfd] overflow-hidden min-h-0">
                        {selectedNote ? (
                            <>
                                <div className="flex items-center justify-between p-4 border-b border-border-light shrink-0">
                                    {/* Edit/Preview Toggle */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 items-center justify-center rounded-2xl bg-gray-100 p-1 border border-transparent">
                                            {(['edit', 'preview'] as const).map((mode) => (
                                                <label key={mode} className="cursor-pointer">
                                                    <input
                                                        className="peer sr-only"
                                                        name="view-toggle"
                                                        type="radio"
                                                        value={mode}
                                                        checked={viewMode === mode}
                                                        onChange={() => setViewMode(mode)}
                                                    />
                                                    <div className="h-full px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 peer-checked:bg-[#fdfdfd] peer-checked:shadow-sm peer-checked:text-black text-text-secondary text-xs font-semibold transition-all capitalize">
                                                        {mode === 'edit' ? <Edit3 size={14} /> : <Eye size={14} />}
                                                        {mode === 'edit' ? 'Edit' : 'Preview'}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Save Status & Actions */}
                                    <div className="flex items-center gap-3">
                                        {/* Save Status Indicator */}
                                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all ${saveStatus === 'saved' ? 'text-gray-600' :
                                            saveStatus === 'saving' ? 'text-gray-500' :
                                                saveStatus === 'unsaved' ? 'text-gray-500' :
                                                    'text-gray-700'
                                            }`}>
                                            {saveStatus === 'saved' && <Cloud size={14} />}
                                            {saveStatus === 'saving' && <Loader2 size={14} className="animate-spin" />}
                                            {saveStatus === 'unsaved' && <Cloud size={14} />}
                                            {saveStatus === 'error' && <CloudOff size={14} />}
                                            <span>
                                                {saveStatus === 'saved' && 'Saved'}
                                                {saveStatus === 'saving' && 'Saving...'}
                                                {saveStatus === 'unsaved' && 'Unsaved'}
                                                {saveStatus === 'error' && 'Error'}
                                            </span>
                                        </div>

                                        {/* Public/Private Toggle */}
                                        <button
                                            onClick={handleTogglePublish}
                                            disabled={isPublishing}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedNote.isPublic
                                                ? 'bg-gray-900 text-white hover:bg-gray-800'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {isPublishing ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : selectedNote.isPublic ? (
                                                <Globe size={14} />
                                            ) : (
                                                <Lock size={14} />
                                            )}
                                            {selectedNote.isPublic ? 'Public' : 'Private'}
                                        </button>
                                        {selectedNote.isPublic && (
                                            <button
                                                onClick={handleCopyPublicLink}
                                                className="flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                                                title="Copy public link"
                                            >
                                                <Link size={16} />
                                            </button>
                                        )}
                                        <ActionMenu items={getActionMenuItems(selectedNote)} />
                                    </div>
                                </div>

                                {/* Editor Content */}
                                <div className="flex-1 min-h-0" style={{ overflowY: 'auto', scrollbarGutter: 'stable' }}>
                                    <div className="max-w-5xl mx-auto px-6 py-12">
                                        <input
                                            ref={titleInputRef}
                                            value={editingTitle === 'Untitled' ? '' : editingTitle}
                                            onChange={(e) => handleTitleChange(e.target.value || 'Untitled')}
                                            onBlur={() => {
                                                if (!editingTitle || editingTitle.trim() === '') {
                                                    handleTitleChange('Untitled');
                                                }
                                            }}
                                            className="text-4xl font-bold bg-transparent outline-none w-full text-text-primary placeholder-gray-400 mb-6 caret-gray-900"
                                            placeholder="Untitled"
                                        />
                                        {selectedNote.contentType === 'markdown' ? (
                                            viewMode === 'edit' ? (
                                                <textarea
                                                    className="w-full min-h-[400px] bg-transparent outline-none text-text-primary font-mono text-sm resize-none leading-relaxed"
                                                    placeholder="Write your markdown here..."
                                                    value={editingContent}
                                                    onChange={(e) => handleContentChange(e.target.value)}
                                                />
                                            ) : (
                                                <MarkdownRenderer content={editingContent} />
                                            )
                                        ) : (
                                            // Rich text note
                                            viewMode === 'edit' ? (
                                                <RichTextEditor
                                                    key={selectedNoteId}
                                                    content={editingContent}
                                                    onChange={handleContentChange}
                                                    placeholder="Start writing..."
                                                />
                                            ) : (
                                                editingContent ? (
                                                    <div
                                                        className="rich-text-preview"
                                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(editingContent) }}
                                                    />
                                                ) : (
                                                    <p className="text-gray-400">No content</p>
                                                )
                                            )
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <EmptyState message="Select a note or create a new one" icon="article" />
                            </div>
                        )}
                    </div>
                </div>
            )
            }

            {/* Preview styling to match shared notes page */}
            <style>{`
                .rich-text-preview {
                    font-size: 15px;
                    line-height: 1.6;
                    color: #37352f;
                }
                .rich-text-preview > *:first-child { margin-top: 0; }
                .rich-text-preview > *:last-child { margin-bottom: 0; }
                .rich-text-preview h1 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 1rem 0 0.5rem;
                    color: #111827;
                }
                .rich-text-preview h2 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 0.75rem 0 0.4rem;
                    color: #111827;
                }
                .rich-text-preview h3 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin: 0.5rem 0 0.3rem;
                    color: #111827;
                }
                .rich-text-preview p {
                    margin: 0.25rem 0;
                    color: #374151;
                }
                .rich-text-preview ul {
                    margin: 0.25rem 0;
                    padding-left: 1.5rem;
                    list-style-type: disc;
                }
                .rich-text-preview ol {
                    margin: 0.25rem 0;
                    padding-left: 1.5rem;
                    list-style-type: decimal;
                }
                .rich-text-preview li {
                    margin: 0.125rem 0;
                }
                .rich-text-preview blockquote {
                    margin: 0.5rem 0;
                    padding: 0.25rem 0 0.25rem 1rem;
                    border-left: 3px solid #d1d5db;
                    color: #6b7280;
                }
                .rich-text-preview code {
                    background: #f3f4f6;
                    color: #e11d48;
                    padding: 0.125rem 0.25rem;
                    border-radius: 0.25rem;
                    font-size: 0.875rem;
                }
                .rich-text-preview pre {
                    background: #1f2937;
                    color: #e5e7eb;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    margin: 0.5rem 0;
                    overflow-x: auto;
                }
                .rich-text-preview pre code {
                    background: transparent;
                    color: inherit;
                    padding: 0;
                }
                .rich-text-preview a {
                    color: #18181b;
                    text-decoration: underline;
                }
                .rich-text-preview table {
                    border-collapse: collapse;
                    margin: 0.5rem 0;
                    width: 100%;
                }
                .rich-text-preview th,
                .rich-text-preview td {
                    border: 1px solid #e5e7eb;
                    padding: 0.5rem 0.75rem;
                    text-align: left;
                }
                .rich-text-preview th {
                    background: #f9fafb;
                    font-weight: 600;
                }
                .rich-text-preview hr {
                    border: none;
                    border-top: 1px solid #e5e7eb;
                    margin: 1rem 0;
                }
                .rich-text-preview strong {
                    font-weight: 600;
                    color: #111827;
                }
            `}</style>
        </main >
    );
}
