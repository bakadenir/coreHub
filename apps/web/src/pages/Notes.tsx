import { useState, useEffect, useCallback, useRef } from 'react';
import ActionMenu from '../components/ActionMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import RichTextEditor from '../components/RichTextEditor';
import { notesApi } from '../lib';
import type { Note } from '../types';
import { LoadingSpinner, EmptyState, ErrorState } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';

export default function Notes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const { showToast } = useToast();

    // Editing state
    const [editingTitle, setEditingTitle] = useState('');
    const [editingContent, setEditingContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const titleInputRef = useRef<HTMLInputElement>(null);

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
                if (result.data.length > 0 && selectedIndex >= result.data.length) {
                    setSelectedIndex(0);
                }
            } else {
                setError(result.error || 'Failed to fetch notes');
            }
        } catch {
            setError('Network error');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, selectedIndex]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

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

    const selectedNote = sortedNotes[selectedIndex] || null;

    // Sync editing state with selected note
    useEffect(() => {
        if (selectedNote) {
            setEditingTitle(selectedNote.title || '');
            setEditingContent(selectedNote.content || '');
            setHasUnsavedChanges(false);
        }
    }, [selectedNote?.id]);

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
                await fetchNotes();
                // Select the new note (it should be first if sorted by newest)
                setSelectedIndex(0);
                setEditingTitle('Untitled');
                setEditingContent('');
                // Focus the title input
                setTimeout(() => {
                    titleInputRef.current?.focus();
                    titleInputRef.current?.select();
                }, 100);
            } else {
                showToast(result.error || 'Failed to create note', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        } finally {
            setIsCreating(false);
        }
    };

    // Handle saving note
    const handleSave = async () => {
        if (!selectedNote) return;
        if (!editingTitle.trim()) {
            showToast('Title cannot be empty', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const result = await notesApi.update(String(selectedNote.id), {
                title: editingTitle.trim(),
                content: editingContent,
            });

            if (result.success) {
                showToast('Note saved', 'success');
                setHasUnsavedChanges(false);
                fetchNotes();
            } else {
                showToast(result.error || 'Failed to save note', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // Track unsaved changes
    const handleTitleChange = (value: string) => {
        setEditingTitle(value);
        setHasUnsavedChanges(true);
    };

    const handleContentChange = (value: string) => {
        setEditingContent(value);
        setHasUnsavedChanges(true);
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
                fetchNotes();
                setSelectedIndex(0);
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
                fetchNotes();
            } else {
                showToast('Failed to update note', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        }
    };

    // Export to Markdown
    const handleExportMarkdown = (note: Note) => {
        // Simple HTML to Markdown conversion
        let markdown = note.content || '';

        // Convert HTML to basic markdown
        markdown = markdown
            .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
            .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
            .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
            .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
            .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
            .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
            .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
            .replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~')
            .replace(/<strike[^>]*>(.*?)<\/strike>/gi, '~~$1~~')
            .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
            .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
            .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n')
            .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
            .replace(/<ul[^>]*>|<\/ul>/gi, '\n')
            .replace(/<ol[^>]*>|<\/ol>/gi, '\n')
            .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<hr\s*\/?>/gi, '\n---\n')
            .replace(/<[^>]+>/g, '') // Remove remaining HTML tags
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .trim();

        // Add title
        const fullContent = `# ${note.title}\n\n${markdown}`;

        // Create and download file
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

    // Handle publish/unpublish
    const handleTogglePublish = async () => {
        if (!selectedNote) return;

        setIsPublishing(true);
        try {
            if (selectedNote.isPublic) {
                const result = await notesApi.unpublish(String(selectedNote.id));
                if (result.success) {
                    showToast('Note is now private', 'success');
                    fetchNotes();
                } else {
                    showToast('Failed to unpublish', 'error');
                }
            } else {
                const result = await notesApi.publish(String(selectedNote.id));
                if (result.success) {
                    showToast('Note published! Link copied.', 'success');
                    // Copy link to clipboard
                    if (result.data?.publicSlug) {
                        const url = `${window.location.origin}/note/${result.data.publicSlug}`;
                        navigator.clipboard.writeText(url);
                    }
                    fetchNotes();
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
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Keyboard shortcut for save
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (hasUnsavedChanges && selectedNote) {
                    handleSave();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hasUnsavedChanges, selectedNote, editingTitle, editingContent]);

    return (
        <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-white">
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
            <header className="flex items-center justify-between p-6 border-b border-border-light bg-white shrink-0">
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
                        <span className="material-icons-outlined text-[20px]">add</span>
                        <span className="whitespace-nowrap">{isCreating ? 'Creating...' : 'Add Notes'}</span>
                    </button>
                </div>
            </header>
            <div className="flex flex-1 overflow-hidden">
                {/* Notes List Sidebar */}
                <aside className="w-[320px] shrink-0 flex flex-col border-r border-border-light bg-background-light overflow-y-auto">
                    <div className="p-5 border-b border-border-light sticky top-0 bg-background-light z-10 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-base font-bold text-text-primary">All Notes ({notes.length})</h3>
                            <div className="relative">
                                <button
                                    onClick={() => setShowSortMenu(!showSortMenu)}
                                    className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded hover:bg-gray-100"
                                >
                                    <span className="material-icons-outlined text-[20px]">sort</span>
                                </button>
                                {showSortMenu && (
                                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20 min-w-[140px]">
                                        <button
                                            onClick={() => { setSortBy('newest'); setShowSortMenu(false); }}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${sortBy === 'newest' ? 'text-primary font-medium' : 'text-text-primary'}`}
                                        >
                                            {sortBy === 'newest' && <span className="material-icons-outlined text-[16px]">check</span>}
                                            <span className={sortBy === 'newest' ? '' : 'ml-6'}>Newest</span>
                                        </button>
                                        <button
                                            onClick={() => { setSortBy('oldest'); setShowSortMenu(false); }}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${sortBy === 'oldest' ? 'text-primary font-medium' : 'text-text-primary'}`}
                                        >
                                            {sortBy === 'oldest' && <span className="material-icons-outlined text-[16px]">check</span>}
                                            <span className={sortBy === 'oldest' ? '' : 'ml-6'}>Oldest</span>
                                        </button>
                                        <button
                                            onClick={() => { setSortBy('title'); setShowSortMenu(false); }}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${sortBy === 'title' ? 'text-primary font-medium' : 'text-text-primary'}`}
                                        >
                                            {sortBy === 'title' && <span className="material-icons-outlined text-[16px]">check</span>}
                                            <span className={sortBy === 'title' ? '' : 'ml-6'}>A-Z (Title)</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="relative">
                            <input
                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 border border-border-light focus:border-text-primary focus:ring-0 text-text-primary text-sm placeholder-gray-400"
                                placeholder="Filter notes..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
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
                            sortedNotes.map((note, index) => (
                                <div
                                    key={note.id}
                                    onClick={() => {
                                        // Warn about unsaved changes
                                        if (hasUnsavedChanges && selectedIndex !== index) {
                                            if (!confirm('You have unsaved changes. Discard?')) return;
                                        }
                                        setSelectedIndex(index);
                                    }}
                                    className={`group flex flex-col p-3 rounded-xl border transition-all cursor-pointer ${selectedIndex === index
                                        ? 'bg-white border-border-light shadow-sm'
                                        : 'bg-background-light border-transparent hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm font-bold line-clamp-1 ${selectedIndex === index ? 'text-black' : 'text-text-primary font-medium'}`}>{note.title}</h4>
                                        <ActionMenu
                                            items={getActionMenuItems(note)}
                                            trigger={<span className="material-icons-outlined text-[16px]">more_horiz</span>}
                                            className="opacity-0 group-hover:opacity-100"
                                        />
                                    </div>
                                    <p className="text-xs text-text-secondary mb-2 line-clamp-2">{note.content?.replace(/<[^>]*>/g, '') || ''}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{formatDate(note.updatedAt || note.createdAt)}</span>
                                        <div className="flex items-center gap-2">
                                            {note.tag && <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">{note.tag}</span>}
                                            {note.isPinned && <span className="material-icons-outlined text-[14px] text-primary">push_pin</span>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* Notes Editor Area */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white">
                    {selectedNote ? (
                        <>
                            {/* Editor Header */}
                            <div className="flex items-center justify-between p-4 border-b border-border-light shrink-0">
                                <div className="flex items-center gap-3">
                                    <input
                                        ref={titleInputRef}
                                        type="text"
                                        value={editingTitle}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        className="text-2xl font-bold text-text-primary bg-transparent border-none outline-none focus:ring-0 w-full max-w-md"
                                        placeholder="Note title..."
                                    />
                                    {hasUnsavedChanges && (
                                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">Unsaved</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Publish Toggle */}
                                    <div className="flex items-center gap-2 mr-2">
                                        <button
                                            onClick={handleTogglePublish}
                                            disabled={isPublishing}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${selectedNote.isPublic
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                } ${isPublishing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <span className="material-icons-outlined text-base">
                                                {selectedNote.isPublic ? 'public' : 'lock'}
                                            </span>
                                            {isPublishing ? 'Processing...' : selectedNote.isPublic ? 'Public' : 'Private'}
                                        </button>
                                        {selectedNote.isPublic && selectedNote.publicSlug && (
                                            <button
                                                onClick={handleCopyPublicLink}
                                                className="flex items-center gap-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-600 transition-colors"
                                                title="Copy public link"
                                            >
                                                <span className="material-icons-outlined text-base">link</span>
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving || !hasUnsavedChanges}
                                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-icons-outlined text-lg">save</span>
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                    <ActionMenu items={getActionMenuItems(selectedNote)} />
                                </div>
                            </div>

                            {/* Date info */}
                            <div className="flex items-center gap-2 text-sm text-text-secondary px-4 py-2 border-b border-border-light shrink-0">
                                <span className="material-icons-outlined text-base">event</span>
                                <span>Last edited: {formatDate(selectedNote.updatedAt || selectedNote.createdAt)}</span>
                                {selectedNote.tag && (
                                    <>
                                        <span className="mx-2 text-gray-300">|</span>
                                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{selectedNote.tag}</span>
                                    </>
                                )}
                            </div>

                            {/* Rich Text Editor */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="max-w-3xl mx-auto">
                                    <RichTextEditor
                                        content={editingContent}
                                        onChange={handleContentChange}
                                        placeholder="Start writing your note..."
                                        autoFocus={false}
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
