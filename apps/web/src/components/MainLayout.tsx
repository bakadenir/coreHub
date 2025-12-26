import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import NavigationSidebar from './NavigationSidebar';

export default function MainLayout() {
    const location = useLocation();

    // Show "Home" on /home, "Workspace" on other pages
    const subtitle = location.pathname === '/home' ? 'Home' : 'Workspace';

    return (
        <div className="bg-background-light text-text-primary font-sans overflow-hidden h-screen flex flex-col w-full">
            <Header subtitle={subtitle} />
            <div className="flex flex-1 overflow-hidden w-full">
                <NavigationSidebar />
                <Outlet />
            </div>
        </div>
    );
}
