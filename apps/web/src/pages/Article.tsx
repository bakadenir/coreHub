import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { notesApi } from '../lib';
import { useAuth } from '../context/AuthContext';
import MarkdownRenderer from '../components/MarkdownRenderer';
import DOMPurify from 'dompurify';

interface PublicNote {
    id: string;
    title: string;
    content: string;
    contentType?: 'rich' | 'markdown';
    authorName: string;
    authorImage?: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function Article() {
    const { slug } = useParams<{ slug: string }>();
    const { user } = useAuth();
    const [article, setArticle] = useState<PublicNote | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [copied, setCopied] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);

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
    };

    const handleShareLinkedIn = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    };

    const handleShareFacebook = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fdfdfd] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black"></div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-[#fdfdfd] flex flex-col items-center justify-center p-6">
                <span className="material-icons-outlined text-6xl text-gray-300 mb-4">description</span>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Note Not Found</h1>
                <p className="text-gray-500 mb-6">The note you're looking for doesn't exist or has been made private.</p>
                <Link
                    to="/"
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
                >
                    <span className="material-icons-outlined text-lg">home</span>
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background-light font-sans text-text-primary relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Base bg */}
                <div className="absolute inset-0 bg-gray-50/25"></div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808009_1px,transparent_1px),linear-gradient(to_bottom,#80808009_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* Gradient Fades */}
                <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white to-transparent"></div>
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white to-transparent"></div>
            </div>
            {/* Header - matching CoreHub style */}
            <header className="w-full border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 relative">
                <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="Logo" width="32" height="32" className="size-8 object-contain" />
                            <h1 className="text-xl font-bold tracking-tight text-text-primary">
                                coreHub
                            </h1>
                        </Link>
                        <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>
                        <span className="text-sm text-gray-500 font-medium hidden sm:block">
                            Shared Note
                        </span>
                    </div>

                    {/* Auth Buttons - Only show for non-logged in users */}
                    {!user && (
                        <div className="flex items-center gap-4">
                            <Link className="text-sm font-medium hover:text-primary transition-colors text-text-primary" to="/auth">
                                Login
                            </Link>
                            <Link
                                to="/auth"
                                state={{ isSignUp: true }}
                                className="flex items-center justify-center rounded-lg h-9 px-4 bg-zinc-900 hover:bg-zinc-800 transition-all text-white text-sm font-bold shadow-md hover:shadow-lg hover:translate-y-[-1px]"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </header>

            {/* Article Content */}
            <article className="w-full max-w-4xl mx-auto px-6 py-12 relative z-10 min-h-[60vh]">
                {/* Back to Home - Only for logged in users */}
                {user && (
                    <div className="mb-8">
                        <Link
                            to="/notes"
                            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors hover:translate-x-[-4px] duration-200"
                        >
                            <span className="material-icons-outlined text-base">arrow_back</span>
                            Back to Notes
                        </Link>
                    </div>
                )}

                {/* Title */}
                <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight">
                    {article.title}
                </h1>

                {/* Meta */}
                <div className="flex items-center justify-between text-gray-500 mb-6 pb-4 border-b-2 border-gray-200">
                    <div className="flex items-center gap-3">
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

                    {/* Share Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowShareMenu(!showShareMenu)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                            title="Share"
                        >
                            <span className="material-icons-outlined text-xl text-gray-500">share</span>
                        </button>

                        {showShareMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowShareMenu(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-20 min-w-[200px]">
                                    <button
                                        onClick={handleCopyLink}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                                    >
                                        <span className="material-icons-outlined text-lg text-gray-400">link</span>
                                        {copied ? 'Copied!' : 'Copy link'}
                                    </button>
                                    <button
                                        onClick={handleShareFacebook}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                                    >
                                        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                        Share on Facebook
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
                                        onClick={handleShareTwitter}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                                    >
                                        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                        Share on X
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="article-content">
                    {article.contentType === 'markdown' ? (
                        <MarkdownRenderer
                            content={article.content}
                            className="prose prose-gray max-w-none"
                        />
                    ) : (
                        <div
                            className="rich-text-content prose prose-gray max-w-none"
                            style={{
                                overflowWrap: 'break-word',
                                wordWrap: 'break-word',
                                wordBreak: 'break-word',
                            }}
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
                        />
                    )}
                </div>
            </article>

            {/* Share CTA */}
            <div className="border-t border-gray-100 py-8 relative z-10">
                <div className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-4">
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
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </button>
                        <button
                            onClick={handleShareFacebook}
                            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            title="Share on Facebook"
                        >
                            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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

            <footer className="w-full border-t border-border-light py-5 text-center text-sm text-gray-500 font-mono mt-auto bg-gray-50/50 relative z-10">
                <p>© 2025 coreHub. All rights reserved.</p>
            </footer>

            {/* Rich Text Content Styling - matches MarkdownRenderer styling */}
            <style>{`
                .rich-text-content {
                    font-size: 15px;
                    line-height: 1.6;
                    color: #37352f;
                }
                .rich-text-content > *:first-child { margin-top: 0; }
                .rich-text-content > *:last-child { margin-bottom: 0; }
                
                .rich-text-content h1 {
                    font-size: 1.875rem;
                    font-weight: 700;
                    margin: 1.25rem 0 0.5rem;
                    line-height: 1.3;
                }
                .rich-text-content h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin: 1rem 0 0.4rem;
                    line-height: 1.3;
                }
                .rich-text-content h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 0.875rem 0 0.35rem;
                    line-height: 1.4;
                }
                .rich-text-content h4,
                .rich-text-content h5,
                .rich-text-content h6 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0.75rem 0 0.25rem;
                    line-height: 1.4;
                }
                
                .rich-text-content p {
                    margin: 0.25rem 0;
                }
                
                .rich-text-content ul {
                    margin: 0.25rem 0;
                    padding-left: 1.5rem;
                    list-style-type: disc;
                }
                .rich-text-content ol {
                    margin: 0.25rem 0;
                    padding-left: 1.5rem;
                    list-style-type: decimal;
                }
                .rich-text-content li {
                    margin: 0.125rem 0;
                    display: list-item;
                }
                
                .rich-text-content blockquote {
                    margin: 0.5rem 0;
                    padding: 0.25rem 0 0.25rem 1rem;
                    border-left: 3px solid #e5e5e5;
                    color: #6b7280;
                }
                
                .rich-text-content hr {
                    margin: 1rem 0;
                    border: none;
                    border-top: 1px solid #e5e5e5;
                }
                
                .rich-text-content table {
                    margin: 0.5rem 0;
                    border-collapse: collapse;
                    font-size: 14px;
                    width: 100%;
                }
                .rich-text-content th,
                .rich-text-content td {
                    padding: 0.4rem 0.75rem;
                    border: 1px solid #e5e7eb;
                    text-align: left;
                }
                .rich-text-content th {
                    background: #f9fafb;
                    font-weight: 500;
                }
                
                .rich-text-content a {
                    color: #18181b;
                    text-decoration: underline;
                }
                .rich-text-content a:hover {
                    color: #000;
                }
                
                .rich-text-content strong { font-weight: 600; }
                .rich-text-content del { color: #9ca3af; }
                
                .rich-text-content code {
                    background: #f3f4f6;
                    color: #e11d48;
                    padding: 0.125rem 0.25rem;
                    border-radius: 0.25rem;
                    font-size: 0.8125rem;
                }
                .rich-text-content pre {
                    background: #f7f7f7;
                    padding: 0.75rem 1rem;
                    margin: 0.75rem 0;
                    overflow-x: auto;
                    font-size: 0.8125rem;
                    line-height: 1.5;
                }
                .rich-text-content pre code {
                    background: transparent;
                    color: inherit;
                    padding: 0;
                }
            `}</style>
        </div>
    );
}
