import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import AddNoteModal from '../components/AddNoteModal';
import NavigationSidebar from '../components/NavigationSidebar';
import { notesApi } from '../lib';
import type { Note } from '../types';
import { LoadingSpinner, EmptyState, ErrorState } from '../hooks/useApi';

export default function Notes() {
    const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    const selectedNote = notes[selectedIndex] || null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Just now';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="flex flex-col h-screen w-full bg-background-light text-text-primary font-sans overflow-hidden">
            <AddNoteModal isOpen={isAddNoteOpen} onClose={() => { setIsAddNoteOpen(false); fetchNotes(); }} />
            <Header subtitle="Workspace" />
            <div className="flex flex-1 overflow-hidden w-full">
                <NavigationSidebar />

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-white">
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
                                    <button className="text-text-secondary hover:text-text-primary transition-colors">
                                        <span className="material-icons-outlined text-[20px]">sort</span>
                                    </button>
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
                                    notes.map((note, index) => (
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
                                                <button className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-text-primary transition-opacity">
                                                    <span className="material-icons-outlined text-[16px]">more_horiz</span>
                                                </button>
                                            </div>
                                            <p className="text-xs text-text-secondary mb-2 line-clamp-2">{note.content}</p>
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>{formatDate(note.date)}</span>
                                                {note.isPinned && <span className="material-icons-outlined text-[14px]">push_pin</span>}
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
                                    <input
                                        className="block w-full border-none px-0 text-4xl font-black text-text-primary bg-transparent focus:ring-0 placeholder:text-gray-300 outline-none"
                                        placeholder="Note Title"
                                        type="text"
                                        value={selectedNote.title}
                                        readOnly
                                    />
                                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                                        <span className="material-icons-outlined text-base">event</span>
                                        <span>Last edited: {formatDate(selectedNote.date)}</span>
                                        {selectedNote.tag && (
                                            <>
                                                <span className="mx-2 text-gray-300">|</span>
                                                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{selectedNote.tag}</span>
                                            </>
                                        )}
                                    </div>
                                    <textarea
                                        className="block w-full min-h-[500px] border-none px-0 text-lg font-serif-body text-text-primary bg-transparent focus:ring-0 placeholder:text-gray-400 resize-none outline-none"
                                        placeholder="Start writing your note here..."
                                        value={selectedNote.content}
                                        readOnly
                                    ></textarea>
                                </div>
                            ) : (
                                <EmptyState message="Select a note to view" icon="article" />
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
