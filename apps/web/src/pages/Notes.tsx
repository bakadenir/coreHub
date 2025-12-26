import { useState, useEffect, useCallback } from 'react';
import AddNoteModal from '../components/AddNoteModal';
import EditNoteModal from '../components/EditNoteModal';
import ActionMenu from '../components/ActionMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import { notesApi } from '../lib';
import type { Note } from '../types';
import { LoadingSpinner, EmptyState, ErrorState } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function Notes() {
    const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
    const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const { showToast } = useToast();

    // Delete confirmation state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
        // Pinned notes always come first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        // Within the same pin status, apply the selected sort
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

    const handleEdit = (note: Note) => {
        setEditingNote(note);
        setIsEditNoteOpen(true);
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

    const handleCopyFormatted = async () => {
        const contentElement = document.querySelector('.markdown-body');
        if (contentElement) {
            try {
                // Get HTML content
                const htmlContent = contentElement.innerHTML;
                // Get plain text as fallback
                const textContent = contentElement.textContent || '';

                // Create clipboard data with both HTML and plain text
                const clipboardItem = new ClipboardItem({
                    'text/html': new Blob([htmlContent], { type: 'text/html' }),
                    'text/plain': new Blob([textContent], { type: 'text/plain' }),
                });

                await navigator.clipboard.write([clipboardItem]);
                showToast('Content copied with formatting!', 'success');
            } catch {
                // Fallback to plain text copy
                const textContent = contentElement.textContent || '';
                await navigator.clipboard.writeText(textContent);
                showToast('Content copied as plain text', 'success');
            }
        }
    };

    const getActionMenuItems = (note: Note) => [
        {
            label: 'Edit',
            icon: 'edit',
            onClick: () => handleEdit(note),
        },
        {
            label: 'Copy formatted',
            icon: 'content_copy',
            onClick: () => handleCopyFormatted(),
        },
        {
            label: note.isPinned ? 'Unpin' : 'Pin',
            icon: note.isPinned ? 'push_pin' : 'push_pin',
            onClick: () => handlePin(note),
        },
        {
            label: 'Delete',
            icon: 'delete',
            onClick: () => handleDeleteClick(note),
            variant: 'danger' as const,
        },
    ];

    const selectedNote = sortedNotes[selectedIndex] || null;

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

    return (
        <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-white">
            <AddNoteModal isOpen={isAddNoteOpen} onClose={() => { setIsAddNoteOpen(false); fetchNotes(); }} />
            <EditNoteModal
                isOpen={isEditNoteOpen}
                onClose={() => { setIsEditNoteOpen(false); setEditingNote(null); fetchNotes(); }}
                note={editingNote}
            />
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
                        onClick={() => setIsAddNoteOpen(true)}
                        className="flex items-center justify-center rounded-lg h-10 px-5 bg-primary hover:bg-text-primary text-white gap-2 text-sm font-bold shadow-sm transition-all shadow-gray-200/50"
                    >
                        <span className="material-icons-outlined text-[20px]">add</span>
                        <span className="whitespace-nowrap">Add Notes</span>
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
                                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[140px]">
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
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 border border-border-light focus:border-text-primary focus:ring-0 text-text-primary text-sm placeholder-gray-400"
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
                                    onClick={() => setSelectedIndex(index)}
                                    className={`group flex flex-col p-3 rounded-lg border transition-all cursor-pointer ${selectedIndex === index
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
                                    <p className="text-xs text-text-secondary mb-2 line-clamp-2">{note.content}</p>
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
                <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 md:p-12 lg:p-16">
                    {selectedNote ? (
                        <div className="mx-auto w-full max-w-3xl flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h1 className="text-4xl font-black text-text-primary">
                                    {selectedNote.title}
                                </h1>
                                <ActionMenu items={getActionMenuItems(selectedNote)} />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                                <span className="material-icons-outlined text-base">event</span>
                                <span>Last edited: {formatDate(selectedNote.updatedAt || selectedNote.createdAt)}</span>
                                {selectedNote.tag && (
                                    <>
                                        <span className="mx-2 text-gray-300">|</span>
                                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{selectedNote.tag}</span>
                                    </>
                                )}
                            </div>
                            <MarkdownRenderer content={selectedNote.content || ''} />
                        </div>
                    ) : (
                        <EmptyState message="Select a note to view" icon="article" />
                    )}
                </div>
            </div>
        </main>
    );
}
