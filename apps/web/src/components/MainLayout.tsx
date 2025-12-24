import { Outlet } from 'react-router-dom';
import Header from './Header';
import NavigationSidebar from './NavigationSidebar';

export default function MainLayout() {
    return (
        <div className="bg-background-light text-text-primary font-sans overflow-hidden h-screen flex flex-col w-full">
            <Header subtitle="Workspace" />
            <div className="flex flex-1 overflow-hidden w-full">
                <NavigationSidebar />
                <Outlet />
            </div>
        </div>
    );
}
