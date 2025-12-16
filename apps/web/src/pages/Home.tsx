
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';

export default function Home() {
    return (
        <>
            <Header />
            <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                    <Sidebar />
                    <Dashboard />
                </div>
            </main>
            <footer className="w-full text-center py-6 text-xs text-gray-400">
                © 2025 coreHub. All rights reserved.
            </footer>
        </>
    );
}
