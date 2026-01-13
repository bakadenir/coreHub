import { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'corehub_cookie_consent';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already consented - defer to after main content loads
        const checkConsent = () => {
            const hasConsented = localStorage.getItem(COOKIE_CONSENT_KEY);
            if (!hasConsented) {
                setIsVisible(true);
            }
        };

        // Use requestIdleCallback for non-blocking load, fallback to setTimeout
        if ('requestIdleCallback' in window) {
            requestIdleCallback(checkConsent, { timeout: 2000 });
        } else {
            setTimeout(checkConsent, 1500);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div
            className="fixed bottom-4 right-4 z-[100] max-w-xs animate-slideUp"
            style={{ contain: 'layout' }} // Prevent CLS
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
