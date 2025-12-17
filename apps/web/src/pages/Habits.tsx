
import { useState } from 'react';
import Header from '../components/Header';
import AddHabitModal from '../components/AddHabitModal';
import NavigationSidebar from '../components/NavigationSidebar';

export default function Habits() {
    const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);

    return (
        <div className="bg-background-light text-text-primary font-sans overflow-hidden h-screen flex flex-col w-full">
            <AddHabitModal isOpen={isAddHabitOpen} onClose={() => setIsAddHabitOpen(false)} />
            <Header subtitle="Workspace" />
            <div className="flex flex-1 overflow-hidden w-full">
                <NavigationSidebar />
                <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light">
                    <header className="flex items-center justify-between p-6 border-b border-border-light bg-white shrink-0">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-text-primary text-3xl font-extrabold tracking-tight">Habits</h2>
                            <p className="text-text-secondary text-base font-normal">A consolidated view of your habits and progress.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsAddHabitOpen(true)}
                                className="flex items-center justify-center rounded-lg h-10 px-5 bg-primary hover:bg-text-primary text-white gap-2 text-sm font-bold shadow-sm transition-all shadow-gray-200/50"
                            >
                                <span className="material-icons-outlined text-[20px]">add</span>
                                <span className="whitespace-nowrap">Add Habits</span>
                            </button>
                        </div>
                    </header>
                    <div className="flex flex-1 overflow-hidden overflow-y-auto w-full p-8 md:p-12">
                        <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex flex-col gap-3 rounded-lg p-5 bg-gray-50 border border-border-light shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-500 text-sm font-medium">Today's Completion</p>
                                        <span className="material-icons-outlined text-gray-400">donut_large</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-text-primary text-4xl font-bold">67%</p>
                                        <p className="text-gray-500 text-base">4/6 done</p>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                        <div className="bg-primary h-2 rounded-full" style={{ width: '67%' }}></div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 rounded-lg p-5 bg-gray-50 border border-border-light shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-500 text-sm font-medium">Longest Streak</p>
                                        <span className="material-icons-outlined text-red-500">local_fire_department</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-text-primary text-4xl font-bold">12 Days</p>
                                        <p className="text-green-600 text-base font-medium">+2 from last week</p>
                                    </div>
                                    <p className="text-gray-500 text-sm mt-2">Keep it up! Meditation is your strongest habit.</p>
                                </div>
                                <div className="flex flex-col gap-3 rounded-lg p-5 bg-gray-50 border border-border-light shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-500 text-sm font-medium">Total Active</p>
                                        <span className="material-icons-outlined text-gray-400">list_alt</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-text-primary text-4xl font-bold">8</p>
                                        <p className="text-gray-500 text-base">Habits</p>
                                    </div>
                                    <div className="flex -space-x-2 mt-2">
                                        <div className="size-8 rounded-full bg-gray-200 border-2 border-white"></div>
                                        <div className="size-8 rounded-full bg-gray-400 border-2 border-white"></div>
                                        <div className="size-8 rounded-full bg-gray-600 border-2 border-white"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 md:px-10 py-6">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 bg-white p-2 rounded-lg border border-border-light">
                                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                                        <button className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium whitespace-nowrap">All Habits</button>
                                        <button className="px-4 py-2 rounded-md text-text-secondary hover:bg-gray-100 text-sm font-medium whitespace-nowrap transition-colors">Daily</button>
                                        <button className="px-4 py-2 rounded-md text-text-secondary hover:bg-gray-100 text-sm font-medium whitespace-nowrap transition-colors">Weekly</button>
                                        <button className="px-4 py-2 rounded-md text-text-secondary hover:bg-gray-100 text-sm font-medium whitespace-nowrap transition-colors">Archived</button>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <div className="relative w-full sm:w-64">
                                            <span className="material-icons-outlined absolute left-3 top-2.5 text-gray-400 text-[20px]">search</span>
                                            <input
                                                className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-100 border border-border-light text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none"
                                                placeholder="Search habits..."
                                                type="text"
                                            />
                                        </div>
                                        <button className="p-2 text-text-secondary hover:bg-gray-100 rounded-md transition-colors">
                                            <span className="material-icons-outlined">filter_list</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl border border-border-light overflow-hidden shadow-sm">
                                    <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-border-light bg-gray-50 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                        <div className="col-span-5 pl-2">Habit Name</div>
                                        <div className="col-span-2 text-center">Frequency</div>
                                        <div className="col-span-2 text-center">Streak</div>
                                        <div className="col-span-2 text-center">Status</div>
                                        <div className="col-span-1 text-right pr-2">Actions</div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center border-b border-border-light hover:bg-gray-50 transition-colors group">
                                        <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center text-text-primary">
                                                <span className="material-icons-outlined">self_improvement</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-text-primary font-semibold text-sm">Morning Meditation</p>
                                                <p className="text-text-secondary text-xs">07:00 AM • Wellness</p>
                                            </div>
                                        </div>
                                        <div className="col-span-6 md:col-span-2 flex md:justify-center items-center">
                                            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-text-primary text-xs font-medium border border-border-light">Daily</span>
                                        </div>
                                        <div className="col-span-6 md:col-span-2 flex md:justify-center items-center gap-1.5">
                                            <span className="material-icons-outlined text-red-500 text-[18px]">local_fire_department</span>
                                            <span className="text-text-primary font-bold text-sm">12</span>
                                        </div>
                                        <div className="col-span-12 md:col-span-2 flex md:justify-center items-center">
                                            <button className="group/check flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-100 hover:bg-green-200 transition-colors w-full md:w-auto justify-center">
                                                <span className="material-icons-outlined text-green-600 text-[18px]">check_circle</span>
                                                <span className="text-green-600 text-xs font-bold">Done</span>
                                            </button>
                                        </div>
                                        <div className="col-span-12 md:col-span-1 flex justify-end items-center pr-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button className="text-text-secondary hover:text-primary p-1">
                                                <span className="material-icons-outlined">more_vert</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center border-b border-border-light hover:bg-gray-50 transition-colors group">
                                        <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center text-text-primary">
                                                <span className="material-icons-outlined">menu_book</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-text-primary font-semibold text-sm">Read 30 mins</p>
                                                <p className="text-text-secondary text-xs">Anytime • Learning</p>
                                            </div>
                                        </div>
                                        <div className="col-span-6 md:col-span-2 flex md:justify-center items-center">
                                            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-text-primary text-xs font-medium border border-border-light">Daily</span>
                                        </div>
                                        <div className="col-span-6 md:col-span-2 flex md:justify-center items-center gap-1.5">
                                            <span className="material-icons-outlined text-gray-400 text-[18px]">local_fire_department</span>
                                            <span className="text-text-secondary font-bold text-sm">0</span>
                                        </div>
                                        <div className="col-span-12 md:col-span-2 flex md:justify-center items-center">
                                            <button className="group/check flex items-center gap-2 px-3 py-1.5 rounded-md border border-border-light hover:border-text-primary hover:bg-gray-50 transition-all w-full md:w-auto justify-center bg-white">
                                                <div className="size-4 rounded border border-gray-400 group-hover/check:border-text-primary"></div>
                                                <span className="text-text-secondary text-xs font-medium group-hover/check:text-text-primary">Mark Done</span>
                                            </button>
                                        </div>
                                        <div className="col-span-12 md:col-span-1 flex justify-end items-center pr-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button className="text-text-secondary hover:text-primary p-1">
                                                <span className="material-icons-outlined">more_vert</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center border-b border-border-light hover:bg-gray-50 transition-colors group">
                                        <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center text-text-primary">
                                                <span className="material-icons-outlined">fitness_center</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-text-primary font-semibold text-sm">Gym Workout</p>
                                                <p className="text-text-secondary text-xs">18:00 PM • Health</p>
                                            </div>
                                        </div>
                                        <div className="col-span-6 md:col-span-2 flex md:justify-center items-center">
                                            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-text-primary text-xs font-medium border border-border-light">Mon, Wed, Fri</span>
                                        </div>
                                        <div className="col-span-6 md:col-span-2 flex md:justify-center items-center gap-1.5">
                                            <span className="material-icons-outlined text-red-500 text-[18px]">local_fire_department</span>
                                            <span className="text-text-primary font-bold text-sm">2</span>
                                        </div>
                                        <div className="col-span-12 md:col-span-2 flex md:justify-center items-center">
                                            <button className="group/check flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-100 hover:bg-green-200 transition-colors w-full md:w-auto justify-center">
                                                <span className="material-icons-outlined text-green-600 text-[18px]">check_circle</span>
                                                <span className="text-green-600 text-xs font-bold">Done</span>
                                            </button>
                                        </div>
                                        <div className="col-span-12 md:col-span-1 flex justify-end items-center pr-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button className="text-text-secondary hover:text-primary p-1">
                                                <span className="material-icons-outlined">more_vert</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center border-b border-border-light hover:bg-gray-50 transition-colors group">
                                        <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center text-text-primary">
                                                <span className="material-icons-outlined">water_drop</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-text-primary font-semibold text-sm">Drink 2L Water</p>
                                                <p className="text-text-secondary text-xs">All Day • Health</p>
                                            </div>
                                        </div>
                                        <div className="col-span-6 md:col-span-2 flex md:justify-center items-center">
                                            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-text-primary text-xs font-medium border border-border-light">Daily</span>
                                        </div>
                                        <div className="col-span-6 md:col-span-2 flex md:justify-center items-center gap-1.5">
                                            <span className="material-icons-outlined text-red-500 text-[18px]">local_fire_department</span>
                                            <span className="text-text-primary font-bold text-sm">45</span>
                                        </div>
                                        <div className="col-span-12 md:col-span-2 flex md:justify-center items-center">
                                            <button className="group/check flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-100 hover:bg-green-200 transition-colors w-full md:w-auto justify-center">
                                                <span className="material-icons-outlined text-green-600 text-[18px]">check_circle</span>
                                                <span className="text-green-600 text-xs font-bold">Done</span>
                                            </button>
                                        </div>
                                        <div className="col-span-12 md:col-span-1 flex justify-end items-center pr-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button className="text-text-secondary hover:text-primary p-1">
                                                <span className="material-icons-outlined">more_vert</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center border-b border-border-light hover:bg-gray-50 transition-colors group">
                                        <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center text-text-primary">
                                                <span className="material-icons-outlined">code</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-text-primary font-semibold text-sm">Code Practice</p>
                                                <p className="text-text-secondary text-xs">20:00 PM • Career</p>
                                            </div>
                                        </div>
                                        <div className="col-span-6 md:col-span-2 flex md:justify-center items-center">
                                            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-text-primary text-xs font-medium border border-border-light">Weekdays</span>
                                        </div>
                                        <div className="col-span-6 md:col-span-2 flex md:justify-center items-center gap-1.5">
                                            <span className="material-icons-outlined text-gray-400 text-[18px]">local_fire_department</span>
                                            <span className="text-text-secondary font-bold text-sm">0</span>
                                        </div>
                                        <div className="col-span-12 md:col-span-2 flex md:justify-center items-center">
                                            <button className="group/check flex items-center gap-2 px-3 py-1.5 rounded-md border border-border-light hover:border-text-primary hover:bg-gray-50 transition-all w-full md:w-auto justify-center bg-white">
                                                <div className="size-4 rounded border border-gray-400 group-hover/check:border-text-primary"></div>
                                                <span className="text-text-secondary text-xs font-medium group-hover/check:text-text-primary">Mark Done</span>
                                            </button>
                                        </div>
                                        <div className="col-span-12 md:col-span-1 flex justify-end items-center pr-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button className="text-text-secondary hover:text-primary p-1">
                                                <span className="material-icons-outlined">more_vert</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors group">
                                        <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center text-text-primary">
                                                <span className="material-icons-outlined">bedtime</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-text-primary font-semibold text-sm">Sleep by 11 PM</p>
                                                <p className="text-text-secondary text-xs">23:00 PM • Health</p>
                                            </div>
                                        </div>
                                        <div className="col-span-6 md:col-span-2 flex md:justify-center items-center">
                                            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-text-primary text-xs font-medium border border-border-light">Daily</span>
                                        </div>
                                        <div className="col-span-6 md:col-span-2 flex md:justify-center items-center gap-1.5">
                                            <span className="material-icons-outlined text-red-500 text-[18px]">local_fire_department</span>
                                            <span className="text-text-primary font-bold text-sm">5</span>
                                        </div>
                                        <div className="col-span-12 md:col-span-2 flex md:justify-center items-center">
                                            <button className="group/check flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-100 hover:bg-green-200 transition-colors w-full md:w-auto justify-center">
                                                <span className="material-icons-outlined text-green-600 text-[18px]">check_circle</span>
                                                <span className="text-green-600 text-xs font-bold">Done</span>
                                            </button>
                                        </div>
                                        <div className="col-span-12 md:col-span-1 flex justify-end items-center pr-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button className="text-text-secondary hover:text-primary p-1">
                                                <span className="material-icons-outlined">more_vert</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-center pb-6">
                                    <button className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2 text-sm">
                                        <span>Load More Habits</span>
                                        <span className="material-icons-outlined text-[16px]">expand_more</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
