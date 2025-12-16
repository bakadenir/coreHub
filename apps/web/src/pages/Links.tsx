
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import AddLinkModal from '../components/AddLinkModal';

export default function Links() {
    const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);

    return (
        <div className="flex flex-col h-screen w-full bg-background-light text-text-primary font-sans overflow-hidden">
            <AddLinkModal isOpen={isAddLinkOpen} onClose={() => setIsAddLinkOpen(false)} />
            <Header subtitle="Workspace" />
            <div className="flex flex-1 overflow-hidden w-full">
                {/* Sidebar */}
                <aside className="w-20 lg:w-64 flex flex-col border-r border-border-light bg-white shrink-0 transition-all duration-300">
                    <nav className="flex flex-col gap-2 px-3 py-4 flex-1">
                        <Link className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all border group ${location.pathname === '/' ? 'bg-surface-light border-gray-200 text-primary' : 'text-gray-700 border-transparent hover:bg-surface-light hover:border-gray-200'}`} to="/">
                            <span className={`flex items-center justify-center w-6 h-6 rounded transition-colors shadow-sm ${location.pathname === '/' ? 'bg-white text-primary' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-primary'}`}>
                                <span className="material-icons-outlined text-sm">dashboard</span>
                            </span>
                            <span className="hidden lg:block">Dashboard</span>
                        </Link>
                        <Link className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all border group ${location.pathname === '/habits' ? 'bg-surface-light border-gray-200 text-primary' : 'text-gray-700 border-transparent hover:bg-surface-light hover:border-gray-200'}`} to="/habits">
                            <span className={`flex items-center justify-center w-6 h-6 rounded transition-colors shadow-sm ${location.pathname === '/habits' ? 'bg-white text-primary' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-primary'}`}>
                                <span className="material-icons-outlined text-sm">check_circle</span>
                            </span>
                            <span className="hidden lg:block">Habits</span>
                        </Link>
                        <Link className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all border group ${location.pathname === '/schedule' ? 'bg-surface-light border-gray-200 text-primary' : 'text-gray-700 border-transparent hover:bg-surface-light hover:border-gray-200'}`} to="/schedule">
                            <span className={`flex items-center justify-center w-6 h-6 rounded transition-colors shadow-sm ${location.pathname === '/schedule' ? 'bg-white text-primary' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-primary'}`}>
                                <span className="material-icons-outlined text-sm">calendar_today</span>
                            </span>
                            <span className="hidden lg:block">Schedule</span>
                        </Link>
                        <Link className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all border group ${location.pathname === '/notes' ? 'bg-surface-light border-gray-200 text-primary' : 'text-gray-700 border-transparent hover:bg-surface-light hover:border-gray-200'}`} to="/notes">
                            <span className={`flex items-center justify-center w-6 h-6 rounded transition-colors shadow-sm ${location.pathname === '/notes' ? 'bg-white text-primary' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-primary'}`}>
                                <span className="material-icons-outlined text-sm">description</span>
                            </span>
                            <span className="hidden lg:block">Notes</span>
                        </Link>
                        <Link className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all border group ${location.pathname === '/links' ? 'bg-surface-light border-gray-200 text-primary' : 'text-gray-700 border-transparent hover:bg-surface-light hover:border-gray-200'}`} to="/links">
                            <span className={`flex items-center justify-center w-6 h-6 rounded transition-colors shadow-sm ${location.pathname === '/links' ? 'bg-white text-primary' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-primary'}`}>
                                <span className="material-icons-outlined text-sm">link</span>
                            </span>
                            <span className="hidden lg:block">Links</span>
                        </Link>
                    </nav>
                    {/* User Profile Removed */}
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light">
                    <header className="flex items-center justify-between p-6 border-b border-border-light bg-white shrink-0">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-text-primary text-3xl font-extrabold tracking-tight">Links</h2>
                            <p className="text-text-secondary text-base font-normal">Manage your curated web collection.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsAddLinkOpen(true)}
                                className="flex items-center justify-center rounded-lg h-10 px-5 bg-primary hover:bg-text-primary text-white gap-2 text-sm font-bold shadow-sm transition-all shadow-gray-200/50"
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
                                    <h3 className="text-base font-bold text-text-primary">Link Vault</h3>
                                    <button className="text-text-secondary hover:text-text-primary transition-colors">
                                        <span className="material-icons-outlined text-[20px]">sort</span>
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 border border-border-light focus:border-text-primary focus:ring-0 text-text-primary text-sm placeholder-gray-400"
                                        placeholder="Filter links..."
                                        type="text"
                                    />
                                    <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                                </div>
                            </div>
                            <div className="flex flex-col p-4 gap-2">
                                <a className="group flex items-center p-3 rounded-lg bg-white border border-border-light shadow-sm hover:shadow-md transition-all cursor-pointer" href="#">
                                    <img
                                        alt="Favicon for Stripe.com"
                                        className="size-5 shrink-0 mr-3 rounded grayscale"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQwXKTVhFbCGrAwsFPWeBW6xdUGXtBOOQ7nk4vPdP9QVR6TPfh6agFRa9UTtzeRf1tgXtyji5uyTByQfv1ZGrVBG7E_1eGKniivGgujnKOuPzMmM3wVfqMLfRXD9M2c-g2p_6hO_ktj-uvZMGrGR0qkEk27f36wwMSIqoTVkf2-xtBkAPjeWZ7pGoJNWkCmbrdlPy-SQZfdeNwCE_2oe2TxaVcEyBlt7YRexy0fPeWwutoUqziee9PxeRvJjeZyF8XmQFHdXbDrMos"
                                    />
                                    <div className="flex flex-col flex-1 overflow-hidden">
                                        <h4 className="text-sm font-bold text-text-primary line-clamp-1">Stripe Docs: Payments API</h4>
                                        <p className="text-xs text-text-secondary line-clamp-1">api-reference.stripe.com/payments</p>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-text-primary transition-opacity ml-2">
                                        <span className="material-icons-outlined text-[16px]">more_horiz</span>
                                    </button>
                                </a>
                                <a className="group flex items-center p-3 rounded-lg bg-background-light border border-transparent hover:bg-gray-100 transition-colors cursor-pointer" href="#">
                                    <img
                                        alt="Favicon for Figma.com"
                                        className="size-5 shrink-0 mr-3 rounded grayscale"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWtWVbRN3uIWU_uySqQbm1h8WwgUfeXD86UIiGEpHjATHAh8oTNd5DR21pBykmgPrJlVBQ4LA4TN0Pj-P7ePQ8FGedKFCEt4cY9eB-iFhA3dAzXwI_RiJhMFdxOsOXxSXCUefAEhrpnnv2PCgKwSvbMmjX93cxaO2jBl_4NKrzSNMFAtabYIZF-ha3uMo93FvJqJeHbBiRuCf6QS1Nq4xWHEaJwggRd-5qwp9qXtNW32JbdI66JBZuOZv609U3FEeejYk7EA7-vtMG"
                                    />
                                    <div className="flex flex-col flex-1 overflow-hidden">
                                        <h4 className="text-sm font-medium text-text-primary line-clamp-1">Figma - Design System Guidelines</h4>
                                        <p className="text-xs text-text-secondary line-clamp-1">figma.com/design-system</p>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-text-primary transition-opacity ml-2">
                                        <span className="material-icons-outlined text-[16px]">more_horiz</span>
                                    </button>
                                </a>
                                <a className="group flex items-center p-3 rounded-lg bg-background-light border border-transparent hover:bg-gray-100 transition-colors cursor-pointer" href="#">
                                    <img
                                        alt="Favicon for Vercel.com"
                                        className="size-5 shrink-0 mr-3 rounded grayscale"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyt_10oGOpn-ukYI725azYoYvWRVU_0E0l_xybCAsydDEnCBahJAij_gk0st0383OidazOBtxJ5uflOInNQe8ePLUmC1sQeekuZ3WlvMWo1zm8MowNvR0Z1EgbJtNls2DbwVesXxnhByeJpaZ9bOfqJuODr5P1SOiD_-wllwyvswLd2ak_DwmmSMjQwhsF9VrVN-3qdaklts6i8KoSB6AlzRcprADaSWT0VdgdoEJHpA_nq6u9k6N0C57m31Wjt4_rZt9XD68BrTG8"
                                    />
                                    <div className="flex flex-col flex-1 overflow-hidden">
                                        <h4 className="text-sm font-medium text-text-primary line-clamp-1">Vercel Blog: Next.js 14 Release</h4>
                                        <p className="text-xs text-text-secondary line-clamp-1">vercel.com/blog/nextjs-14</p>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-text-primary transition-opacity ml-2">
                                        <span className="material-icons-outlined text-[16px]">more_horiz</span>
                                    </button>
                                </a>
                                {/* ... other links represented similarly ... */}
                            </div>
                        </aside>

                        {/* Link Preview Panel */}
                        <div className="flex-1 flex flex-col overflow-y-auto bg-background-light p-8 md:p-12 lg:p-16">
                            <div className="mx-auto w-full max-w-4xl flex flex-col gap-6">
                                <h3 className="text-3xl font-bold text-text-primary tracking-tight mb-4">Link Preview Panel</h3>
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-border-light flex flex-col gap-6">

                                    <div className="flex items-center gap-3">
                                        <img
                                            alt="Favicon for Stripe.com"
                                            className="size-6 shrink-0 rounded grayscale"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGb6XYQ2_qvwRSQN8CzTFQTrhL1lRxpXb2NKfZx5YezQh8EPVojCdiCBmZlyGHSUw2iVz8OpNGEdyCmtDnhvfq1em6drQLS-29FeL2BRUPzCPIDmMqVxQMiiofK7BQeVKca_kU80gG2MrZHR_s4Vo273ecqWsO5BBbAu15nLwsBfCgTPFmdK9XOEgLS3GAIVWvqkWeUGOtVExU_iLwdoqRhNuMqv-gLAbHsFz1CWMzum_rV5evYFot22_LqB7dW7Igx2yn3GTC6TcU"
                                        />
                                        <a className="text-xl font-bold text-text-primary hover:underline truncate" href="https://stripe.com/docs/api/payments" target="_blank" rel="noreferrer">
                                            Stripe Docs: Payments API
                                        </a>
                                    </div>
                                    <p className="text-sm text-text-secondary flex items-center gap-2">
                                        <span className="material-icons-outlined text-base">link</span>
                                        <span className="truncate">https://stripe.com/docs/api/payments</span>
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="bg-gray-100 text-text-primary text-xs font-medium px-3 py-1 rounded-full border border-border-light">#Payments</span>
                                        <span className="bg-gray-100 text-text-primary text-xs font-medium px-3 py-1 rounded-full border border-border-light">#API</span>
                                        <span className="bg-gray-100 text-text-primary text-xs font-medium px-3 py-1 rounded-full border border-border-light">#Documentation</span>
                                        <span className="bg-gray-100 text-text-primary text-xs font-medium px-3 py-1 rounded-full border border-border-light">#Stripe</span>
                                    </div>
                                    <p className="text-text-primary text-base leading-relaxed">
                                        Comprehensive documentation for integrating Stripe's Payments API. Covers various payment methods, charges, refunds, and handling webhooks. Essential for developers building payment functionalities.
                                    </p>
                                    <div className="flex gap-3 mt-4">
                                        <button className="flex items-center justify-center rounded-lg h-10 px-5 bg-primary hover:bg-text-primary text-white gap-2 text-sm font-semibold shadow-sm transition-all shadow-gray-200/50">
                                            <span className="material-icons-outlined text-[20px]">open_in_new</span>
                                            <span className="whitespace-nowrap">Open Link</span>
                                        </button>
                                        <button className="flex items-center justify-center rounded-lg h-10 px-5 bg-gray-100 hover:bg-gray-200 text-text-primary gap-2 text-sm font-semibold shadow-sm transition-all shadow-gray-200/50">
                                            <span className="material-icons-outlined text-[20px]">edit</span>
                                            <span className="whitespace-nowrap">Edit Details</span>
                                        </button>
                                        <button className="flex items-center justify-center rounded-lg h-10 px-5 bg-primary hover:bg-text-primary text-white gap-2 text-sm font-semibold shadow-sm transition-all shadow-gray-200/50">
                                            <span className="material-icons-outlined text-[20px]">delete</span>
                                            <span className="whitespace-nowrap">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
