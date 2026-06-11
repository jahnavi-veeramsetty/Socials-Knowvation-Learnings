import React from 'react';
import { CheckCircle, AlertCircle, Layout, Bell } from 'lucide-react';
import { supabase } from '../supabase/supabase';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Dashboard Components
import StatCards from '../components/dashboard/StatCards';
import WeeklySchedule from '../components/dashboard/WeeklySchedule';
import AccountOverview from '../components/dashboard/AccountOverview';
import BlogOverview from '../components/dashboard/BlogOverview';
import NotificationsPanel from '../components/dashboard/NotificationsPanel';

const Dashboard = () => {
    const { orgId } = useParams();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [userId, setUserId] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [greeting, setGreeting] = useState('Dashboard');
    const [brandColors, setBrandColors] = useState({
        KLM: '#002B72',
        KLS: '#4f46e5',
        KLC: '#0ea5e9'
    });

    const today = new Date();

    useEffect(() => {
        const initUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        initUser();
    }, []);

    useEffect(() => {
        if (orgId) {
            fetchPosts();
            fetchBlogs();
            fetchBrandSettings();
        }
    }, [orgId]);

    useEffect(() => {
        if (userId && orgId) {
            fetchUnreadCount();
            fetchTeamAndGenerateGreeting();
        }
    }, [userId, orgId]);

    const fetchTeamAndGenerateGreeting = async () => {
        const { data: members, error } = await supabase
            .from('organization_members')
            .select('role, user_id')
            .eq('organization_id', orgId);

        if (!error && members) {
            const currentUserMember = members.find(m => m.user_id === userId);
            const role = currentUserMember?.role || 'member';
            
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .in('id', members.map(m => m.user_id));

            let currentUserName = 'User';
            const teamList = [];

            if (profiles) {
                const myProfile = profiles.find(p => p.id === userId);
                if (myProfile) {
                    currentUserName = myProfile.full_name || myProfile.email || 'User';
                }

                profiles.forEach(p => {
                    teamList.push({
                        id: p.id,
                        name: p.full_name?.split(' ')[0] || p.email?.split('@')[0],
                        role: members.find(m => m.user_id === p.id)?.role
                    });
                });
            }

            import('../greetings/generator.js').then(({ getGreeting }) => {
                setGreeting(getGreeting(role, currentUserName.split(' ')[0], teamList));
            }).catch(console.error);
        }
    };

    const fetchUnreadCount = async () => {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .eq('user_id', userId)
            .eq('is_read', false);
        if (!error) setUnreadCount(count || 0);
    };

    const fetchBrandSettings = async () => {
        const { data } = await supabase
            .from('organizations')
            .select('brand_colors')
            .eq('id', orgId)
            .single();

        if (data?.brand_colors) {
            setBrandColors(data.brand_colors);
        }
    };

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('organization_id', orgId);

        if (!error) {
            setPosts(data || []);
        }
        setLoading(false);
    };

    const fetchBlogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('organization_id', orgId);

        if (!error) {
            setBlogs(data || []);
        }
        setLoading(false);
    };

    // Week Range Calculation
    const getWeekRange = (date) => {
        const current = new Date(date);
        const day = current.getDay();
        const diff = current.getDate() - day + (day === 0 ? -6 : 1); // Monday start
        const start = new Date(current.setDate(diff));
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return { start, end };
    };

    const weekRange = getWeekRange(new Date(today));

    // Weekly Calendar Days
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekRange.start);
        d.setDate(weekRange.start.getDate() + i);
        weekDays.push(d);
    }

    const getPostsForDate = (date) => {
        // Use local date string to avoid timezone offset issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        return posts.filter(p => p.scheduled_date === dateStr && p.status === 'approved');
    };

    // Stats Calculation
    const carousels = posts.filter(p => p.post_type === 'carousel');
    const reels = posts.filter(p => p.post_type === 'reel');

    const approvedCarousels = carousels.filter(p => p.status === 'approved').length;
    const pendingCarousels = carousels.filter(p => p.status === 'pending review').length;
    const scheduledCarouselsThisWeek = weekDays.reduce((total, date) => {
        return total + getPostsForDate(date).filter(p => p.post_type === 'carousel').length;
    }, 0);

    const approvedReels = reels.filter(p => p.status === 'approved').length;
    const pendingReels = reels.filter(p => p.status === 'pending review').length;
    const scheduledReelsThisWeek = weekDays.reduce((total, date) => {
        return total + getPostsForDate(date).filter(p => p.post_type === 'reel').length;
    }, 0);

    const approvedBlogs = blogs.filter(b => b.status === 'approved').length;
    const pendingBlogs = blogs.filter(b => b.status === 'pending review').length;
    
    // Blogs scheduled this week
    const scheduledBlogsThisWeek = weekDays.reduce((total, date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        return total + blogs.filter(b => b.scheduled_date === dateStr && b.status === 'approved').length;
    }, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-brand font-extrabold">
                Loading Dashboard...
            </div>
        );
    }

    return (
        <div className="px-12 py-8 bg-light-bg min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-slate-900 text-[28px] md:text-[32px] font-black m-0 tracking-[-1px] leading-tight max-w-[80%]">{greeting}</h1>
                <button
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all duration-200 cursor-pointer relative hover:shadow-md hover:-translate-y-0.5"
                    onClick={() => setIsNotificationsOpen(true)}
                >
                    <Bell size={18} strokeWidth={2.5} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
            </div>

            <StatCards
                approvedCarousels={approvedCarousels}
                scheduledCarouselsThisWeek={scheduledCarouselsThisWeek}
                pendingCarousels={pendingCarousels}
                approvedReels={approvedReels}
                scheduledReelsThisWeek={scheduledReelsThisWeek}
                pendingReels={pendingReels}
                approvedBlogs={approvedBlogs}
                scheduledBlogsThisWeek={scheduledBlogsThisWeek}
                pendingBlogs={pendingBlogs}
            />

            <WeeklySchedule
                weekDays={weekDays}
                today={today}
                getPostsForDate={getPostsForDate}
                brandColors={brandColors}
                orgId={orgId}
            />

            <AccountOverview
                posts={posts}
                brandColors={brandColors}
                today={today}
                weekRange={weekRange}
                orgId={orgId}
            />

            <BlogOverview 
                blogs={blogs}
                today={today}
                orgId={orgId}
            />

            <NotificationsPanel
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                orgId={orgId}
                userId={userId}
                onNotificationRead={fetchUnreadCount}
            />
        </div>
    );
};

export default Dashboard;