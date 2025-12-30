import { useState, useEffect, useCallback, useRef } from 'react';
import ActionMenu from '../components/ActionMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import RichTextEditor from '../components/RichTextEditor';
import { notesApi } from '../lib';
import type { Note } from '../types';
import { LoadingSpinner, EmptyState, ErrorState } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import { useLocation } from 'react-router-dom';
import { Plus, ArrowUpDown, Search, MoreHorizontal, Pin, Globe, Lock, Link } from 'lucide-react';

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
    const titleInputRef = useRef<HTMLInputElement>(null);
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSavedRef = useRef<{ title: string; content: string }>({ title: '', content: '' });
    const editingDataRef = useRef({ title: '', content: '', noteId: '' });
    const skipNextSyncRef = useRef(false); // Flag to skip sync after create

    // Delete confirmation state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Creating new note state
    const [isCreating, setIsCreating] = useState(false);

    // Publishing state
    const [isPublishing, setIsPublishing] = useState(false);

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

    // Handle initial selection logic
    useEffect(() => {
        if (!isLoading && notes.length > 0) {
            // If we have a location state with a noteId, prioritize it
            if (location.state?.noteId) {
                const targetId = String(location.state.noteId);
                // Only switch if we're not already there (though valid to force it if needed)
                if (selectedNoteId !== targetId) {
                    setSelectedNoteId(targetId);
                }
            }
            // Otherwise, if nothing is selected, select the first note
            else if (!selectedNoteId) {
                setSelectedNoteId(String(notes[0].id));
            }
        }
    }, [notes, isLoading, location.state, selectedNoteId]);

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

    // Find the currently selected note object by ID
    const selectedNote = notes.find(n => String(n.id) === selectedNoteId) || null;

    // Track latest editing data for event listeners
    useEffect(() => {
        if (selectedNoteId) {
            editingDataRef.current = {
                title: editingTitle,
                content: editingContent,
                noteId: String(selectedNoteId)
            };
        }
    }, [editingTitle, editingContent, selectedNoteId]);

    // Auto-save function
    const performAutoSave = useCallback(async (title: string, content: string, noteId: string) => {
        if (!noteId) {
            console.log('[AutoSave] Skipped: No noteId');
            return;
        }
        if (!title.trim()) {
            console.log('[AutoSave] Skipped: Empty title');
            return;
        }

        // Check if there are actual changes
        if (title === lastSavedRef.current.title && content === lastSavedRef.current.content) {
            console.log('[AutoSave] Skipped: No changes detected');
            return;
        }

        console.log('[AutoSave] Saving...', { noteId, titleLength: title.length, contentLength: content.length });

        try {
            const result = await notesApi.update(noteId, {
                title: title.trim(),
                content: content,
            });

            if (result.success) {
                console.log('[AutoSave] Success!');
                lastSavedRef.current = { title: title.trim(), content };

                // Update notes list locally without refetching
                setNotes(prevNotes => prevNotes.map(note =>
                    String(note.id) === noteId
                        ? { ...note, title: title.trim(), content, updatedAt: new Date().toISOString() }
                        : note
                ));
            } else {
                console.log('[AutoSave] Failed:', result.error);
                if (result.error !== 'Unauthorized') {
                    showToast(result.error || 'Failed to auto-save', 'error');
                }
            }
        } catch (e) {
            console.error('[AutoSave] Error:', e);
        }
    }, [showToast]);

    // Force save current data immediately
    const saveImmediately = useCallback(async () => {
        const { title, content, noteId } = editingDataRef.current;
        if (!noteId || noteId === 'null') return;

        // Let performAutoSave handle the diff checking logic
        await performAutoSave(title, content, noteId);
    }, [performAutoSave]);

    // Sync editing state with selected note
    useEffect(() => {
        if (selectedNote) {
            // Skip sync if we just created a note (handled in handleCreateNote)
            if (skipNextSyncRef.current) {
                skipNextSyncRef.current = false;
                console.log('[Sync] Skipped due to skipNextSyncRef');
                return;
            }

            const title = selectedNote.title || '';
            const content = selectedNote.content || '';
            console.log('[Sync] Syncing note:', { id: selectedNote.id, title, contentLen: content.length });
            setEditingTitle(title);
            setEditingContent(content);
            lastSavedRef.current = { title, content };
            // Update ref immediately too
            editingDataRef.current = { title, content, noteId: String(selectedNote.id) };
        }
    }, [selectedNote]); // Only re-run if note object changes

    // Handle creating a new note
    const handleCreateNote = async () => {
        setIsCreating(true);
        try {
            const result = await notesApi.create({
                title: 'Untitled',
                content: '',
            });

            if (result.success && result.data) {
                showToast('Note created', 'success');
                const newNote = result.data;

                // IMPORTANT: Set skip flag BEFORE any state changes
                skipNextSyncRef.current = true;

                // Add the new note to local state directly (at the beginning)
                setNotes(prevNotes => [newNote, ...prevNotes]);

                // Set up editing state for the new note
                setEditingTitle('Untitled');
                setEditingContent('');
                lastSavedRef.current = { title: 'Untitled', content: '' };

                // Select the new note AFTER state is updated
                setTimeout(() => {
                    setSelectedNoteId(String(newNote.id));
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

    // Debounced auto-save effect (30 seconds)
    useEffect(() => {
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        if (!selectedNoteId) return;

        // Skip if content matches what's already saved
        if (editingTitle === lastSavedRef.current.title && editingContent === lastSavedRef.current.content) {
            return;
        }

        // Set 30s timer for auto-save
        const noteId = String(selectedNoteId);
        autoSaveTimerRef.current = setTimeout(() => {
            performAutoSave(editingTitle, editingContent, noteId);
        }, 30000); // 30 seconds delay

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [editingTitle, editingContent, selectedNoteId, performAutoSave]);

    // Setup global listeners to flush save on visibility change / unload
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                saveImmediately();
            }
        };

        const handleBeforeUnload = () => {
            saveImmediately();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Also flush on unmount
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            saveImmediately();
        };
    }, [saveImmediately]);

    const handleNoteSelect = async (newId: string) => {
        // Flush changes for OLD note before switching
        await saveImmediately();
        setSelectedNoteId(newId);
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
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCreateNote}
                        disabled={isCreating}
                        className="flex items-center justify-center rounded-xl h-10 px-5 bg-primary hover:bg-text-primary text-white gap-2 text-sm font-bold shadow-sm transition-all shadow-gray-200/50 disabled:opacity-50"
                    >
                        <Plus size={20} />
                        <span className="whitespace-nowrap">{isCreating ? 'Creating...' : 'Add Notes'}</span>
                    </button>
                </div>
            </header>
            <div className="flex flex-1 overflow-hidden">
                {/* Notes List Sidebar */}
                <aside className="w-[320px] shrink-0 flex flex-col border-r border-border-light bg-background-light overflow-y-auto">
                    {/* Simplified Sidebar Header */}
                    <div className="p-5 border-b border-border-light sticky top-0 bg-background-light z-10 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-base font-bold text-text-primary">All Notes ({notes.length})</h3>
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
                            <LoadingSpinner message="Loading notes..." />
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
                                        <span>{formatDate(note.updatedAt || note.createdAt)}</span>
                                        {note.isPinned && <Pin size={14} className="text-primary" />}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* Editor Area */}
                <div className="flex-1 flex flex-col bg-[#fdfdfd] overflow-hidden">
                    {selectedNote ? (
                        <>
                            <div className="flex items-center justify-between p-4 border-b border-border-light shrink-0">
                                <div className="flex items-center gap-3 flex-1">
                                    <input
                                        ref={titleInputRef}
                                        value={editingTitle}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        className="text-2xl font-bold bg-transparent outline-none w-full max-w-md text-text-primary placeholder-gray-300"
                                        placeholder="Note title..."
                                    />

                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleTogglePublish}
                                        disabled={isPublishing}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${selectedNote.isPublic ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {selectedNote.isPublic ? <Globe size={16} /> : <Lock size={16} />}
                                        {isPublishing ? '...' : selectedNote.isPublic ? 'Public' : 'Private'}
                                    </button>
                                    {selectedNote.isPublic && (
                                        <button onClick={handleCopyPublicLink} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-xl text-gray-500 border border-transparent hover:border-gray-200 transition-colors" title="Copy Link">
                                            <Link size={18} />
                                        </button>
                                    )}

                                    <ActionMenu items={getActionMenuItems(selectedNote)} />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="max-w-3xl mx-auto">
                                    <RichTextEditor
                                        content={editingContent}
                                        onChange={handleContentChange}
                                        placeholder="Start writing your note..."
                                    />
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
        </main>
    );
}
