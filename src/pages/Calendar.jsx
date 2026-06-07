import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomSelect from '../components/common/CustomSelect';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    CheckCircle,
    ShieldCheck,
    Search,
    Layout,
    Link as LinkIcon,
    Film,
    Layers,
    Smartphone,
    Lock,
    Globe,
    Trash2,
    X,
    Plus
} from 'lucide-react';
import { supabase } from '../supabase/supabase';
import AddEventModal from '../components/calendar/AddEventModal';

const Calendar = () => {
    const { orgId } = useParams();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [brandColors, setBrandColors] = useState({
        KLM: '#002B72',
        KLS: '#4f46e5',
        KLC: '#0ea5e9'
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [socialFilter, setSocialFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [viewMode, setViewMode] = useState('month');
    const [events, setEvents] = useState([]);
    const [userId, setUserId] = useState(null);
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [deleteConfirmEventId, setDeleteConfirmEventId] = useState(null);
    const [showDrafts, setShowDrafts] = useState(false);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
            fetchApprovedPosts();
            fetchEvents();
            fetchBrandSettings();
        };
        init();
    }, [orgId, currentDate]);

    const fetchBrandSettings = async () => {
        const { data, error } = await supabase
            .from('organizations')
            .select('brand_colors')
            .eq('id', orgId)
            .single();

        if (data?.brand_colors) {
            setBrandColors(data.brand_colors);
        }
    };

    const fetchApprovedPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('posts')
            .select('*, profiles:created_by(full_name, email)')
            .eq('organization_id', orgId)
            .in('status', ['approved', 'draft']);

        if (!error) {
            setPosts(data || []);
        }
        setLoading(false);
    };

    const fetchEvents = async () => {
        const { data, error } = await supabase
            .from('calendar_events')
            .select('*, profiles:created_by(full_name, email)')
            .eq('organization_id', orgId);
        if (!error) {
            setEvents(data || []);
        }
    };

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const handleNext = () => {
        if (viewMode === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        } else {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
        }
    };

    const handlePrev = () => {
        if (viewMode === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        } else {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
        }
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const calendarDays = [];
    if (viewMode === 'month') {
        const daysInMonth = getDaysInMonth(year, month);
        let firstDay = getFirstDayOfMonth(year, month);
        firstDay = firstDay === 0 ? 6 : firstDay - 1; // Adjust for Monday start

        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            calendarDays.push(new Date(year, month, i));
        }
        const remainder = calendarDays.length % 7;
        if (remainder !== 0) {
            for (let i = 0; i < 7 - remainder; i++) {
                calendarDays.push(null);
            }
        }
    } else {
        let currentDayOfWeek = currentDate.getDay();
        currentDayOfWeek = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1; // Adjust for Monday start
        const startOfWeek = new Date(year, month, currentDate.getDate() - currentDayOfWeek);
        for (let i = 0; i < 7; i++) {
            calendarDays.push(new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i));
        }
    }

    const getPostsForDate = (dateObj) => {
        if (!dateObj) return [];
        const y = dateObj.getFullYear();
        const m = dateObj.getMonth() + 1;
        const d = dateObj.getDate();
        const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

        return posts.filter(p => {
            if (p.status === 'draft' && !showDrafts) return false;

            const matchesDate = p.scheduled_date === dateStr;
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSocial = socialFilter === 'all' || p.social_account === socialFilter;
            const matchesType = typeFilter === 'all' || p.post_type === typeFilter;

            return matchesDate && matchesSearch && matchesSocial && matchesType;
        });
    };

    const getEventsForDate = (dateObj) => {
        if (!dateObj) return [];
        const y = dateObj.getFullYear();
        const m = dateObj.getMonth() + 1;
        const d = dateObj.getDate();
        const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

        return events.filter(e => e.event_date === dateStr && e.title.toLowerCase().includes(searchQuery.toLowerCase()));
    };

    const handleDeleteEvent = (e, eventId) => {
        e.stopPropagation();
        setDeleteConfirmEventId(eventId);
    };

    const confirmDeleteEvent = async () => {
        if (!deleteConfirmEventId) return;
        const { error } = await supabase.from('calendar_events').delete().eq('id', deleteConfirmEventId);
        if (!error) fetchEvents();
        setDeleteConfirmEventId(null);
    };

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const isToday = (dateObj) => {
        if (!dateObj) return false;
        return dateObj.getFullYear() === today.getFullYear() && dateObj.getMonth() === today.getMonth() && dateObj.getDate() === today.getDate();
    };

    const isPast = (dateObj) => {
        if (!dateObj) return false;
        return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()) < todayStart;
    };

    return (
        <div className="px-8 xl:px-12 py-8 bg-light-bg min-h-screen text-slate-900 font-sans overflow-x-hidden">
            <div className="flex flex-col gap-6 mb-8">
                {/* Header Row: Title & Navigation (Left), Tags (Right) */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-slate-900 text-[32px] font-black m-0 tracking-[-1px] min-w-[240px]">
                            {viewMode === 'month' ? `${monthNames[month]} ${year}` : `Week of ${monthNames[calendarDays[0]?.getMonth() || month]} ${calendarDays[0]?.getDate()}`}
                        </h1>
                        <div className="flex gap-2">
                            <button className="bg-white border border-slate-200 text-slate-500 w-10 h-10 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-slate-50 hover:text-slate-900 shadow-sm hover:shadow-md hover:-translate-y-0.5" onClick={handlePrev}><ChevronLeft size={20} /></button>
                            <button className="bg-white border border-slate-200 text-slate-500 w-10 h-10 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-slate-50 hover:text-slate-900 shadow-sm hover:shadow-md hover:-translate-y-0.5" onClick={handleNext}><ChevronRight size={20} /></button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5 items-center">
                        <button
                            onClick={() => setShowDrafts(!showDrafts)}
                            className={`flex items-center gap-2 text-[12px] font-extrabold px-4 py-2 rounded-xl transition-all duration-200 border cursor-pointer ${showDrafts ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                        >
                            <div className={`w-2 h-2 rounded-full ${showDrafts ? 'bg-green-400' : 'bg-slate-300'}`}></div>
                            Drafts: {showDrafts ? 'ON' : 'OFF'}
                        </button>

                        {['KLM', 'KLS', 'KLC'].map(acc => {
                            const color = brandColors[acc] || '#002B72';
                            const label = acc === 'KLM' ? 'KL Main' : acc === 'KLS' ? 'KL Select' : 'KL Community';
                            return (
                                <div
                                    key={acc}
                                    className="flex items-center gap-2 text-[12px] font-extrabold px-4 py-2 rounded-xl transition-all duration-200 border cursor-default"
                                    style={{
                                        background: `${color}10`,
                                        borderColor: `${color}30`,
                                        color: color
                                    }}
                                >
                                    <div className="w-2 h-2 rounded-full" style={{ background: color }}></div>
                                    {label}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-3 items-center bg-light-card p-2 rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.05)] w-full">
                    <div className="relative min-w-[250px] flex-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            className="w-full py-2.5 pl-11 pr-4 rounded-xl border border-transparent bg-slate-50 text-sm font-semibold outline-none transition-all duration-200 text-slate-900 focus:bg-white focus:border-brand focus:shadow-[0_0_0_4px_rgba(0,43,114,0.1)]"
                            placeholder="Search posts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="w-[150px]">
                        <CustomSelect
                            className="py-2.5 px-4 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-600 bg-white outline-none cursor-pointer transition-all duration-200 hover:border-brand hover:text-slate-900 shadow-sm"
                            value={socialFilter}
                            onChange={val => setSocialFilter(val)}
                            options={[
                                { value: 'all', label: 'All Accounts' },
                                { value: 'KLM', label: 'KL Main' },
                                { value: 'KLS', label: 'KL Select' },
                                { value: 'KLC', label: 'KL Community' }
                            ]}
                        />
                    </div>

                    <div className="w-[150px]">
                        <CustomSelect
                            className="py-2.5 px-4 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-600 bg-white outline-none cursor-pointer transition-all duration-200 hover:border-brand hover:text-slate-900 shadow-sm"
                            value={typeFilter}
                            onChange={val => setTypeFilter(val)}
                            options={[
                                { value: 'all', label: 'All Types' },
                                { value: 'reel', label: 'Reel' },
                                { value: 'story', label: 'Story' },
                                { value: 'carousel', label: 'Carousel' }
                            ]}
                        />
                    </div>

                    <div className="w-[150px]">
                        <CustomSelect
                            className="py-2.5 px-4 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-600 bg-white outline-none cursor-pointer transition-all duration-200 hover:border-brand hover:text-slate-900 shadow-sm"
                            value={viewMode}
                            onChange={val => setViewMode(val)}
                            options={[
                                { value: 'month', label: 'Month' },
                                { value: 'week', label: 'Week' }
                            ]}
                        />
                    </div>
                    <button
                        className="bg-brand hover:bg-brand-hover text-white flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[13px] border-none cursor-pointer transition-all shadow-[0_4px_12px_rgba(0,43,114,0.3)] hover:-translate-y-0.5 ml-auto"
                        onClick={() => {
                            setSelectedEvent(null);
                            setIsAddEventModalOpen(true);
                        }}
                    >
                        <Plus size={16} /> Add Event
                    </button>
                </div>
            </div>

            <div className="bg-light-card rounded-[32px] border border-slate-200 shadow-[0_20px_40px_rgba(0,0,0,0.3)] overflow-hidden">
                <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
                    {days.map(d => <div key={d} className="py-5 text-center text-[11px] font-extrabold text-slate-500 uppercase tracking-[1.5px]">{d}</div>)}
                </div>

                <div className="grid grid-cols-7">
                    {calendarDays.map((dateObj, idx) => {
                        const dayPosts = getPostsForDate(dateObj);
                        const pastDay = isPast(dateObj);
                        return (
                            <div key={idx} className={`h-[150px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-3.5 border-r border-b border-slate-200 relative transition-all duration-200 bg-light-card last-of-type:border-r-0 hover:bg-slate-50 hover:z-10 ${!dateObj ? 'bg-black/5' : ''}`}
                                style={{ borderRight: (idx + 1) % 7 === 0 ? 'none' : undefined }}>

                                {/* Faded X for past days */}
                                {pastDay && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
                                        <X size={140} strokeWidth={1.5} />
                                    </div>
                                )}

                                {dateObj && (
                                    <div className="relative z-10">
                                        <span className={`text-[13px] font-extrabold w-8 h-8 flex items-center justify-center rounded-xl mb-3 transition-all duration-200 ${isToday(dateObj) ? 'bg-brand text-white shadow-[0_4px_12px_rgba(0,43,114,0.4)]' : 'text-slate-500'}`}>
                                            {dateObj.getDate()}
                                        </span>
                                        <div className="flex flex-col gap-2">
                                            {getEventsForDate(dateObj).map(evt => {
                                                const evtColor = evt.color || '#0ea5e9';
                                                return (
                                                    <div
                                                        key={`evt-${evt.id}`}
                                                        onClick={() => {
                                                            setSelectedEvent(evt);
                                                            setIsAddEventModalOpen(true);
                                                        }}
                                                        className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2 border cursor-pointer transition-all duration-[0.2s_cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-0.5 hover:shadow-md"
                                                        style={{
                                                            backgroundColor: `${evtColor}15`,
                                                            borderColor: `${evtColor}40`,
                                                            color: evtColor
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap text-ellipsis">
                                                            {evt.is_public ? <Globe size={12} className="shrink-0" /> : <Lock size={12} className="shrink-0" />}
                                                            <span className="truncate">{evt.title}</span>
                                                        </div>
                                                        {evt.created_by === userId && (
                                                            <button
                                                                onClick={(e) => handleDeleteEvent(e, evt.id)}
                                                                className="bg-transparent border-none p-0.5 rounded cursor-pointer transition-colors shrink-0 hover:bg-white/50"
                                                                style={{ color: evtColor }}
                                                                title="Delete Event"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                            {dayPosts.map(post => {
                                                const color = brandColors[post.social_account] || '#002B72';

                                                const getIcon = () => {
                                                    const type = post.post_type?.toLowerCase() || '';
                                                    if (type.includes('reel')) return <Film size={14} />;
                                                    if (type.includes('carousel')) return <Layers size={14} />;
                                                    if (type.includes('story')) return <Smartphone size={14} />;
                                                    return <Layout size={14} />;
                                                };

                                                return (
                                                    <div
                                                        key={post.id}
                                                        className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-[0.2s_cubic-bezier(0.175,0.885,0.32,1.275)] border hover:-translate-y-0.5 hover:brightness-110"
                                                        style={{
                                                            background: `${color}10`,
                                                            borderColor: `${color}40`,
                                                            color: color
                                                        }}
                                                        onClick={() => window.open(`/org/${orgId}/posts/create?id=${post.id}`, '_blank')}
                                                        title={post.title}
                                                    >
                                                        <span className="flex items-center justify-center opacity-80">{getIcon()}</span>
                                                        <span className="capitalize truncate">
                                                            {post.title}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <AddEventModal
                isOpen={isAddEventModalOpen}
                onClose={() => {
                    setIsAddEventModalOpen(false);
                    setSelectedEvent(null);
                }}
                orgId={orgId}
                userId={userId}
                onEventAdded={fetchEvents}
                editEvent={selectedEvent}
            />

            {/* Custom Delete Confirmation Modal */}
            {deleteConfirmEventId && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-white w-[400px] max-w-[90vw] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-6 animate-[slideUp_0.3s_ease-out]">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Delete Event</h3>
                        <p className="text-sm font-medium text-slate-500 mb-6">
                            Are you sure you want to delete this event? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirmEventId(null)}
                                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors border-none cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteEvent}
                                className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors border-none cursor-pointer shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:-translate-y-0.5"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;
