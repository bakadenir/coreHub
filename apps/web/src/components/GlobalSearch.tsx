import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchApi, type SearchResult } from '../lib/search.api';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        if (!query.trim() || query.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const result = await searchApi.search(query);
                if (result.success && result.data) {
                    setResults(result.data);
                    setSelectedIndex(0);
                }
            } catch {
                console.error('Search failed');
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && results.length > 0) {
            e.preventDefault();
            handleSelect(results[selectedIndex]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    }, [results, selectedIndex, onClose]);

    const handleSelect = (result: SearchResult) => {
        const routes: Record<string, string> = {
            habit: '/habits',
            note: '/notes',
            link: '/links',
            schedule: '/schedule',
        };

        navigate(routes[result.type] || '/dashboard');
        onClose();
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            habit: 'Habit',
            note: 'Note',
            link: 'Link',
            schedule: 'Event',
        };
        return labels[type] || type;
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            habit: 'bg-green-100 text-green-700',
            note: 'bg-blue-100 text-blue-700',
            link: 'bg-purple-100 text-purple-700',
            schedule: 'bg-orange-100 text-orange-700',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    // Handle escape globally
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
                onClick={onClose}
            />

            {/* Search Modal */}
            <div className={`relative w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-200 ease-out ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4'}`}>
                {/* Search Input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <span className="material-icons-outlined text-gray-400 text-xl">search</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search habits, notes, links, events..."
                        className="flex-1 text-lg text-text-primary placeholder-gray-400 outline-none bg-transparent"
                    />
                    {isLoading && (
                        <span className="material-icons-outlined text-gray-400 text-xl animate-spin">refresh</span>
                    )}
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded border border-gray-200">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[400px] overflow-y-auto">
                    {query.length >= 2 && results.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <span className="material-icons-outlined text-5xl mb-3">search_off</span>
                            <p className="text-sm">No results found for "{query}"</p>
                        </div>
                    )}

                    {query.length < 2 && !isLoading && (
                        <div className="p-6">
                            <p className="text-sm text-gray-400 text-center">Type at least 2 characters to search</p>
                            <div className="mt-6 flex flex-wrap gap-2 justify-center">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500">
                                    <span className="material-icons-outlined text-[14px]">self_improvement</span>
                                    Habits
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500">
                                    <span className="material-icons-outlined text-[14px]">description</span>
                                    Notes
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500">
                                    <span className="material-icons-outlined text-[14px]">link</span>
                                    Links
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500">
                                    <span className="material-icons-outlined text-[14px]">event</span>
                                    Events
                                </span>
                            </div>
                        </div>
                    )}

                    {results.length > 0 && (
                        <ul className="py-2">
                            {results.map((result, index) => (
                                <li key={`${result.type}-${result.id}`}>
                                    <button
                                        onClick={() => handleSelect(result)}
                                        className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${index === selectedIndex
                                            ? 'bg-gray-100'
                                            : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                            <span className="material-icons-outlined text-gray-600 text-lg">
                                                {result.icon}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-text-primary truncate">
                                                {result.title}
                                            </p>
                                            {result.subtitle && (
                                                <p className="text-xs text-gray-400 truncate">
                                                    {result.subtitle}
                                                </p>
                                            )}
                                        </div>
                                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${getTypeColor(result.type)}`}>
                                            {getTypeLabel(result.type)}
                                        </span>
                                        {index === selectedIndex && (
                                            <span className="material-icons-outlined text-gray-400 text-base">
                                                keyboard_return
                                            </span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded-md text-[10px]">↑</kbd>
                            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded-md text-[10px]">↓</kbd>
                            navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded-md text-[10px]">↵</kbd>
                            select
                        </span>
                    </div>
                    <span className="flex items-center gap-1">
                        Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded-md text-[10px] mx-1">/</kbd> to search anywhere
                    </span>
                </div>
            </div>
        </div>
    );
}
