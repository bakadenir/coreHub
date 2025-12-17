import { useState, useCallback } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import NavigationSidebar from '../components/NavigationSidebar';

export default function Home() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

    const triggerRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleDateHover = useCallback((date: Date | null) => {
        setHoveredDate(date);
    }, []);

    return (
        <div className="flex flex-col h-screen w-full bg-background-light text-text-primary font-sans overflow-hidden">
            <Header />
            <div className="flex flex-1 overflow-hidden w-full">
                <NavigationSidebar />
                <main className="flex-1 flex flex-col h-full relative overflow-y-auto">
                    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                            <Sidebar onDataChange={triggerRefresh} onDateHover={handleDateHover} />
                            <Dashboard refreshTrigger={refreshTrigger} hoveredDate={hoveredDate} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
