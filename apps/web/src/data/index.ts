import type { Habit, ActivityCardData, Note, LinkItem, ScheduleEvent, AgendaItem, UserProfile, AdminStat, RecentUser, ActivityLog } from '../types';

export const mockHabits: Habit[] = [
    {
        id: '1',
        name: 'Morning Meditation',
        time: '07:00 AM',
        category: 'Wellness',
        frequency: 'Daily',
        streak: 12,
        completed: true,
        icon: 'self_improvement',
        completionRate: 100
    },
    {
        id: '2',
        name: 'Read 30 mins',
        time: 'Anytime',
        category: 'Learning',
        frequency: 'Daily',
        streak: 0,
        completed: false,
        icon: 'menu_book',
        completionRate: 0
    },
    {
        id: '3',
        name: 'Gym Workout',
        time: '18:00 PM',
        category: 'Health',
        frequency: 'Mon, Wed, Fri',
        streak: 2,
        completed: true,
        icon: 'fitness_center',
        completionRate: 67
    },
    {
        id: '4',
        name: 'Drink 2L Water',
        time: 'All Day',
        category: 'Health',
        frequency: 'Daily',
        streak: 45,
        completed: true,
        icon: 'water_drop',
        completionRate: 100
    },
    {
        id: '5',
        name: 'Code Practice',
        time: '20:00 PM',
        category: 'Career',
        frequency: 'Weekdays',
        streak: 0,
        completed: false,
        icon: 'code',
        completionRate: 0
    },
    {
        id: '6',
        name: 'Sleep by 11 PM',
        time: '23:00 PM',
        category: 'Health',
        frequency: 'Daily',
        streak: 5,
        completed: true,
        icon: 'bedtime',
        completionRate: 83
    }
];

export const mockActivityData: ActivityCardData = {
    habits: [
        { id: '1', name: 'Morning Meditation', completed: true },
        { id: '2', name: 'Read 20 pages', completed: false },
        { id: '3', name: 'Drink 2L Water', completed: false }
    ],
    schedule: [
        { id: '1', time: '09:00', title: 'Team Standup' },
        { id: '2', time: '14:00', title: 'Project Review', location: 'Zoom', isCurrent: true },
        { id: '3', time: '16:30', title: 'Deep Work' }
    ],
    notes: [
        { id: '1', title: 'Design System Ideas', preview: 'Monochrome palette with high contrast...' },
        { id: '2', title: 'Meeting Minutes', preview: 'Action items for Q1 roadmap...' }
    ],
    links: [
        { id: '1', title: 'Figma Design File', url: '#', color: 'bg-blue-500' },
        { id: '2', title: 'AWS Console', url: '#', color: 'bg-orange-500' }
    ]
};

export const mockNotes: Note[] = [
    { id: 0, title: 'Project Everest Meeting', content: 'Discussed Q3 strategy, budget allocation, and team responsibilities. Follow-up actions include...', date: '2h ago', tag: 'Work' },
    { id: 1, title: 'Grocery List', content: 'Milk, eggs, bread, spinach, tomatoes, chicken breast, olive oil. Dont forget to check for discounts.', date: 'Yesterday', tag: 'Personal' },
    { id: 2, title: 'Book Recommendations', content: 'Atomic Habits, Deep Work, The Psychology of Money, Clean Code. Need to order them from Amazon.', date: '3 days ago', tag: 'Learning' },
    { id: 3, title: 'Gym Workout Routine', content: 'Monday: Chest & Triceps, Tuesday: Back & Biceps, Wednesday: Legs & Shoulders. Cardio on weekends.', date: '1 week ago', tag: 'Health' },
    { id: 4, title: 'Startup Ideas', content: 'AI-powered meal planner, decentralized social network, vertical farming for urban areas.', date: '2 weeks ago', tag: 'Ideas' },
];

export const mockLinks: LinkItem[] = [
    { id: 0, title: 'Tailwind CSS Documentation', url: 'https://tailwindcss.com/docs', description: 'Rapidly build modern websites without ever leaving your HTML.', image: 'https://tailwindcss.com/_next/static/media/social-card-large.a6e71726.jpg', tags: ['Dev', 'CSS'] },
    { id: 1, title: 'React Documentation', url: 'https://react.dev', description: 'The library for web and native user interfaces.', image: 'https://react.dev/images/og-home.png', tags: ['Dev', 'JS'] },
    { id: 2, title: 'Stripe Docs: Payments API', url: 'https://stripe.com/docs/api/payments', description: 'Complete reference for the Stripe API.', image: 'https://images.ctfassets.net/fzn2n1esqa4b/24G3y4a6j6e6i440400040/8c0663c965604117036666576628c666/stripe-docs-og.png', tags: ['Payments', 'API'] },
    { id: 3, title: 'Vercel Dashboard', url: 'https://vercel.com/dashboard', description: 'Develop. Preview. Ship. For the best frontend teams.', image: 'https://assets.vercel.com/image/upload/front/vercel/og.png', tags: ['Hosting'] },
    { id: 4, title: 'Figma - Interface Design', url: 'https://www.figma.com', description: 'Collaborative interface design tool.', image: 'https://static.figma.com/uploads/8c0663c965604117036666576628c666/figma-og.png', tags: ['Design'] },
];

