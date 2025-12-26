import { useState, useEffect, useCallback } from 'react';
import AddLinkModal from '../components/AddLinkModal';
import EditLinkModal from '../components/EditLinkModal';
import ActionMenu from '../components/ActionMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import { linksApi } from '../lib';
import type { LinkItem } from '../types';
import { LoadingSpinner, EmptyState, ErrorState } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';

export default function Links() {
    const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
    const [isEditLinkOpen, setIsEditLinkOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
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
                if (result.data.length > 0 && selectedIndex >= result.data.length) {
                    setSelectedIndex(0);
                }
            } else {
                setError(result.error || 'Failed to fetch links');
            }
        } catch {
            setError('Network error');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, selectedIndex]);

    useEffect(() => {
        fetchLinks();
    }, [fetchLinks]);

    // Sort links based on sortBy, but always keep pinned links at top
    const sortedLinks = [...links].sort((a, b) => {
        // Pinned links always come first
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
                fetchLinks();
                setSelectedIndex(0);
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

    const handlePin = async (link: LinkItem) => {
        try {
            const newPinned = !link.isPinned;
            const result = await linksApi.pin(String(link.id), newPinned);
            if (result.success) {
                showToast(newPinned ? 'Link pinned' : 'Link unpinned', 'success');
                fetchLinks();
            } else {
                showToast('Failed to update link', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        }
    };

    const getActionMenuItems = (link: LinkItem) => [
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
            label: link.isPinned ? 'Unpin' : 'Pin',
            icon: 'push_pin',
            onClick: () => handlePin(link),
        },
        {
            label: 'Delete',
            icon: 'delete',
            onClick: () => handleDeleteClick(link),
            variant: 'danger' as const,
        },
    ];

    const selectedLink = sortedLinks[selectedIndex] || null;

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
            <header className="flex items-center justify-between p-6 border-b border-border-light bg-white shrink-0">
                <div className="flex flex-col gap-1">
                    <h2 className="text-text-primary text-3xl font-extrabold tracking-tight">Links</h2>
                    <p className="text-text-secondary text-base font-normal">Manage your curated web collection.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAddLinkOpen(true)}
                        className="flex items-center justify-center rounded-xl h-10 px-5 bg-primary hover:bg-text-primary text-white gap-2 text-sm font-bold shadow-sm transition-all shadow-gray-200/50"
                    >
                        <span className="material-icons-outlined text-[20px]">add</span>
                        <span className="whitespace-nowrap">Add Links</span>
                    </button>
                </div>
            </header>
            <div className="flex flex-1 overflow-hidden">
                {/* Link Vault Sidebar */}
                <aside className="w-[320px] shrink-0 flex flex-col border-r border-border-light bg-background-light overflow-y-auto">
                    <div className="p-5 border-b border-border-light sticky top-0 bg-background-light z-10 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-base font-bold text-text-primary">Link Vault ({links.length})</h3>
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
                                placeholder="Filter links..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                        </div>
                    </div>
                    <div className="flex flex-col p-4 gap-2">
                        {isLoading ? (
                            <LoadingSpinner message="Loading links..." />
                        ) : error ? (
                            <ErrorState message={error} onRetry={fetchLinks} />
                        ) : links.length === 0 ? (
                            <EmptyState message="No links yet" icon="link" />
                        ) : (
                            sortedLinks.map((link, index) => (
                                <div
                                    key={link.id}
                                    onClick={() => setSelectedIndex(index)}
                                    className={`group flex flex-col p-3 rounded-xl border transition-all cursor-pointer ${selectedIndex === index
                                        ? 'bg-white border-border-light shadow-sm'
                                        : 'bg-background-light border-transparent hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                            <img
                                                alt={`Favicon for ${link.title}`}
                                                className="size-4 shrink-0 rounded grayscale"
                                                src={link.image || `https://www.google.com/s2/favicons?domain=${link.url}&sz=32`}
                                            />
                                            <h4 className={`text-sm font-bold line-clamp-1 ${selectedIndex === index ? 'text-black' : 'text-text-primary font-medium'}`}>{link.title || 'Untitled'}</h4>
                                        </div>
                                        <ActionMenu
                                            items={getActionMenuItems(link)}
                                            trigger={<span className="material-icons-outlined text-[16px]">more_horiz</span>}
                                            className="opacity-0 group-hover:opacity-100"
                                        />
                                    </div>
                                    <p className="text-xs text-text-secondary mb-2 line-clamp-1 pl-6">{link.url.replace('https://', '').replace('http://', '')}</p>
                                    <div className="flex items-center justify-end text-xs text-gray-500">
                                        {link.isPinned && <span className="material-icons-outlined text-[14px] text-primary">push_pin</span>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* Link Preview Panel */}
                <div className="flex-1 flex flex-col overflow-y-auto bg-background-light p-8 md:p-12 lg:p-16">
                    {selectedLink ? (
                        <div className="mx-auto w-full max-w-4xl flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-3xl font-bold text-text-primary tracking-tight">Link Preview</h3>
                                <ActionMenu items={getActionMenuItems(selectedLink)} />
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-border-light flex flex-col gap-6">

                                <div className="flex items-center gap-3">
                                    <img
                                        alt={`Favicon for ${selectedLink.title}`}
                                        className="size-6 shrink-0 rounded grayscale"
                                        src={selectedLink.image || `https://www.google.com/s2/favicons?domain=${selectedLink.url}&sz=32`}
                                    />
                                    <a className="text-xl font-bold text-text-primary hover:underline truncate" href={selectedLink.url} target="_blank" rel="noreferrer">
                                        {selectedLink.title || 'Untitled'}
                                    </a>
                                </div>
                                <p className="text-sm text-text-secondary flex items-center gap-2">
                                    <span className="material-icons-outlined text-base">link</span>
                                    <span className="truncate">{selectedLink.url}</span>
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {(selectedLink.tags || []).map((tag, i) => (
                                        <span key={i} className="bg-gray-100 text-text-primary text-xs font-medium px-3 py-1 rounded-full border border-border-light">
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
                                        className="flex items-center justify-center rounded-xl h-10 px-5 bg-primary hover:bg-text-primary text-white gap-2 text-sm font-semibold shadow-sm transition-all shadow-gray-200/50"
                                    >
                                        <span className="material-icons-outlined text-[20px]">open_in_new</span>
                                        <span className="whitespace-nowrap">Open Link</span>
                                    </a>
                                    <button
                                        onClick={() => handleEdit(selectedLink)}
                                        className="flex items-center justify-center rounded-xl h-10 px-5 bg-gray-100 hover:bg-gray-200 text-text-primary gap-2 text-sm font-semibold shadow-sm transition-all"
                                    >
                                        <span className="material-icons-outlined text-[20px]">edit</span>
                                        <span className="whitespace-nowrap">Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(selectedLink)}
                                        className="flex items-center justify-center rounded-xl h-10 px-5 bg-red-100 hover:bg-red-200 text-red-600 gap-2 text-sm font-semibold shadow-sm transition-all"
                                    >
                                        <span className="material-icons-outlined text-[20px]">delete</span>
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
        </main>
    );
}
