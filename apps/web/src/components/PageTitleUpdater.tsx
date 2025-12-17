import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const titles: Record<string, string> = {
    '/': 'Welcome - coreHub',
    '/dashboard': 'Home - coreHub',
    '/admin': 'Admin Dashboard - coreHub',
    '/register': 'Register - coreHub',
    '/login': 'Login - coreHub',
    '/forgot-password': 'Forgot Password - coreHub',
    '/schedule': 'Schedule - coreHub',
    '/notes': 'Notes - coreHub',
    '/links': 'Links - coreHub',
    '/habits': 'Habits - coreHub',
    '/donate': 'Donate - coreHub',
    '/settings': 'Settings - coreHub',
    '/profile': 'Profile - coreHub',
};

export const PageTitleUpdater = () => {
    const location = useLocation();

    useEffect(() => {
        const title = titles[location.pathname] ?? 'coreHub Dashboard';
        document.title = title;
    }, [location]);

    return null;
};
