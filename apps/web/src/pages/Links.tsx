import { useState, useEffect, useCallback } from 'react';
import AddLinkModal from '../components/AddLinkModal';
import EditLinkModal from '../components/EditLinkModal';
import ActionMenu from '../components/ActionMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import { linksApi } from '../lib';
import type { LinkItem } from '../types';
import { LoadingSpinner, EmptyState, ErrorState } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import { Plus, ArrowUpDown, Search, Check, MoreHorizontal, Pin, Link as LinkLucide, ExternalLink, Pencil, Trash2 } from 'lucide-react';

export default function Links() {
    // Custom Favicon Component with multiple fallback sources
    const LinkFavicon = ({ link, size = 20, className }: { link: LinkItem, size?: number, className?: string }) => {
        const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
        const [allFailed, setAllFailed] = useState(false);

        // Extract domain safely
        const getDomain = (url: string) => {
            try {
                return url.replace('https://', '').replace('http://', '').split('/')[0];
            } catch {
                return '?';
            }
        };

        const domain = getDomain(link.url);

        // Multiple favicon sources to try in order
        const faviconSources = [
            link.image, // User provided image first
            `https://unavatar.io/${domain}`, // Unavatar (universal avatar service)
            `https://www.google.com/s2/favicons?domain=${domain}&sz=64`, // Google Favicon
            `https://icon.horse/icon/${domain}`, // Icon Horse service
            `https://${domain}/favicon.ico`, // Direct favicon from domain
        ].filter(Boolean); // Remove empty/null sources

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
    };
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
                                    <ArrowUpDown size={20} />
                                </button>
                                {showSortMenu && (
                                    <div className="absolute right-0 top-full mt-1 bg-[#fdfdfd] border border-gray-200 rounded-xl shadow-lg py-1 z-20 min-w-[140px]">
                                        <button
                                            onClick={() => { setSortBy('newest'); setShowSortMenu(false); }}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${sortBy === 'newest' ? 'text-primary font-medium' : 'text-text-primary'}`}
                                        >
                                            {sortBy === 'newest' && <Check size={16} />}
                                            <span className={sortBy === 'newest' ? '' : 'ml-6'}>Newest</span>
                                        </button>
                                        <button
                                            onClick={() => { setSortBy('oldest'); setShowSortMenu(false); }}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${sortBy === 'oldest' ? 'text-primary font-medium' : 'text-text-primary'}`}
                                        >
                                            {sortBy === 'oldest' && <Check size={16} />}
                                            <span className={sortBy === 'oldest' ? '' : 'ml-6'}>Oldest</span>
                                        </button>
                                        <button
                                            onClick={() => { setSortBy('title'); setShowSortMenu(false); }}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${sortBy === 'title' ? 'text-primary font-medium' : 'text-text-primary'}`}
                                        >
                                            {sortBy === 'title' && <Check size={16} />}
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
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
                                            <h4 className={`text-sm font-bold line-clamp-1 capitalize ${selectedIndex === index ? 'text-black' : 'text-text-primary font-medium'}`}>{link.title || 'Untitled'}</h4>
                                        </div>
                                        <ActionMenu
                                            items={getActionMenuItems(link)}
                                            trigger={<MoreHorizontal size={16} />}
                                            className="opacity-0 group-hover:opacity-100"
                                        />
                                    </div>

                                    <div className="flex items-center justify-end text-xs text-gray-500">
                                        {link.isPinned && <Pin size={14} className="text-primary" />}
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
                                        <ExternalLink size={20} />
                                        <span className="whitespace-nowrap">Open Link</span>
                                    </a>
                                    <button
                                        onClick={() => handleEdit(selectedLink)}
                                        className="flex items-center justify-center rounded-xl h-10 px-5 bg-gray-100 hover:bg-gray-200 text-text-primary gap-2 text-sm font-semibold shadow-sm transition-all"
                                    >
                                        <Pencil size={20} />
                                        <span className="whitespace-nowrap">Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(selectedLink)}
                                        className="flex items-center justify-center rounded-xl h-10 px-5 bg-red-100 hover:bg-red-200 text-red-600 gap-2 text-sm font-semibold shadow-sm transition-all"
                                    >
                                        <Trash2 size={20} />
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
