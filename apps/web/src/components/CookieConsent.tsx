import { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'corehub_cookie_consent';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already consented
        const hasConsented = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!hasConsented) {
            // Small delay before showing for better UX
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
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
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-slideUp">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl p-5 shadow-2xl shadow-black/10">
                    {/* Cookie Icon & Text */}
                    <div className="flex items-start sm:items-center gap-4 text-left">
                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-amber-50 rounded-xl text-amber-500">
                            <span className="material-icons-outlined text-[28px]">cookie</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <h3 className="text-base font-bold text-gray-900">We use cookies 🍪</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                We use cookies to enhance your experience and analyze our traffic.
                                By clicking "Accept", you consent to our use of cookies.
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                            onClick={handleDecline}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
                        >
                            Decline
                        </button>
                        <button
                            onClick={handleAccept}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-black hover:bg-gray-800 rounded-xl shadow-lg shadow-black/10 transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            Accept All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
