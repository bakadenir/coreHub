
import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { DonationTableSkeleton, ReviewListSkeleton } from '../components/Skeleton';
import { feedbackApi, usersApi, donationsApi } from '../lib';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Clock, Heart, Loader2, History, MessageSquare, Send, Edit3, BadgeCheck } from 'lucide-react';

interface MidtransResult {
    status_code: string;
    status_message: string;
    transaction_id?: string;
    order_id?: string;
    payment_type?: string;
}

declare global {
    interface Window {
        snap?: {
            pay: (token: string, options: {
                onSuccess?: (result: MidtransResult) => void;
                onPending?: (result: MidtransResult) => void;
                onError?: (result: MidtransResult) => void;
                onClose?: () => void;
            }) => void;
        };
    }
}

interface Donation {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    name: string;
    message?: string;
    paidAt?: string;
}

interface Review {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export default function Donate() {
    const { showToast } = useToast();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Handle Midtrans redirect callback
    useEffect(() => {
        const orderId = searchParams.get('order_id');

        if (orderId) {
            // Clear URL params
            navigate('/donate', { replace: true });

            // Verify actual transaction status with backend
            donationsApi.verify(orderId).then((result) => {
                if (result.success && result.data?.status === 'success') {
                    showToast('Terima kasih atas donasi Anda! 🎉', 'success');
                    // Refresh donations list
                    donationsApi.getPublic(20).then(res => {
                        if (res.success && res.data) setDonationsList(res.data);
                    });
                } else if (result.data?.status === 'pending') {
                    showToast('Pembayaran pending. Silakan selesaikan pembayaran.', 'info');
                } else if (result.data?.status === 'cancelled') {
                    showToast('Transaksi dibatalkan.', 'info');
                } else {
                    // Don't show toast for unknown/other statuses
                }
            }).catch(() => {
                // Silent fail - don't bother user with verification errors
            });
        }
    }, [searchParams, navigate, showToast]);

    // Feedback form state
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userAvatar, setUserAvatar] = useState<string | null>(null);

