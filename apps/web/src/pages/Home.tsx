import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import NavigationSidebar from '../components/NavigationSidebar';

export default function Home() {
    return (
        <div className="flex flex-col h-screen w-full bg-background-light text-text-primary font-sans overflow-hidden">
            <Header />
            <div className="flex flex-1 overflow-hidden w-full">
                <NavigationSidebar />
                <main className="flex-1 flex flex-col h-full relative overflow-y-auto">
                    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                            <Sidebar />
                            <Dashboard />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
