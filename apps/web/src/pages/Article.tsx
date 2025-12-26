import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { notesApi } from '../lib';
import MarkdownRenderer from '../components/MarkdownRenderer';

interface PublicNote {
    id: string;
    title: string;
    content: string;
    authorName: string;
    authorImage?: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function Article() {
    const { slug } = useParams<{ slug: string }>();
    const [article, setArticle] = useState<PublicNote | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!slug) {
                setError('Article not found');
                setIsLoading(false);
                return;
            }

            try {
                const result = await notesApi.getPublic(slug);
                if (result.success && result.data) {
                    setArticle(result.data);
                    // Update document title for SEO
                    document.title = `${result.data.title} - CoreHub`;
                } else {
                    setError('Article not found');
                }
            } catch {
                setError('Failed to load article');
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticle();

        // Cleanup title on unmount
        return () => {
            document.title = 'CoreHub';
        };
    }, [slug]);

    // Update meta tags for SEO
    useEffect(() => {
        if (article) {
            // Get plain text excerpt for description
            const plainText = article.content.replace(/<[^>]*>/g, '').substring(0, 160);

            // Update or create meta description
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.setAttribute('name', 'description');
                document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', plainText);

            // Update or create og:title
            let ogTitle = document.querySelector('meta[property="og:title"]');
            if (!ogTitle) {
                ogTitle = document.createElement('meta');
                ogTitle.setAttribute('property', 'og:title');
                document.head.appendChild(ogTitle);
            }
            ogTitle.setAttribute('content', article.title);

            // Update or create og:description
            let ogDesc = document.querySelector('meta[property="og:description"]');
            if (!ogDesc) {
                ogDesc = document.createElement('meta');
                ogDesc.setAttribute('property', 'og:description');
                document.head.appendChild(ogDesc);
            }
            ogDesc.setAttribute('content', plainText);

            // Update or create og:url
            let ogUrl = document.querySelector('meta[property="og:url"]');
            if (!ogUrl) {
                ogUrl = document.createElement('meta');
                ogUrl.setAttribute('property', 'og:url');
                document.head.appendChild(ogUrl);
            }
            ogUrl.setAttribute('content', window.location.href);

            // Update or create twitter:card
            let twitterCard = document.querySelector('meta[name="twitter:card"]');
            if (!twitterCard) {
                twitterCard = document.createElement('meta');
                twitterCard.setAttribute('name', 'twitter:card');
                document.head.appendChild(twitterCard);
            }
            twitterCard.setAttribute('content', 'summary');
        }
    }, [article]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareTwitter = () => {
        const text = encodeURIComponent(`${article?.title} by ${article?.authorName}`);
        const url = encodeURIComponent(window.location.href);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
        setShowShareMenu(false);
    };

    const handleShareLinkedIn = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
        setShowShareMenu(false);
    };

    const handleShareFacebook = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        setShowShareMenu(false);
    };

    const handleShareThreads = () => {
        const text = encodeURIComponent(`${article?.title} by ${article?.authorName}`);
        const url = encodeURIComponent(window.location.href);
        window.open(`https://threads.net/intent/post?text=${text}%20${url}`, '_blank');
        setShowShareMenu(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black"></div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
                <span className="material-icons-outlined text-6xl text-gray-300 mb-4">description</span>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Note Not Found</h1>
                <p className="text-gray-500 mb-6">The note you're looking for doesn't exist or has been made private.</p>
                <Link
                    to="/"
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                    <span className="material-icons-outlined text-lg">home</span>
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header - matching CoreHub style */}
            <header className="w-full border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="flex items-center justify-center rounded-lg bg-black text-white size-8">
                                <span className="material-icons-outlined text-[20px]">hub</span>
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-text-primary">
                                coreHub
                            </h1>
                        </Link>
                        <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>
                        <span className="text-sm text-gray-500 font-medium hidden sm:block">
                            Shared Note
                        </span>
                    </div>

                    {/* Share Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowShareMenu(!showShareMenu)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-600 transition-colors"
                        >
                            <span className="material-icons-outlined text-base">share</span>
                            Share
                        </button>

                        {showShareMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowShareMenu(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20 min-w-[180px]">
                                    <button
                                        onClick={handleCopyLink}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                                    >
                                        <span className="material-icons-outlined text-lg text-gray-400">
                                            {copied ? 'check' : 'link'}
                                        </span>
                                        {copied ? 'Copied!' : 'Copy link'}
                                    </button>
                                    <button
                                        onClick={handleShareTwitter}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                                    >
                                        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                        Share on X
                                    </button>
                                    <button
                                        onClick={handleShareLinkedIn}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                                    >
                                        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                        Share on LinkedIn
                                    </button>
                                    <button
                                        onClick={handleShareFacebook}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                                    >
                                        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                                        </svg>
                                        Share on Facebook
                                    </button>
                                    <button
                                        onClick={handleShareThreads}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                                    >
                                        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12.71 10.96c-.32-.08-.65-.13-1-.13-.96 0-1.76.4-2.14 1.05-.2.34-.3.75-.3 1.2 0 .84.5 1.42 1.32 1.42.26 0 .5-.05.72-.14.22-.09.41-.22.58-.39.29-.29.49-.68.55-1.14l-.01-.01c0-.02.02-.66.28-1.86zm1.12-2.38c0 .28-.02.56-.05.83-.58-1-.95-1.54-.95-1.54-.14-.21-.29-.38-.45-.52-.7-.57-1.6-.87-2.65-.87-2.3 0-4.14 1.6-4.14 3.9 0 2.2 1.74 3.92 4.14 3.92 1.6 0 2.92-1 3.25-2.07.03.04.05.08.08.12.38.52 1.03.88 1.8.88 1.24 0 2.25-.97 2.25-2.17 0-2.3-1.86-4.17-4.17-4.17-2.3 0-4.17 1.86-4.17 4.17 0 2.3 1.86 4.17 4.17 4.17 1.44 0 2.7-.77 3.4-1.92l1.37.8c-.96 1.57-2.68 2.62-4.65 2.62-3.13 0-5.67-2.54-5.67-5.67s2.54-5.67 5.67-5.67c2.87 0 5.24 2.14 5.61 4.93v.01l.01.07c.04.42.06.84.06 1.27 0 1.95-.5 3.32-1.38 4.1-.73.65-1.74.97-3.02.97-1.17 0-2.04-.42-2.54-1.15-.33-.46-.51-1.02-.51-1.66 0-1.97 1.43-3.37 3.4-3.37.78 0 1.42.25 1.85.69.27.29.42.64.45 1.05h1.28c-.04-.77-.32-1.4-.82-1.9-.76-.77-1.84-1.15-3.07-1.15-2.35 0-4.2 1.58-4.2 4.2 0 2.34 1.53 3.95 3.82 3.95.84 0 1.55-.24 2.1-.67.44-.35.7-.82.82-1.35.49-.22 1.02-.47 1.52-.76.03-.27.04-.55.04-.82z" />
                                        </svg>
                                        Share on Threads
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Article Content */}
            <article className="max-w-3xl mx-auto px-6 py-12">
                {/* Title */}
                <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight">
                    {article.title}
                </h1>

                {/* Meta */}
                <div className="flex items-center gap-3 text-gray-500 mb-8 pb-8 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        {article.authorImage ? (
                            <img
                                src={article.authorImage.startsWith('/uploads/')
                                    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${article.authorImage}`
                                    : article.authorImage
                                }
                                alt={article.authorName}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(article.authorName)}&background=000&color=fff&size=32`}
                                alt={article.authorName}
                                className="w-8 h-8 rounded-full"
                            />
                        )}
                        <span className="font-medium text-gray-700">{article.authorName}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <time className="text-sm">{formatDate(article.createdAt)}</time>
                </div>

                {/* Content */}
                <div className="article-content">
                    <MarkdownRenderer content={article.content} />
                </div>
            </article>

            {/* Share CTA */}
            <div className="border-t border-gray-100 py-8">
                <div className="max-w-3xl mx-auto px-6 flex items-center justify-center gap-4">
                    <span className="text-sm text-gray-500">Share this note</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShareTwitter}
                            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            title="Share on X"
                        >
                            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </button>
                        <button
                            onClick={handleShareLinkedIn}
                            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            title="Share on LinkedIn"
                        >
                            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.21-.44-1.85-1.35-1.85-1 0-1.65.68-1.65 1.85V19h-3v-9h3v1.23c.41-.71 1.3-1.38 2.5-1.38 2.2 0 3.5 1.48 3.5 4.3z" />
                            </svg>
                        </button>
                        <button
                            onClick={handleShareFacebook}
                            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            title="Share on Facebook"
                        >
                            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.048 0-2.732 1.351-2.732 2.895v1.076h3.941s-.459 3.667-.624 3.667H14.18v7.98H9.101Z" />
                            </svg>
                        </button>
                        <button
                            onClick={handleShareThreads}
                            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            title="Share on Threads"
                        >
                            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 17.5c-4.135 0-7.5-3.365-7.5-7.5S7.865 4.5 12 4.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5zm3.5-7.5c0 1.93-1.57 3.5-3.5 3.5S8.5 13.93 8.5 12 10.07 8.5 12 8.5s3.5 1.57 3.5 3.5z" />
                                <path d="M12.5 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                            </svg>
                        </button>
                        <button
                            onClick={handleCopyLink}
                            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            title="Copy link"
                        >
                            <span className="material-icons-outlined text-xl text-gray-700">
                                {copied ? 'check' : 'link'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-8">
                <div className="max-w-3xl mx-auto px-6 text-center text-sm text-gray-400">
                    Shared with <span className="font-semibold text-gray-600">CoreHub</span>
                </div>
            </footer>
        </div>
    );
}