    // Donation state
    const [donationAmount, setDonationAmount] = useState('');
    const [donorName, setDonorName] = useState('');
    const [donationMessage, setDonationMessage] = useState('');
    const [isDonating, setIsDonating] = useState(false);
    const [donationsList, setDonationsList] = useState<Donation[]>([]);
    const [isInitialLoadingDonations, setIsInitialLoadingDonations] = useState(true); // Only first load
    const [pendingDonation, setPendingDonation] = useState<Donation | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);


    // Helper to construct full URL for uploaded files
    const getFullAvatarUrl = (imageUrl: string | null | undefined): string => {
        if (!imageUrl || imageUrl.trim() === '') return '';
        if (imageUrl.startsWith('http')) return imageUrl;
        if (imageUrl.startsWith('/uploads/')) {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            return `${apiUrl}${imageUrl}`;
        }
        return imageUrl;
    };

    // Fetch user avatar from API on mount
    useEffect(() => {
        const fetchUserAvatar = async () => {
            try {
                const result = await usersApi.getMe();
                if (result.success && result.data) {
                    const fullUrl = getFullAvatarUrl(result.data.image);
                    setUserAvatar(fullUrl || null);
                }
            } catch {
                // Silently fail - avatar is optional
            }
        };
        fetchUserAvatar();
    }, []);

    // Reviews state
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isInitialLoadingReviews, setIsInitialLoadingReviews] = useState(true); // Only first load
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRating, setFilterRating] = useState<number | 'all'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const REVIEWS_PER_PAGE = 5;

    // User's own review state
    const [userReview, setUserReview] = useState<Review | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Calculate rating stats
    const ratingStats = reviews.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : '0.0';

    // Filter reviews
    const filteredReviews = reviews.filter(review => {
        const matchesSearch = review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRating = filterRating === 'all' || review.rating === filterRating;
        return matchesSearch && matchesRating;
    });

    // Sort to put user's own review first
    const sortedReviews = [...filteredReviews].sort((a, b) => {
        if (userReview?.id === a.id) return -1;
        if (userReview?.id === b.id) return 1;
        return 0; // Keep original order for others
    });

    // Pagination
    const totalPages = Math.ceil(sortedReviews.length / REVIEWS_PER_PAGE);
    const paginatedReviews = sortedReviews.slice(
        (currentPage - 1) * REVIEWS_PER_PAGE,
        currentPage * REVIEWS_PER_PAGE
    );

    // Reset to page 1 when filter/search changes
    const handleFilterChange = (value: number | 'all') => {
        setFilterRating(value);
        setCurrentPage(1);
    };
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    // Fetch reviews function (reusable)
    const fetchReviews = async () => {
        try {
            const result = await feedbackApi.getReviews(100); // Fetch more for pagination
            if (result.success && result.data) {
                setReviews(result.data as Review[]);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setIsInitialLoadingReviews(false);
        }
    };

    // Fetch public reviews on mount
    useEffect(() => {
        fetchReviews();
    }, []);

    // Fetch donations on mount
    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const result = await donationsApi.getPublic(20);
                if (result.success && result.data) {
                    setDonationsList(result.data);
                }
            } catch (error) {
                console.error('Error fetching donations:', error);
            } finally {
                setIsInitialLoadingDonations(false);
            }
        };
        fetchDonations();

        // Load Midtrans Snap script
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '');
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    // Fetch pending donation on mount (if logged in) and verify its status
    useEffect(() => {
        const fetchPending = async () => {
            if (!user) return;
            try {
                const result = await donationsApi.getPending();
                if (result.success && result.data) {
                    // Try to verify status with Midtrans (for localhost)
                    try {
                        const verifyResult = await donationsApi.verify(result.data.orderId);
                        if (verifyResult.success && verifyResult.data?.status === 'success') {
                            // Payment was successful, don't show pending panel
                            setPendingDonation(null);
                            // Refresh donations list
                            const updated = await donationsApi.getPublic(20);
                            if (updated.success && updated.data) {
                                setDonationsList(updated.data);
                            }
                            return;
                        }
                    } catch {
                        // Verify check failed, showing pending panel
                    }
                    setPendingDonation(result.data);
                }
            } catch {
                // Error fetching pending donation - ignore
            }
        };
        fetchPending();
    }, [user]);

    // Set donor name from user when user is available
    useEffect(() => {
        if (user?.name && !donorName) {
            setDonorName(user.name);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Handle cancel pending donation
    const handleCancelPending = async () => {
        if (!pendingDonation) return;
        setIsCancelling(true);
        try {
            const result = await donationsApi.cancel(pendingDonation.orderId);
            if (result.success) {
                setPendingDonation(null);
                showToast('Donasi pending dibatalkan', 'success');
            }
        } catch {
            showToast('Gagal membatalkan donasi', 'error');
        } finally {
            setIsCancelling(false);
        }
    };

    // Handle Midtrans donation
    const handleDonate = async () => {
        const amount = parseInt(donationAmount.replace(/\D/g, ''));
        if (!amount || amount < 1000) {
            showToast('Minimum donasi Rp 1.000', 'error');
            return;
        }
        if (!donorName.trim()) {
            showToast('Nama harus diisi', 'error');
            return;
        }

        setIsDonating(true);
        try {
            const result = await donationsApi.create({
                amount,
                name: donorName.trim(),
                email: user?.email,
                message: donationMessage.trim() || undefined,
            });

            if (result.success && result.data?.snapToken) {
                // Open Midtrans Snap popup
                if (window.snap) {
                    window.snap.pay(result.data.snapToken, {
                        onSuccess: async () => {
                            showToast('Terima kasih atas donasi Anda! 🎉', 'success');
                            setDonationAmount('');
                            setDonationMessage('');
                            // Verify transaction status with Midtrans (needed for localhost)
                            try {
                                await donationsApi.verify(result.data!.donation.orderId);
                            } catch (e) {
                                console.error('Verify error:', e);
                            }
                            // Refresh donations list
                            donationsApi.getPublic(20).then(res => {
                                if (res.success && res.data) setDonationsList(res.data);
                            });
                        },
                        onPending: () => {
                            showToast('Pembayaran pending. Selesaikan pembayaran atau akan dibatalkan jika membuat donasi baru.', 'info');
                        },
                        onError: () => {
                            showToast('Pembayaran gagal', 'error');
                        },
                        onClose: async () => {
                            // Auto-cancel the pending donation when popup is closed without payment
                            try {
                                await donationsApi.cancel(result.data!.donation.orderId);
                                showToast('Transaksi dibatalkan.', 'info');
                            } catch (e) {
                                console.error('Error cancelling donation:', e);
                                showToast('Transaksi dibatalkan.', 'info');
                            }
                        },
                    });
                } else {
                    showToast('Midtrans Snap tidak tersedia', 'error');
                }
            } else {
                showToast(result.error || 'Gagal membuat transaksi', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        } finally {
            setIsDonating(false);
        }
    };

    // Format currency
    const formatRupiah = (value: string) => {
        const num = value.replace(/\D/g, '');
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Fetch user's own review and pre-fill form if logged in
    useEffect(() => {
        const fetchUserReview = async () => {
            if (!user) return;
            try {
                const result = await feedbackApi.getMyFeedback();
                if (result.success && result.data && result.data.length > 0) {
                    const myReview = result.data[0] as Review;
                    setUserReview(myReview);
                    // Pre-fill form for editing
                    setRating(myReview.rating);
                    setComment(myReview.comment);
                    setIsAnonymous(myReview.name === 'Anonymous');
                    setIsEditing(true);
                }
            } catch (error) {
                console.error('Error fetching user review:', error);
            }
        };
        fetchUserReview();
    }, [user]);

    // Submit feedback handler
    const handleSubmit = async () => {
        if (rating === 0) {
            showToast('Please select a rating', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await feedbackApi.submit({
                name: isAnonymous ? 'Anonymous' : (user?.name || 'Anonymous'),
                avatar: isAnonymous ? undefined : (userAvatar || undefined),
                rating,
                comment: comment.trim(),
            });

            if (result.success) {
                showToast(isEditing ? 'Review updated! ✏️' : 'Thank you for your feedback! 🎉', 'success');
                // Update userReview with result and refetch all reviews
                if (result.data) {
                    setUserReview(result.data as Review);
                    setIsEditing(true);
                }
                fetchReviews(); // Refresh reviews list
            } else {
                showToast(result.error || 'Failed to submit feedback', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Format relative time
    const formatRelativeTime = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();

        // Handle future dates or invalid dates
        if (diffMs < 0 || isNaN(diffMs)) return date.toLocaleDateString();

        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSeconds < 60) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-light font-sans text-text-primary relative overflow-hidden">
            {/* Dynamic Background */}
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Base bg */}
                <div className="absolute inset-0 bg-gray-50/50"></div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* Gradient Fades */}
                <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white to-transparent"></div>
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white to-transparent"></div>
            </div>
            <Header subtitle="Donate" />

            <main className="w-full max-w-4xl mx-auto px-6 md:px-12 py-12 flex-grow relative z-10">

                {/* Back to Home Control */}
                <div className="mb-8">
                    <Link
                        to="/home"
                        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors hover:translate-x-[-4px] duration-200"
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                </div>

                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-text-primary">Donate</h1>
                    <div className="space-y-4 text-lg text-text-secondary max-w-2xl leading-relaxed">
                        <p>
                            Thank you for using{' '}
                            <span className="inline-flex items-center gap-1.5">
                                <span className="inline-flex items-center justify-center size-5">
                                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                                </span>
                                <strong className="text-text-primary font-semibold">coreHub</strong>
                            </span>.
                        </p>
                        <p>
                            Your donation is appreciated and will ensure the future development of coreHub.
                            Donations directly support hardware, software updates, hosting fees, and other operational costs that keep the lights on.
                        </p>
                        <p>
                            Thank you for your continued support,
                            <br />
                            <span className="font-mono text-sm text-gray-500 mt-2 block">— Deni Romadhon</span>
                        </p>
                    </div>
                </header>

                {/* Donation Options */}
                <section className="mb-16">
                    <div className="bg-[#fdfdfd] border border-border-light rounded-xl p-6 shadow-sm">
                        {pendingDonation ? (
                            /* Pending Payment Panel */
                            <>
                                <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                                    <Clock size={20} />
                                    Awaiting Payment
                                </h3>
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Order ID</p>
                                            <p className="font-mono text-sm text-gray-700">{pendingDonation.orderId}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Total Amount</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                Rp {pendingDonation.amount.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Please complete the payment or cancel to create a new donation.
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleCancelPending}
                                            disabled={isCancelling}
                                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                                        >
                                            {isCancelling ? 'Cancelling...' : 'Cancel'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setPendingDonation(null);
                                            }}
                                            className="flex-1 px-4 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors"
                                        >
                                            Create New Donation
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Donation Form */
                            <>
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Heart size={20} className="text-gray-500" />
                                    Choose Payment Method
                                </h3>

                                {/* Donation Form */}
                                <div className="space-y-4 mb-6">
                                    {/* Amount Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Donation Amount (IDR)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                                            <input
                                                type="text"
                                                value={formatRupiah(donationAmount)}
                                                onChange={(e) => setDonationAmount(e.target.value.replace(/\D/g, ''))}
                                                placeholder="10.000"
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-lg font-medium focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                                            />
                                        </div>
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                            {[10000, 25000, 50000, 100000, 250000].map((preset) => (
                                                <button
                                                    key={preset}
                                                    type="button"
                                                    onClick={() => setDonationAmount(preset.toString())}
                                                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                                >
                                                    {preset.toLocaleString('id-ID')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Name Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Donor Name</label>
                                        <input
                                            type="text"
                                            value={donorName}
                                            onChange={(e) => setDonorName(e.target.value)}
                                            placeholder="Your name"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                                        />
                                    </div>

                                    {/* Message Input (Optional) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                                        <textarea
                                            value={donationMessage}
                                            onChange={(e) => setDonationMessage(e.target.value.slice(0, 200))}
                                            placeholder="Write a message for the developer..."
                                            rows={2}
                                            maxLength={200}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 resize-none"
                                        />
                                        <p className="text-xs text-gray-400 text-right mt-1">{donationMessage.length}/200</p>
                                    </div>
                                </div>

                                {/* Payment Buttons */}
                                <div className="grid sm:grid-cols-3 gap-4">
                                    {/* Midtrans Button */}
                                    <button
                                        onClick={handleDonate}
                                        disabled={isDonating}
                                        className="group flex items-center justify-center gap-3 px-6 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isDonating ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-lg font-bold">Midtrans</span>
                                                <span className="text-sm opacity-80">(GoPay, QRIS, Bank Transfer)</span>
                                            </>
                                        )}
                                    </button>

                                    {/* PayPal Button (Placeholder) */}
                                    <button
                                        disabled
                                        className="group flex items-center justify-center gap-3 px-6 py-4 bg-gray-200 text-gray-500 font-bold rounded-xl opacity-60 cursor-not-allowed"
                                    >
                                        <span className="text-lg font-extrabold italic">PayPal</span>
                                        <span className="text-sm opacity-80">(Coming Soon)</span>
                                    </button>

                                    {/* Stripe Button (Placeholder) */}
                                    <button
                                        disabled
                                        className="group flex items-center justify-center gap-3 px-6 py-4 bg-gray-300 text-gray-600 font-bold rounded-xl opacity-60 cursor-not-allowed"
                                    >
                                        <span className="text-lg font-bold">Stripe</span>
                                        <span className="text-sm opacity-80">(Coming Soon)</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                <hr className="border-border-light mb-12" />

                {/* Donation History */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <History size={20} className="text-gray-400" />
                            Donation History
                        </h2>
                        <div className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                            {donationsList.length} DONATIONS
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-border-light bg-[#fdfdfd] shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-border-light">
                                <tr>
                                    <th className="py-3 px-6 text-xs font-mono uppercase tracking-wide text-gray-500 w-36">Date</th>
                                    <th className="py-3 px-6 text-xs font-mono uppercase tracking-wide text-gray-500 w-40">Donatur</th>
                                    <th className="py-3 px-6 text-xs font-mono uppercase tracking-wide text-gray-500">Pesan</th>
                                    <th className="py-3 px-6 text-xs font-mono uppercase tracking-wide text-gray-500 text-right w-36">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light text-sm">
                                {isInitialLoadingDonations ? (
                                    <DonationTableSkeleton rows={5} />
                                ) : donationsList.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-gray-400">
                                            Belum ada donasi. Jadilah yang pertama! 🎉
                                        </td>
                                    </tr>
                                ) : (
                                    donationsList.map((donation) => (
                                        <tr key={donation.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="py-4 px-6 font-mono text-gray-500 whitespace-nowrap text-xs">
                                                {donation.paidAt ? new Date(donation.paidAt).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                }) : '-'}
                                            </td>
                                            <td className="py-4 px-6 text-gray-800 font-medium">
                                                {donation.name}
                                            </td>
                                            <td className={`py-4 px-6 ${donation.message ? 'text-gray-700' : 'text-gray-400 italic'} group-hover:text-black`}>
                                                {donation.message || 'No message'}
                                            </td>
                                            <td className="py-4 px-6 text-right font-mono font-medium text-green-600">
                                                Rp {donation.amount.toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <hr className="border-border-light my-12" />

                {/* Feedback & Review Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <MessageSquare size={20} className="text-gray-400" />
                            Share Your Feedback
                        </h2>
                        <div className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                            REVIEWS
                        </div>
                    </div>

                    <div className="bg-[#fdfdfd] border border-border-light rounded-xl p-6 shadow-sm">
                        <p className="text-sm text-gray-600 mb-6">
                            Your feedback helps us improve coreHub. Share your experience and it may be featured as a review!
                        </p>

                        {/* Rating */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((starNum) => (
                                    <button
                                        key={starNum}
                                        type="button"
                                        onClick={() => setRating(starNum)}
                                        onMouseEnter={() => setHoverRating(starNum)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="p-1 hover:scale-110 transition-transform"
                                    >
                                        <svg
                                            className={`w-7 h-7 transition-colors ${starNum <= (hoverRating || rating) ? 'text-zinc-700' : 'text-gray-300'}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Feedback Text */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Your Feedback</label>
                                <span className="text-xs text-gray-400">Optional</span>
                            </div>
                            <textarea
                                placeholder="Tell us about your experience with coreHub... What do you love? What could be improved?"
                                value={comment}
                                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                                maxLength={500}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 resize-none bg-gray-50 focus:bg-[#fdfdfd] transition-colors"
                                rows={4}
                            />
                            <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/500</p>
                        </div>

                        {/* Anonymous Checkbox */}
                        <div className="flex items-center gap-3 mb-6">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isAnonymous}
                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-zinc-50 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-[#fdfdfd] after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900"></div>
                            </label>
                            <span className="text-sm text-gray-600">
                                Post as <span className="font-medium text-gray-900">{isAnonymous ? 'Anonymous' : (user?.name || 'Anonymous')}</span>
                            </span>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-zinc-800 transition-colors flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                isEditing ? <Edit3 size={16} /> : <Send size={16} />
                            )}
                            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Review' : 'Submit')}
                        </button>
                    </div>

                    {/* Reviews Section */}
                    <div className="mt-10">
                        {/* Rating Summary Header */}
                        {!isInitialLoadingReviews && reviews.length > 0 && (
                            <div className="flex flex-col md:flex-row gap-8 mb-8 p-6 bg-[#fdfdfd] border border-gray-200 rounded-xl shadow-sm">
                                {/* Average Rating */}
                                <div className="flex flex-col items-center justify-center md:border-r border-gray-200 md:pr-8">
                                    <span className="text-5xl font-bold text-zinc-900">{averageRating}</span>
                                    <div className="flex gap-0.5 my-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg key={star} className={`w-5 h-5 ${star <= Math.round(Number(averageRating)) ? 'text-zinc-700' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-600 font-medium">App Rating</span>
                                </div>

                                {/* Rating Distribution */}
                                <div className="flex-1 space-y-2">
                                    {[5, 4, 3, 2, 1].map((star) => {
                                        const count = ratingStats[star] || 0;
                                        const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                                        return (
                                            <div key={star} className="flex items-center gap-3">
                                                <div className="flex gap-0.5 min-w-[80px]">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg key={i} className={`w-3.5 h-3.5 ${i < star ? 'text-zinc-700' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-zinc-700 rounded-full transition-all duration-300"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500 min-w-[40px] text-right">{percent}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Reviews Header with Search & Filter */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Reviews</h3>
                            <div className="flex gap-3">
                                <div className="relative flex-1 sm:flex-initial">
                                    <input
                                        type="text"
                                        placeholder="Search reviews"
                                        value={searchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="w-full sm:w-64 pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 bg-[#fdfdfd]"
                                    />
                                    <button className="absolute right-0 top-0 h-full px-3 bg-primary text-white rounded-r-xl hover:bg-zinc-800 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="relative">
                                    <select
                                        value={filterRating === 'all' ? 'all' : filterRating}
                                        onChange={(e) => handleFilterChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                        className="appearance-none px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 bg-[#fdfdfd] cursor-pointer"
                                    >
                                        <option value="all">All ratings</option>
                                        <option value="5">5 Stars</option>
                                        <option value="4">4 Stars</option>
                                        <option value="3">3 Stars</option>
                                        <option value="2">2 Stars</option>
                                        <option value="1">1 Star</option>
                                    </select>
                                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Reviews List */}
                        {isInitialLoadingReviews ? (
                            <ReviewListSkeleton count={3} />
                        ) : filteredReviews.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-12 bg-[#fdfdfd] border border-gray-200 rounded-xl">
                                {reviews.length === 0 ? 'No reviews yet. Be the first to share your feedback!' : 'No reviews match your search.'}
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {paginatedReviews.map((review) => {
                                    const isOwnReview = userReview?.id === review.id;
                                    return (
                                        <div
                                            key={review.id}
                                            className={`rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border ${isOwnReview ? 'bg-gray-50 border-zinc-400 ring-2 ring-zinc-200' : 'bg-[#fdfdfd] border-gray-200'}`}
                                        >
                                            {isOwnReview && (
                                                <div className="flex items-center gap-2 mb-3 text-zinc-700">
                                                    <BadgeCheck size={14} />
                                                    <span className="text-xs font-semibold uppercase tracking-wide">Your Review</span>
                                                </div>
                                            )}
                                            <div className="flex items-start gap-4">
                                                {/* Avatar */}
                                                {review.avatar ? (
                                                    <img
                                                        src={getFullAvatarUrl(review.avatar)}
                                                        alt={review.name}
                                                        className="w-12 h-12 rounded-full object-cover shrink-0 shadow"
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white uppercase shrink-0"
                                                        style={{
                                                            background: 'linear-gradient(135deg, #1f1f1f 0%, #000000 100%)',
                                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)'
                                                        }}
                                                    >
                                                        {review.name?.[0] || '?'}
                                                    </div>
                                                )}

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <span className="font-semibold text-gray-900">{review.name}</span>
                                                        <div className="flex gap-0.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-zinc-700' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-gray-400">{formatRelativeTime(review.createdAt)}</span>
                                                    </div>
                                                    <p className="text-gray-600 mt-2 leading-relaxed">{review.comment}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {!isInitialLoadingReviews && totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${currentPage === 1 ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-[#fdfdfd] text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                                >
                                    ← Prev
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${currentPage === page ? 'bg-primary text-white' : 'bg-[#fdfdfd] text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${currentPage === totalPages ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-[#fdfdfd] text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <footer className="w-full border-t border-border-light py-5 text-center text-sm text-gray-500 font-mono mt-12 bg-gray-50/50 relative z-10">
                <p>© 2025 coreHub. All rights reserved. Code with <a href="https://linkedin.com/in/bakadenir" target="_blank" rel="noopener noreferrer" className="hover:underline">bakadenir</a></p>
            </footer>
        </div >
    );
}
