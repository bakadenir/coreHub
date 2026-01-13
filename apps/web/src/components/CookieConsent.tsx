import { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'corehub_cookie_consent';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Check consent status after a delay to avoid impacting LCP/FCP
        const timer = setTimeout(() => {
            const hasConsented = localStorage.getItem(COOKIE_CONSENT_KEY);
            if (!hasConsented) {
                setIsVisible(true);
                // Trigger animation after mount
                requestAnimationFrame(() => setIsAnimating(true));
            }
        }, 2500); // Delay to not impact initial metrics

        return () => clearTimeout(timer);
    }, []);

    const handleAccept = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
        setIsAnimating(false);
        setTimeout(() => setIsVisible(false), 200);
    };

    const handleDecline = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
        setIsAnimating(false);
        setTimeout(() => setIsVisible(false), 200);
    };

    // Reserve space but don't render if not visible (prevents CLS)
    if (!isVisible) return null;

    return (
        <div
            className={`fixed bottom-4 right-4 z-[100] max-w-xs transition-all duration-200 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
            style={{ contain: 'layout style' }}
        >
            <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl p-4 shadow-xl shadow-black/10">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                    <Cookie size={18} className="text-amber-500" />
                    <span className="text-sm font-bold text-gray-900">Cookies 🍪</span>
                </div>

                {/* Text */}
                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                    We use cookies to enhance your experience.
                </p>

                {/* Buttons - Compact */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDecline}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        className="flex-1 px-3 py-1.5 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