export const mockScheduleEvents: ScheduleEvent[] = [
    { id: 1, date: 1, time: '09:00', title: 'Design Sync', color: 'border-gray-600' },
    { id: 2, date: 3, time: '', title: 'Gym', color: 'border-gray-500' },
    { id: 3, date: 5, time: '14:00', title: 'Product Review', color: 'border-gray-700' },
    { id: 4, date: 5, time: '', title: '+2 more', color: 'bg-gray-100 text-gray-700' },
    { id: 5, date: 9, time: '10:00', title: 'Weekly Sync', color: 'border-gray-600' },
];

export const mockAgenda: AgendaItem[] = [
    {
        id: 1,
        time: '09:00 - 10:00',
        title: 'Weekly Design Sync',
        platform: 'Google Meet',
        isToday: true
    },
    {
        id: 2,
        time: '12:30 - 13:30',
        title: 'Lunch w/ Client',
        location: 'Downtown Bistro',
        isToday: true
    },
    {
        id: 3,
        time: '14:00 - 15:30',
        title: 'Product Review',
        description: 'Reviewing Q4 roadmap and feature specs.',
        attendees: [
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCweh_23XzJb07gmiRQ4SiH24dHQweMGFrNwfm9ScM-iqBgU-NAaik5Tp3QtEleXezjbeV-gKpxjGqDyqRYwv8RM5P7G7xcNS1ZPJrHJWKK_sK_Zu38IzqRZ3SFRQfVAn6fPVu_5ZUbTN8tGSPnpvcwMNzUPuht3ZJXjTxptOrdqQ-hMEB72G8e19fgPHR59HNs0UVvaNG8OgR5aBV2ZiRWPFzSFKUaekimD9VXOioH59QbDDVvmFBDbvP11_VRhJW3yDSZjWHgVmel',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuASsw40UVGXHB5bd4mgBoprieHztazJGIEGKyv6IqmzebcFCUXNufvtcIkySbaHKNApGkrC4NjtQGsRLYbeCCI5gXZIdIN72TZ1N0PiQIzMAODS6--BChi86uR90ABXv-1mRHf0lRDjvBcCdmsJxnoBWYI-W6wYf7BHv6-hO8bOvA_DO7liTKIZRIf7JsIsuDmkCchVBKKuc6JsVHyq32cWR0coSY3I0odi3A7m12ih4EAX1FQuILD38ARm9mWtKbt9oUc53BpJdqGN'
        ],
        isToday: false
    }
];

export const mockUserProfile: UserProfile = {
    name: 'Deni Romadhon',
    role: 'Pro Member',
    email: 'deni.romadhon@corehub.com',
    bio: 'Passionate about productivity and clean design.',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKrvtkImsgcFS5l83m9Qx_Re3EyUYrh8vzBQojuvGNhiXmnWzOJEEQ_DuyTqeKCJPjmqs0Hk-oqUiMZWWXkVvCcaHhFNRysEUuP_-JZs63HBKDuxTNMic_HsCLS0SOJ9ZuTkuZ5C8i_ItMlbC0SWWPWMJGjxLqujqb6q9_nXKgPPKsCkogpK0fGMQ3q1FevQfOnVsiWersWtEGajIqlLIzlWDyRQvLxtcietFbGuafpeFFf3CnRMvuly57D3vSJcQ8yNYyyJnhkCrl'
};

export const mockAdminStats: AdminStat[] = [
    { label: 'Total Users', value: '12,450', change: '+12%', icon: 'people', color: 'bg-blue-500' },
    { label: 'Active Habits', value: '45,200', change: '+5%', icon: 'check_circle', color: 'bg-green-500' },
    { label: 'Total Notes', value: '8,930', change: '+18%', icon: 'description', color: 'bg-purple-500' },
    { label: 'Server Load', value: '24%', change: '-2%', icon: 'dns', color: 'bg-orange-500' },
];

export const mockRecentUsers: RecentUser[] = [
    { name: 'Alex Johnson', email: 'alex@example.com', role: 'User', status: 'Active', date: '2 mins ago' },
    { name: 'Sarah Connor', email: 'sarah@example.com', role: 'Pro', status: 'Active', date: '15 mins ago' },
    { name: 'Mike Ross', email: 'mike@example.com', role: 'User', status: 'Offline', date: '1 hour ago' },
    { name: 'Jessica Pearson', email: 'jessica@example.com', role: 'Admin', status: 'Active', date: '3 hours ago' },
    { name: 'Harvey Specter', email: 'harvey@example.com', role: 'Pro', status: 'Active', date: '5 hours ago' },
];

export const mockActivityLogs: ActivityLog[] = [
    { action: 'New User Registered', user: 'Alex Johnson', time: '10:42 AM' },
    { action: 'System Backup Completed', user: 'System', time: '04:00 AM' },
    { action: 'Database Optimized', user: 'System', time: '03:30 AM' },
    { action: 'Failed Login Attempt', user: 'Unknown IP', time: 'Yesterday' },
];
