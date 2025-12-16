
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import AddNoteModal from '../components/AddNoteModal';

export default function Notes() {
    const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);

    return (
        <div className="flex flex-col h-screen w-full bg-background-light text-text-primary font-sans overflow-hidden">
            <AddNoteModal isOpen={isAddNoteOpen} onClose={() => setIsAddNoteOpen(false)} />
            <Header subtitle="Workspace" />
            <div className="flex flex-1 overflow-hidden w-full">
                {/* Sidebar */}
                <aside className="w-20 lg:w-64 flex flex-col border-r border-border-light bg-white shrink-0 transition-all duration-300">
                    <nav className="flex flex-col gap-2 px-3 py-4 flex-1">
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
                    {/* User Profile Removed */}
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-white">
                    <header className="flex items-center justify-between p-6 border-b border-border-light bg-white shrink-0">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-text-primary text-3xl font-extrabold tracking-tight">Notes</h2>
                            <p className="text-text-secondary text-base font-normal">Organize your thoughts and ideas.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsAddNoteOpen(true)}
                                className="flex items-center justify-center rounded-lg h-10 px-5 bg-primary hover:bg-text-primary text-white gap-2 text-sm font-bold shadow-sm transition-all shadow-gray-200/50"
                            >
                                <span className="material-icons-outlined text-[20px]">add</span>
                                <span className="whitespace-nowrap">Add Notes</span>
                            </button>
                        </div>
                    </header>
                    <div className="flex flex-1 overflow-hidden">
                        {/* Notes List Sidebar */}
                        <aside className="w-[320px] shrink-0 flex flex-col border-r border-border-light bg-background-light overflow-y-auto">
                            <div className="p-5 border-b border-border-light sticky top-0 bg-background-light z-10 flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-base font-bold text-text-primary">All Notes</h3>
                                    <button className="text-text-secondary hover:text-text-primary transition-colors">
                                        <span className="material-icons-outlined text-[20px]">sort</span>
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 border border-border-light focus:border-text-primary focus:ring-0 text-text-primary text-sm placeholder-gray-400"
                                        placeholder="Filter notes..."
                                        type="text"
                                    />
                                    <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                                </div>
                            </div>
                            <div className="flex flex-col p-4 gap-2">
                                <a className="group flex flex-col p-3 rounded-lg bg-white border border-border-light shadow-sm hover:shadow-md transition-all cursor-pointer" href="#">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-sm font-bold text-black line-clamp-1">Project Everest Meeting Notes</h4>
                                        <button className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-text-primary transition-opacity">
                                            <span className="material-icons-outlined text-[16px]">more_horiz</span>
                                        </button>
                                    </div>
                                    <p className="text-xs text-text-secondary mb-2 line-clamp-2">Discussed Q3 strategy, budget allocation, and team responsibilities. Follow-up actions include...</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Yesterday, 10:30 AM</span>
                                        <span className="material-icons-outlined text-[14px]">push_pin</span>
                                    </div>
                                </a>
                                <a className="group flex flex-col p-3 rounded-lg bg-background-light border border-transparent hover:bg-gray-100 transition-colors cursor-pointer" href="#">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-sm font-medium text-text-primary line-clamp-1">Brainstorming Session for Marketing Campaign</h4>
                                        <button className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-text-primary transition-opacity">
                                            <span className="material-icons-outlined text-[16px]">more_horiz</span>
                                        </button>
                                    </div>
                                    <p className="text-xs text-text-secondary mb-2 line-clamp-2">Explored new channels and content ideas. Focus on social media and influencer outreach.</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Sep 8, 2023</span>
                                    </div>
                                </a>
                                <a className="group flex flex-col p-3 rounded-lg bg-background-light border border-transparent hover:bg-gray-100 transition-colors cursor-pointer" href="#">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-sm font-medium text-text-primary line-clamp-1">Client Feedback Summary - Q2</h4>
                                        <button className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-text-primary transition-opacity">
                                            <span className="material-icons-outlined text-[16px]">more_horiz</span>
                                        </button>
                                    </div>
                                    <p className="text-xs text-text-secondary mb-2 line-clamp-2">Positive feedback on new features, areas for improvement in onboarding process.</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Aug 29, 2023</span>
                                    </div>
                                </a>
                                <a className="group flex flex-col p-3 rounded-lg bg-background-light border border-transparent hover:bg-gray-100 transition-colors cursor-pointer" href="#">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-sm font-medium text-text-primary line-clamp-1">Daily Standup Notes - Aug 28</h4>
                                        <button className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-text-primary transition-opacity">
                                            <span className="material-icons-outlined text-[16px]">more_horiz</span>
                                        </button>
                                    </div>
                                    <p className="text-xs text-text-secondary mb-2 line-clamp-2">Team updates, blockers, and next steps. Task delegation for sprint.</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Aug 28, 2023</span>
                                    </div>
                                </a>
                                <a className="group flex flex-col p-3 rounded-lg bg-background-light border border-transparent hover:bg-gray-100 transition-colors cursor-pointer" href="#">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-sm font-medium text-text-primary line-clamp-1">Personal Goals for Q4</h4>
                                        <button className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-text-primary transition-opacity">
                                            <span className="material-icons-outlined text-[16px]">more_horiz</span>
                                        </button>
                                    </div>
                                    <p className="text-xs text-text-secondary mb-2 line-clamp-2">Learning new skill, fitness targets, travel plans.</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Aug 25, 2023</span>
                                    </div>
                                </a>
                            </div>
                        </aside>
                        {/* Notes Editor Area */}
                        <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 md:p-12 lg:p-16">
                            <div className="mx-auto w-full max-w-3xl flex flex-col gap-6">
                                <input
                                    className="block w-full border-none px-0 text-4xl font-black text-text-primary bg-transparent focus:ring-0 placeholder:text-gray-300 outline-none"
                                    placeholder="Note Title"
                                    type="text"
                                />
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                    <span className="material-icons-outlined text-base">event</span>
                                    <span>Last edited: September 10, 2023 at 10:30 AM</span>
                                    <span className="mx-2 text-gray-300">|</span>
                                    <span className="material-icons-outlined text-base">auto_awesome</span>
                                    <span>AI Insights: Summarize, Expand, Rewrite</span>
                                </div>
                                <textarea
                                    className="block w-full min-h-[500px] border-none px-0 text-lg font-serif-body text-text-primary bg-transparent focus:ring-0 placeholder:text-gray-400 resize-none outline-none"
                                    placeholder="Start writing your note here..."
                                    defaultValue={`Project Everest Meeting Notes
Attendees: Alex Morgan, Sarah Chen, Mike Johnson
Date: September 10, 2023
Time: 09:00 - 10:00 AM
Key Discussion Points:
1. Q3 Strategy Review:
    - Overall performance alignment with annual goals.
    - Identified key areas of overperformance and underperformance.
    - Agreed to double down on mobile app engagement, which saw significant growth.
2. Budget Allocation:
    - Reallocated 15% of the marketing budget to digital ads based on recent performance data.
    - Approved additional budget for cloud infrastructure upgrades to support anticipated user growth.
3. Team Responsibilities:
    - Sarah Chen to lead the mobile app engagement initiatives.
    - Mike Johnson to oversee cloud infrastructure project and report weekly.
    - Alex Morgan to coordinate inter-departmental efforts and stakeholder communication.
Action Items:
- Sarah: Draft detailed plan for mobile app engagement (Due: Sep 15).
- Mike: Get quotes for cloud infrastructure upgrades (Due: Sep 17).
- Alex: Schedule follow-up meeting with stakeholders (Due: Sep 12).
- All: Review current Q4 roadmap and provide feedback by end of week.
Next Meeting: September 17, 2023.`}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
