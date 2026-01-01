import { useEffect, useState } from 'react';

export default function LandingDashboardPreview() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Use requestAnimationFrame to defer state update (avoids ESLint warning)
        const frame = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    // Staggered animation classes
    const fadeInUp = "opacity-0 translate-y-4 transition-all duration-700 ease-out";
    const fadeInUpActive = "opacity-100 translate-y-0";

    return (
        <div className="w-full h-full bg-gray-50 flex overflow-hidden select-none cursor-default font-sans text-xs sm:text-sm">
            {/* Sidebar */}
            <div className="w-16 flex-none border-r border-gray-200 bg-[#fdfdfd] flex flex-col items-center py-4 gap-4">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 shadow-md"></div>
                <div className="w-full border-t border-gray-100 my-2"></div>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-8 h-8 rounded-lg bg-gray-100 ${i === 1 ? 'bg-gray-200' : ''}`}></div>
                ))}
                <div className="mt-auto w-8 h-8 rounded-full bg-gray-200"></div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="h-14 border-b border-gray-200 bg-[#fdfdfd] flex items-center justify-between px-6">
                    <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                        <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="flex-1 p-6 overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 h-full">

                        {/* Welcome Banner - Spans full width */}
                        <div className={`col-span-12 h-32 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-800 p-6 flex flex-col justify-center text-white shadow-lg ${fadeInUp} ${mounted ? fadeInUpActive : ''}`} style={{ transitionDelay: '100ms' }}>
                            <div className="w-48 h-6 bg-white/20 rounded mb-3 animate-pulse"></div>
                            <div className="w-72 h-4 bg-white/10 rounded"></div>
                        </div>

                        {/* Chart Area - Left Side */}
                        <div className={`col-span-12 sm:col-span-8 bg-[#fdfdfd] rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col ${fadeInUp} ${mounted ? fadeInUpActive : ''}`} style={{ transitionDelay: '200ms' }}>
                            <div className="flex justify-between items-center mb-6">
                                <div className="w-24 h-4 bg-gray-200 rounded"></div>
                                <div className="w-16 h-4 bg-gray-100 rounded"></div>
                            </div>
                            <div className="flex-1 flex items-end justify-between gap-2 px-2">
                                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                    <div key={i} className="flex-1 bg-zinc-900/5 rounded-t-lg relative group overflow-hidden" style={{ height: `${h}%` }}>
                                        <div
                                            className="absolute bottom-0 left-0 w-full bg-zinc-900 rounded-t-lg transition-all duration-1000 ease-out"
                                            style={{
                                                height: mounted ? '100%' : '0%',
                                                transitionDelay: `${300 + (i * 100)}ms`
                                            }}
                                        ></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Side Stats/List */}
                        <div className="col-span-12 sm:col-span-4 flex flex-col gap-4">
                            {/* Stat Card */}
                            <div className={`bg-[#fdfdfd] p-4 rounded-xl border border-gray-200 shadow-sm ${fadeInUp} ${mounted ? fadeInUpActive : ''}`} style={{ transitionDelay: '300ms' }}>
                                <div className="w-8 h-8 rounded-lg bg-green-100 mb-2"></div>
                                <div className="w-16 h-4 bg-gray-200 rounded mb-1"></div>
                                <div className="w-24 h-6 bg-gray-900 rounded"></div>
                            </div>

                            {/* List Items */}
                            <div className={`flex-1 bg-[#fdfdfd] rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3 ${fadeInUp} ${mounted ? fadeInUpActive : ''}`} style={{ transitionDelay: '400ms' }}>
                                <div className="w-20 h-4 bg-gray-200 rounded mb-2"></div>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors duration-500 delay-[${800 + (i * 200)}ms] ${mounted ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
