
import { useState } from 'react';
import Header from '../components/Header';
import AddScheduleModal from '../components/AddScheduleModal';
import NavigationSidebar from '../components/NavigationSidebar';

export default function Schedule() {
    const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);

    return (
        <div className="bg-background-light text-text-primary font-sans overflow-hidden h-screen flex flex-col w-full">
            <AddScheduleModal isOpen={isAddScheduleOpen} onClose={() => setIsAddScheduleOpen(false)} />
            <Header subtitle="Workspace" />
            <div className="flex flex-1 overflow-hidden w-full">
                <NavigationSidebar />

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light">
                    <header className="flex flex-col gap-4 p-6 border-b border-border-light bg-white shrink-0">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-text-primary text-3xl font-extrabold tracking-tight flex items-center gap-3">
                                    Schedule September 2023
                                    <div className="flex gap-1 ml-2">
                                        <button className="p-1 rounded-full hover:bg-gray-100 text-text-secondary transition-colors">
                                            <span className="material-icons-outlined text-xl">chevron_left</span>
                                        </button>
                                        <button className="p-1 rounded-full hover:bg-gray-100 text-text-secondary transition-colors">
                                            <span className="material-icons-outlined text-xl">chevron_right</span>
                                        </button>
                                    </div>
                                </h2>
                                <p className="text-text-secondary text-base font-normal">Manage your time and upcoming events.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    onClick={() => setIsAddScheduleOpen(true)}
                                    className="flex items-center justify-center rounded-lg h-10 px-5 bg-primary hover:bg-text-primary text-white gap-2 text-sm font-bold shadow-sm transition-all shadow-gray-200/50"
                                >
                                    <span className="material-icons-outlined text-[20px]">add</span>
                                    <span className="whitespace-nowrap">Add Schedule</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <div className="flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 border border-transparent self-start">
                                <label className="cursor-pointer h-full px-4 rounded-[4px] flex items-center justify-center has-[:checked]:bg-white has-[:checked]:shadow-sm has-[:checked]:text-black text-text-secondary text-xs font-semibold transition-all">
                                    <span>Month</span>
                                    <input defaultChecked className="hidden" name="view-toggle" type="radio" value="Month" />
                                </label>
                                <label className="cursor-pointer h-full px-4 rounded-[4px] flex items-center justify-center has-[:checked]:bg-white has-[:checked]:shadow-sm has-[:checked]:text-black text-text-secondary text-xs font-semibold transition-all">
                                    <span>Week</span>
                                    <input className="hidden" name="view-toggle" type="radio" value="Week" />
                                </label>
                                <label className="cursor-pointer h-full px-4 rounded-[4px] flex items-center justify-center has-[:checked]:bg-white has-[:checked]:shadow-sm has-[:checked]:text-black text-text-secondary text-xs font-semibold transition-all">
                                    <span>Day</span>
                                    <input className="hidden" name="view-toggle" type="radio" value="Day" />
                                </label>
                            </div>
                        </div>
                    </header>
                    <div className="flex flex-1 overflow-hidden">
                        <div className="flex-1 flex flex-col overflow-y-auto bg-white">
                            <div className="grid grid-cols-7 border-b border-border-light">
                                <div className="py-3 text-center text-xs font-bold uppercase text-text-secondary tracking-wider">Mon</div>
                                <div className="py-3 text-center text-xs font-bold uppercase text-text-secondary tracking-wider">Tue</div>
                                <div className="py-3 text-center text-xs font-bold uppercase text-text-secondary tracking-wider">Wed</div>
                                <div className="py-3 text-center text-xs font-bold uppercase text-text-secondary tracking-wider">Thu</div>
                                <div className="py-3 text-center text-xs font-bold uppercase text-text-secondary tracking-wider">Fri</div>
                                <div className="py-3 text-center text-xs font-bold uppercase text-text-secondary tracking-wider">Sat</div>
                                <div className="py-3 text-center text-xs font-bold uppercase text-text-secondary tracking-wider">Sun</div>
                            </div>
                            <div className="grid grid-cols-7 flex-1 min-h-[600px] auto-rows-fr bg-border-light gap-[1px] border-b border-border-light">
                                <div className="bg-white p-2 flex flex-col gap-1 min-h-[120px]">
                                    <span className="text-text-secondary/50 font-mono text-sm p-1">28</span>
                                </div>
                                <div className="bg-white p-2 flex flex-col gap-1 min-h-[120px]">
                                    <span className="text-text-secondary/50 font-mono text-sm p-1">29</span>
                                </div>
                                <div className="bg-white p-2 flex flex-col gap-1 min-h-[120px]">
                                    <span className="text-text-secondary/50 font-mono text-sm p-1">30</span>
                                </div>
                                <div className="bg-white p-2 flex flex-col gap-1 min-h-[120px]">
                                    <span className="text-text-secondary/50 font-mono text-sm p-1">31</span>
                                </div>
                                <div className="bg-white p-2 flex flex-col gap-1 min-h-[120px] group hover:bg-gray-50 transition-colors">
                                    <span className="text-text-primary font-mono text-sm font-medium p-1">01</span>
                                    <div className="bg-gray-50 text-gray-700 border-l-2 border-gray-600 text-[10px] font-medium p-1 px-2 rounded-r-md truncate cursor-pointer hover:opacity-80">
                                        09:00 Design Sync
                                    </div>
                                </div>
                                <div className="bg-white p-2 flex flex-col gap-1 min-h-[120px] group hover:bg-gray-50 transition-colors">
                                    <span className="text-text-primary font-mono text-sm font-medium p-1">02</span>
                                </div>
                                <div className="bg-white p-2 flex flex-col gap-1 min-h-[120px] group hover:bg-gray-50 transition-colors">
                                    <span className="text-text-primary font-mono text-sm font-medium p-1">03</span>
                                    <div className="bg-gray-50 text-gray-700 border-l-2 border-gray-500 text-[10px] font-medium p-1 px-2 rounded-r-md truncate cursor-pointer">
                                        Gym
                                    </div>
                                </div>
                                <div className="bg-white p-2 flex flex-col gap-1 min-h-[120px] group hover:bg-gray-50 transition-colors">
                                    <span className="text-text-primary font-mono text-sm font-medium p-1">04</span>
                                </div>
                                <div className="bg-white p-2 flex flex-col gap-1 min-h-[120px] group hover:bg-gray-50 transition-colors">
                                    <span className="text-text-primary font-mono text-sm font-medium p-1">05</span>
                                    <div className="bg-gray-50 text-gray-700 border-l-2 border-gray-700 text-[10px] font-medium p-1 px-2 rounded-r-md truncate cursor-pointer">
                                        14:00 Product Review
                                    </div>
                                    <div className="bg-gray-100 text-gray-700 text-[10px] font-medium p-1 px-2 rounded-md truncate cursor-pointer">
                                        +2 more
                                    </div>
                                </div>
                                <div className="bg-white p-2 flex flex-col gap-1 min-h-[120px] group hover:bg-gray-50 transition-colors">
                                    <span className="text-text-primary font-mono text-sm font-medium p-1">06</span>
                                </div>
                                <div className="bg-white p-2 flex flex-col gap-1 min-h-[120px] group hover:bg-gray-50 transition-colors">
                                    <span className="text-text-primary font-mono text-sm font-medium p-1">07</span>
                                </div>
                                <div className="bg-white p-2 flex flex-col gap-1 min-h-[120px] group hover:bg-gray-50 transition-colors">
                                    <span className="text-text-primary font-mono text-sm font-medium p-1">08</span>
                                </div>
                                <div className="bg-white p-2 flex flex-col gap-1 min-h-[120px] group hover:bg-gray-50 transition-colors">
                                    <span className="text-text-primary font-mono text-sm font-medium p-1">09</span>
                                    <div className="bg-gray-50 text-gray-700 border-l-2 border-gray-600 text-[10px] font-medium p-1 px-2 rounded-r-md truncate cursor-pointer">
                                        10:00 Weekly Sync
                                    </div>
                                </div>
                                <div className="bg-white p-2 flex flex-col gap-1 min-h-[120px] group hover:bg-gray-50 transition-colors relative">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white font-mono text-sm font-bold shadow-md shadow-gray-500/30">10</span>
                                    <div className="mt-1 bg-gray-50 text-text-primary border border-gray-200 text-[10px] font-medium p-1 px-2 rounded-md truncate cursor-pointer flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                        Lunch w/ Client
                                    </div>
                                </div>
                                {/* Filling the rest of the days with generic content */}
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className="bg-white p-2 min-h-[120px] group hover:bg-gray-50 transition-colors">
                                        <span className="text-text-primary font-mono text-sm font-medium p-1">{11 + i}</span>
                                    </div>
                                ))}
                                <div className="bg-white p-2 min-h-[120px]">
                                    <span className="text-text-secondary/50 font-mono text-sm p-1">01</span>
                                </div>
                            </div>
                        </div>
                        {/* Right Agenda Sidebar */}
                        <aside className="w-[320px] hidden xl:flex flex-col border-l border-border-light bg-gray-50 overflow-y-auto">
                            <div className="p-5 border-b border-border-light sticky top-0 bg-gray-50 z-10 flex justify-between items-center">
                                <h3 className="text-base font-bold text-text-primary">Agenda</h3>
                                <button className="text-text-secondary hover:text-text-primary transition-colors">
                                    <span className="material-icons-outlined text-[20px]">filter_list</span>
                                </button>
                            </div>
                            <div className="flex flex-col p-4 gap-6">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold uppercase text-text-secondary tracking-wider">Today, Sep 10</span>
                                        <div className="h-px flex-1 bg-border-light"></div>
                                    </div>
                                    <div className="group flex flex-col p-3 rounded-xl bg-white border border-border-light shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-mono text-xs font-medium text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded">09:00 - 10:00</span>
                                            <button className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-text-primary transition-opacity">
                                                <span className="material-icons-outlined text-[16px]">more_horiz</span>
                                            </button>
                                        </div>
                                        <h4 className="text-sm font-bold text-text-primary mb-1">Weekly Design Sync</h4>
                                        <div className="flex items-center gap-1.5 text-text-secondary text-xs">
                                            <span className="material-icons-outlined text-[14px]">videocam</span>
                                            <span>Google Meet</span>
                                        </div>
                                    </div>
                                    <div className="group flex flex-col p-3 rounded-xl bg-white border border-border-light shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-mono text-xs font-medium text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded">12:30 - 13:30</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-text-primary mb-1">Lunch w/ Client</h4>
                                        <div className="flex items-center gap-1.5 text-text-secondary text-xs">
                                            <span className="material-icons-outlined text-[14px]">location_on</span>
                                            <span className="truncate">Downtown Bistro</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold uppercase text-text-secondary tracking-wider">Tomorrow, Sep 11</span>
                                        <div className="h-px flex-1 bg-border-light"></div>
                                    </div>
                                    <div className="flex items-center gap-3 py-2 px-1 opacity-50">
                                        <span className="font-mono text-xs text-text-secondary w-12 text-right">09:00</span>
                                        <div className="h-px flex-1 border-t border-dashed border-gray-300"></div>
                                    </div>
                                    <div className="group flex flex-col p-3 rounded-xl bg-white border border-border-light shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-mono text-xs font-medium text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded">14:00 - 15:30</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-text-primary mb-1">Product Review</h4>
                                        <p className="text-xs text-text-secondary mb-2 line-clamp-1">Reviewing Q4 roadmap and feature specs.</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-1.5">
                                                <div
                                                    className="w-5 h-5 rounded-full border border-white bg-cover bg-center grayscale"
                                                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCweh_23XzJb07gmiRQ4SiH24dHQweMGFrNwfm9ScM-iqBgU-NAaik5Tp3QtEleXezjbeV-gKpxjGqDyqRYwv8RM5P7G7xcNS1ZPJrHJWKK_sK_Zu38IzqRZ3SFRQfVAn6fPVu_5ZUbTN8tGSPnpvcwMNzUPuht3ZJXjTxptOrdqQ-hMEB72G8e19fgPHR59HNs0UVvaNG8OgR5aBV2ZiRWPFzSFKUaekimD9VXOioH59QbDDVvmFBDbvP11_VRhJW3yDSZjWHgVmel")' }}
                                                ></div>
                                                <div
                                                    className="w-5 h-5 rounded-full border border-white bg-cover bg-center grayscale"
                                                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuASsw40UVGXHB5bd4mgBoprieHztazJGIEGKyv6IqmzebcFCUXNufvtcIkySbaHKNApGkrC4NjtQGsRLYbeCCI5gXZIdIN72TZ1N0PiQIzMAODS6--BChi86uR90ABXv-1mRHf0lRDjvBcCdmsJxnoBWYI-W6wYf7BHv6-hO8bOvA_DO7liTKIZRIf7JsIsuDmkCchVBKKuc6JsVHyq32cWR0coSY3I0odi3A7m12ih4EAX1FQuILD38ARm9mWtKbt9oUc53BpJdqGN")' }}
                                                ></div>
                                            </div>
                                            <span className="text-[10px] text-text-secondary">+2 others</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto p-4 border-t border-border-light">
                                <div className="flex items-center gap-3 text-text-secondary text-xs">
                                    <span className="material-icons-outlined text-sm">info</span>
                                    <p>Syncing calendars from Google...</p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>
        </div>
    );
}
