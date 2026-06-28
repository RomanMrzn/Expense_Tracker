import { Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
};

const formatToday = () =>
    new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

const Topbar = () => {
    const { user } = useAuth();
    const firstName = user?.name?.split(' ')[0] || '';

    return (
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
            <div>
                <div className="text-sm font-semibold text-slate-900 tracking-tight">
                    {greeting()}{firstName && `, ${firstName}`} 👋
                </div>
                <div className="text-xs text-slate-500">{formatToday()}</div>
            </div>

            <div className="flex items-center gap-1">
                <button
                    title="Search"
                    className="h-9 w-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition"
                >
                    <Search size={17} />
                </button>
                <button
                    title="Notifications"
                    className="relative h-9 w-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition"
                >
                    <Bell size={17} />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-white" />
                </button>
            </div>
        </header>
    );
};

export default Topbar;
