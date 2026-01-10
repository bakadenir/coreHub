import { useState, useEffect, useCallback, useMemo } from 'react';
import AddLinkModal from '../components/AddLinkModal';
import EditLinkModal from '../components/EditLinkModal';
import ActionMenu from '../components/ActionMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import { linksApi } from '../lib';
import type { LinkItem } from '../types';
import { EmptyState, ErrorState } from '../hooks/useApi';
import { LinkGridSkeleton } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';
import { Plus, ArrowUpDown, Search, Check, MoreHorizontal, Link as LinkLucide, ExternalLink, Pencil, Trash2, ArrowLeft } from 'lucide-react';

// Extract domain safely - moved outside component
const getDomain = (url: string) => {
    try {
        return url.replace('https://', '').replace('http://', '').split('/')[0];
    } catch {
        return '?';
    }
};

// Custom Favicon Component - moved outside main component to prevent re-creation on every render
function LinkFavicon({ link, size = 20, className }: { link: LinkItem, size?: number, className?: string }) {
    const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
    const [allFailed, setAllFailed] = useState(false);

    const domain = getDomain(link.url);

    // Multiple favicon sources to try in order
    const faviconSources = [
        link.image,
        `https://unavatar.io/${domain}`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        `https://icon.horse/icon/${domain}`,
        `https://${domain}/favicon.ico`,
    ].filter(Boolean);

    const handleError = () => {
        if (currentSourceIndex < faviconSources.length - 1) {
            setCurrentSourceIndex(prev => prev + 1);
        } else {
            setAllFailed(true);
        }
    };

    if (allFailed) {
        return (
            <div className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 border border-gray-200 shrink-0 font-bold uppercase select-none`} style={{ fontSize: size * 0.6 }}>
                {domain.charAt(0)}
            </div>
        );
    }

    return (
        <img
            alt={`Icon for ${link.title}`}
            className={`${className} object-contain bg-[#fdfdfd] shrink-0`}
            src={faviconSources[currentSourceIndex]}
            onError={handleError}
        />
    );
}

export default function Links() {
    const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
    const [isEditLinkOpen, setIsEditLinkOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const { showToast } = useToast();

    // Delete confirmation state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [linkToDelete, setLinkToDelete] = useState<LinkItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchLinks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await linksApi.getAll(searchTerm ? { search: searchTerm } : {});
            if (result.success && result.data) {
                setLinks(result.data);
                // Don't auto-reset to 0, set to null if out of bounds
                setSelectedIndex(prev =>
                    result.data && result.data.length > 0 && prev !== null && prev >= result.data.length ? null : prev
                );
            } else {
                setError(result.error || 'Failed to fetch links');
            }
        } catch {
            setError('Network error');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchLinks();
    }, [fetchLinks]);

    // Memoize sortedLinks to prevent unnecessary recalculations
    const sortedLinks = useMemo(() => {
        return [...links].sort((a, b) => {
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
    }, [links, sortBy]);

    const selectedLink = selectedIndex !== null ? sortedLinks[selectedIndex] : null;

    // Bubble selected link to top of sidebar list
    const displayLinks = useMemo(() => {
        if (!selectedLink) return sortedLinks;
        const others = sortedLinks.filter(l => l.id !== selectedLink.id);
        return [selectedLink, ...others];
    }, [sortedLinks, selectedLink]);

    const handleEdit = (link: LinkItem) => {
        setEditingLink(link);
        setIsEditLinkOpen(true);
    };

    const handleDeleteClick = (link: LinkItem) => {
        setLinkToDelete(link);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!linkToDelete) return;

        setIsDeleting(true);
        try {
            const result = await linksApi.delete(String(linkToDelete.id));
            if (result.success) {
                showToast('Link deleted successfully', 'success');
                // Remove from local state immediately
                const newLinks = links.filter(l => l.id !== linkToDelete.id);
                setLinks(newLinks);

                // Adjust selection index if needed
                if (newLinks.length === 0) {
                    setSelectedIndex(null);
                } else if (selectedIndex !== null) {
                    // If we deleted the link at, or before, the current index, we might need adjustment.
                    // But since selectedIndex refers to sortedLinks, and sortedLinks will change...
                    // Simply clamping to bound is usually sufficient to select "next" item in the shifting array.
                    // If we deleted the LAST item, decrement index.
                    // If we deleted middle item, index stays same (points to next item).
                    if (selectedIndex >= newLinks.length) {
                        setSelectedIndex(newLinks.length - 1);
                    }
                }
            } else {
                showToast(result.error || 'Failed to delete link', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        } finally {
            setIsDeleting(false);
            setDeleteConfirmOpen(false);
            setLinkToDelete(null);
        }
    };

    const handleCopyLink = (link: LinkItem) => {
        navigator.clipboard.writeText(link.url);
        showToast('Link copied to clipboard', 'success');
    };



    const getActionMenuItems = (link: LinkItem) => [
        {
            label: 'Open Link',
            icon: 'open_in_new',
            onClick: () => window.open(link.url, '_blank'),
        },
        {
            label: 'Edit',
            icon: 'edit',
            onClick: () => handleEdit(link),
        },
        {
            label: 'Copy URL',
            icon: 'content_copy',
            onClick: () => handleCopyLink(link),
        },
        {
            label: 'Delete',
            icon: 'delete',
            onClick: () => handleDeleteClick(link),
            variant: 'danger' as const,
        },
    ];



    return (
        <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light">
            <AddLinkModal isOpen={isAddLinkOpen} onClose={() => { setIsAddLinkOpen(false); fetchLinks(); }} />
            <EditLinkModal
                isOpen={isEditLinkOpen}
                onClose={() => { setIsEditLinkOpen(false); setEditingLink(null); fetchLinks(); }}
                link={editingLink}
            />
            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => { setDeleteConfirmOpen(false); setLinkToDelete(null); }}
                onConfirm={handleDeleteConfirm}
                title="Delete Link"
                message={`Are you sure you want to delete "${linkToDelete?.title || linkToDelete?.url}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                isLoading={isDeleting}
            />
            <header className="flex items-center justify-between p-6 border-b border-border-light bg-[#fdfdfd] shrink-0">
                <div className="flex flex-col gap-1">
                    <h2 className="text-text-primary text-3xl font-extrabold tracking-tight">Links</h2>
                    <p className="text-text-secondary text-base font-normal">Manage your curated web collection.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAddLinkOpen(true)}
                        className="flex items-center justify-center rounded-xl h-10 px-5 bg-primary hover:bg-text-primary text-white gap-2 text-sm font-bold shadow-sm transition-all shadow-gray-200/50"
                    >
                        <Plus size={20} />
                        <span className="whitespace-nowrap">Add Links</span>
                    </button>
                </div>
            </header>
            {/* Conditional Layout: Grid View (no selection) or Sidebar+Preview (link selected) */}
            {selectedIndex === null ? (
                /* ===== GRID VIEW (No link selected) ===== */
                <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12">
                    <div className="max-w-6xl mx-auto">
                        {/* Grid Header with Search & Sort */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <input
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 border-none text-sm focus:ring-1 focus:ring-gray-400"
                                    placeholder="Search links..."
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
                                            <button onClick={() => { setSortBy('newest'); setShowSortMenu(false); }} className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${sortBy === 'newest' ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                                {sortBy === 'newest' && <Check size={16} />}
                                                <span className={sortBy === 'newest' ? '' : 'ml-6'}>Newest</span>
                                            </button>
                                            <button onClick={() => { setSortBy('oldest'); setShowSortMenu(false); }} className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${sortBy === 'oldest' ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                                {sortBy === 'oldest' && <Check size={16} />}
                                                <span className={sortBy === 'oldest' ? '' : 'ml-6'}>Oldest</span>
                                            </button>
                                            <button onClick={() => { setSortBy('title'); setShowSortMenu(false); }} className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${sortBy === 'title' ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                                {sortBy === 'title' && <Check size={16} />}
                                                <span className={sortBy === 'title' ? '' : 'ml-6'}>A-Z</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Links Grid */}
                        {isLoading ? (
                            <LinkGridSkeleton count={6} />
                        ) : error ? (
                            <ErrorState message={error} onRetry={fetchLinks} />
                        ) : links.length === 0 ? (
                            <div className="flex justify-center py-20">
                                <EmptyState message="No links yet. Add your first link!" icon="link" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sortedLinks.map((link, index) => (
                                    <div
                                        key={link.id}
                                        onClick={() => setSelectedIndex(index)}
                                        className="group flex flex-col p-4 rounded-xl border border-border-light bg-[#fdfdfd] hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-start gap-3">
                                            <LinkFavicon
                                                link={link}
                                                size={20}
                                                className="size-10 rounded-lg shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-base font-bold text-text-primary line-clamp-1 capitalize">{link.title || 'Untitled'}</h4>
                                                <p className="text-xs text-gray-400 truncate">{getDomain(link.url)}</p>
                                            </div>
                                            <ActionMenu
                                                items={getActionMenuItems(link)}
                                                trigger={<MoreHorizontal size={16} className="text-gray-400" />}
                                                className="opacity-0 group-hover:opacity-100"
                                            />
                                        </div>
                                        {(link.tags && link.tags.length > 0) && (
                                            <div className="flex flex-wrap gap-1 mt-auto">
                                                {link.tags.slice(0, 3).map((tag, i) => (
                                                    <span key={i} className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                                                        #{tag}
                                                    </span>
                                                ))}
                                                {link.tags.length > 3 && (
                                                    <span className="text-gray-400 text-[10px]">+{link.tags.length - 3}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* ===== SIDEBAR + PREVIEW VIEW (Link selected) ===== */
                <div className="flex flex-1 overflow-hidden">
                    {/* Link Vault Sidebar */}
                    <aside className="w-[320px] shrink-0 flex flex-col border-r border-border-light bg-background-light overflow-y-auto">
                        <div className="p-5 border-b border-border-light sticky top-0 bg-background-light z-10 flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <button
                                    onClick={() => setSelectedIndex(null)}
                                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    <span>Link Vault ({links.length})</span>
                                </button>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowSortMenu(!showSortMenu)}
                                        className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded hover:bg-gray-100"
                                    >
                                        <ArrowUpDown size={20} />
                                    </button>
                                    {showSortMenu && (
                                        <div className="absolute right-0 top-full mt-1 bg-[#fdfdfd] border border-gray-200 rounded-xl shadow-lg py-1 z-20 min-w-[140px]">
                                            <button
                                                onClick={() => { setSortBy('newest'); setShowSortMenu(false); }}
                                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${sortBy === 'newest' ? 'text-gray-900 font-medium' : 'text-gray-600'}`}
                                            >
                                                {sortBy === 'newest' && <Check size={16} />}
                                                <span className={sortBy === 'newest' ? '' : 'ml-6'}>Newest</span>
                                            </button>
                                            <button
                                                onClick={() => { setSortBy('oldest'); setShowSortMenu(false); }}
                                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${sortBy === 'oldest' ? 'text-gray-900 font-medium' : 'text-gray-600'}`}
                                            >
                                                {sortBy === 'oldest' && <Check size={16} />}
                                                <span className={sortBy === 'oldest' ? '' : 'ml-6'}>Oldest</span>
                                            </button>
                                            <button
                                                onClick={() => { setSortBy('title'); setShowSortMenu(false); }}
                                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${sortBy === 'title' ? 'text-gray-900 font-medium' : 'text-gray-600'}`}
                                            >
                                                {sortBy === 'title' && <Check size={16} />}
                                                <span className={sortBy === 'title' ? '' : 'ml-6'}>A-Z</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 border border-border-light focus:border-text-primary focus:ring-0 text-text-primary text-sm placeholder-gray-400"
                                    placeholder="Filter links..."
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                        <div className="flex flex-col p-4 gap-2">
                            {isLoading ? (
                                <LinkGridSkeleton count={4} />
                            ) : error ? (
                                <ErrorState message={error} onRetry={fetchLinks} />
                            ) : links.length === 0 ? (
                                <EmptyState message="No links yet" icon="link" />
                            ) : (
                                displayLinks.map((link) => (
                                    <div
                                        key={link.id}
                                        onClick={() => {
                                            const realIndex = sortedLinks.findIndex(l => l.id === link.id);
                                            setSelectedIndex(realIndex);
                                        }}
                                        className={`group flex flex-col p-3 rounded-xl border transition-all cursor-pointer ${selectedLink?.id === link.id
                                            ? 'bg-[#fdfdfd] border-border-light shadow-sm'
                                            : 'bg-background-light border-transparent hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                                <LinkFavicon
                                                    link={link}
                                                    size={16}
                                                    className="size-8 rounded-lg"
                                                />
                                                <h4 className={`text-sm font-bold line-clamp-1 capitalize ${selectedLink?.id === link.id ? 'text-black' : 'text-text-primary font-medium'}`}>{link.title || 'Untitled'}</h4>
                                            </div>
                                            <ActionMenu
                                                items={getActionMenuItems(link)}
                                                trigger={<MoreHorizontal size={16} />}
                                                className="opacity-0 group-hover:opacity-100"
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </aside>

                    {/* Link Preview Panel */}
                    <div className="flex-1 flex flex-col overflow-y-auto bg-[#fdfdfd] p-8 md:p-12 lg:p-16">
                        {selectedLink ? (
                            <div className="mx-auto w-full max-w-4xl flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-3xl font-bold text-text-primary tracking-tight">Link Preview</h3>
                                    <ActionMenu items={getActionMenuItems(selectedLink)} />
                                </div>
                                <div className="bg-[#fdfdfd] rounded-xl p-6 shadow-sm border border-border-light flex flex-col gap-6">
                                    <div className="flex items-center gap-3">
                                        <LinkFavicon
                                            link={selectedLink}
                                            size={24}
                                            className="size-10 rounded-xl shadow-sm border border-gray-100"
                                        />
                                        <a className="text-xl font-bold text-text-primary hover:underline truncate capitalize" href={selectedLink.url} target="_blank" rel="noreferrer">
                                            {selectedLink.title || 'Untitled'}
                                        </a>
                                    </div>
                                    <p className="text-sm text-text-secondary flex items-center gap-2">
                                        <LinkLucide size={16} />
                                        <span className="truncate">{selectedLink.url}</span>
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {(selectedLink.tags || []).map((tag, i) => (
                                            <span key={i} className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full border border-gray-200">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-text-primary text-base leading-relaxed">
                                        {selectedLink.description || 'No description available.'}
                                    </p>
                                    <div className="flex gap-3 mt-4">
                                        <a
                                            href={selectedLink.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-center rounded-xl h-10 px-5 bg-gray-900 hover:bg-gray-800 text-white gap-2 text-sm font-semibold shadow-sm transition-all"
                                        >
                                            <ExternalLink size={18} />
                                            <span className="whitespace-nowrap">Open Link</span>
                                        </a>
                                        <button
                                            onClick={() => handleEdit(selectedLink)}
                                            className="flex items-center justify-center rounded-xl h-10 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 gap-2 text-sm font-semibold shadow-sm transition-all"
                                        >
                                            <Pencil size={18} />
                                            <span className="whitespace-nowrap">Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(selectedLink)}
                                            className="flex items-center justify-center rounded-xl h-10 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 gap-2 text-sm font-semibold shadow-sm transition-all"
                                        >
                                            <Trash2 size={18} />
                                            <span className="whitespace-nowrap">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <EmptyState message="Select a link to preview" icon="link" />
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
