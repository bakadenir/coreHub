
import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckCircle, Calendar, FileText, Link as LinkIcon } from 'lucide-react';

export default function NavigationSidebar() {
    const location = useLocation();
    const [isHovered, setIsHovered] = useState(false);
    const sidebarRef = useRef<HTMLElement>(null);
    const isMouseInsideRef = useRef(false);

    // Apply collapsible sidebar to all main pages
    const mainPages = ['/home', '/habits', '/schedule', '/notes', '/links'];
    const isMainPage = mainPages.includes(location.pathname);

    // Check if mouse is inside sidebar on mount and after navigation
    const checkMousePosition = useCallback(() => {
        if (isMouseInsideRef.current) {
            setIsHovered(true);
        }
    }, []);

    // Re-check hover state after route change
    useEffect(() => {
        checkMousePosition();
    }, [location.pathname, checkMousePosition]);

    const handleMouseEnter = () => {
        isMouseInsideRef.current = true;
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        isMouseInsideRef.current = false;
        setIsHovered(false);
    };

    // Use state-based expansion
    const isExpanded = isHovered;

    const linkClass = (path: string) => `
        flex items-center text-sm font-medium rounded-lg transition-all duration-300 group h-10
        ${isMainPage && !isExpanded ? 'w-10 justify-center' : 'w-full px-3 gap-3'}
        ${location.pathname === path
            ? 'bg-surface-light text-primary'
            : 'text-gray-700 hover:bg-surface-light'
        }
    `;

    const iconClass = (path: string) => `
        flex items-center justify-center w-6 h-6 rounded transition-colors shrink-0
        ${location.pathname === path ? 'bg-gray-100 text-primary' : 'text-gray-500'}
    `;

    const textClass = `
        ${isMainPage && !isExpanded ? 'opacity-0 w-0' : 'opacity-100'} 
        whitespace-nowrap transition-all duration-300 overflow-hidden
    `;

    return (
        <aside
            ref={sidebarRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`
                flex flex-col border-r border-border-light bg-[#fdfdfd] shrink-0 overflow-hidden
                transition-all duration-300 ease-in-out relative
                ${isMainPage
                    ? isExpanded ? 'w-64' : 'w-14'
                    : 'w-20 lg:w-64'
                }
            `}
        >
            <nav className={`
                flex flex-col gap-2 px-2 py-4 flex-1
                ${isMainPage && !isExpanded ? 'items-center' : 'items-start px-3'}
                transition-all duration-300
            `}>
                <Link className={linkClass('/home')} to="/home">
                    <span className={iconClass('/home')}>
                        <LayoutDashboard size={16} />
                    </span>
                    <span className={textClass}>Home</span>
                </Link>
                <Link className={linkClass('/habits')} to="/habits">
                    <span className={iconClass('/habits')}>
                        <CheckCircle size={16} />
                    </span>
                    <span className={textClass}>Habits</span>
                </Link>
                <Link className={linkClass('/schedule')} to="/schedule">
                    <span className={iconClass('/schedule')}>
                        <Calendar size={16} />
                    </span>
                    <span className={textClass}>Schedule</span>
                </Link>
                <Link className={linkClass('/notes')} to="/notes">
                    <span className={iconClass('/notes')}>
                        <FileText size={16} />
                    </span>
                    <span className={textClass}>Notes</span>
                </Link>
                <Link className={linkClass('/links')} to="/links">
                    <span className={iconClass('/links')}>
                        <LinkIcon size={16} />
                    </span>
                    <span className={textClass}>Links</span>
                </Link>
            </nav>
        </aside>
    );
}
