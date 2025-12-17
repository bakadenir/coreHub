
import { Link, useLocation } from 'react-router-dom';

export default function NavigationSidebar() {
    const location = useLocation();
    const isDashboard = location.pathname === '/';

    return (
        <aside className={`${isDashboard ? '-ml-20 lg:-ml-64' : 'ml-0'} w-20 lg:w-64 flex flex-col border-r border-border-light bg-white shrink-0 transition-all duration-500 ease-in-out overflow-hidden`}>
            <nav className="flex flex-col gap-2 px-3 py-4 flex-1 min-w-[5rem] lg:min-w-[16rem]">
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
        </aside>
    );
}
