import React from 'react';
import { CheckCircle, AlertCircle, Layout, Bell } from 'lucide-react';
import { supabase } from '../supabase/supabase';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Dashboard Components
import StatCards from '../components/dashboard/StatCards';
import WeeklySchedule from '../components/dashboard/WeeklySchedule';
import AccountOverview from '../components/dashboard/AccountOverview';
import ActivityFeed from '../components/dashboard/ActivityFeed';

const Dashboard = () => {
    const { orgId } = useParams();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [brandColors, setBrandColors] = useState({
        KLM: '#002B72',
        KLS: '#4f46e5',
        KLC: '#0ea5e9'
    });

    const today = new Date();

    useEffect(() => {
        fetchPosts();
        fetchBrandSettings();
        fetchActivities();
    }, [orgId]);

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

    const fetchActivities = async () => {
        const { data, error } = await supabase
            .from('activity_log')
            .select(`
                *,
                profiles:user_id (full_name, email),
                posts:post_id (title)
            `)
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false })
            .limit(6);

        if (!error) {
            setActivities(data || []);
        }
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
    const approvedPosts = posts.filter(p => p.status === 'approved').length;

    const scheduledThisWeek = weekDays.reduce((total, date) => {
        return total + getPostsForDate(date).length;
    }, 0);

    const pendingReview = posts.filter(p => p.status === 'pending review').length;

    // Activity Helpers
    const getActivityIcon = (type) => {
        if (type === 'approve') return <CheckCircle size={18} />;
        if (type === 'reject') return <AlertCircle size={18} />;
        return <Layout size={18} />;
    };

    const getActivityStyle = (type) => {
        if (type === 'approve') return { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
        if (type === 'reject') return { background: 'rgba(239, 68, 68, 0.1)', color: '#ff4d4f' };
        return { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
    };

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
                <h1 className="text-slate-900 text-[32px] font-black m-0 tracking-[-1px]">Dashboard</h1>
                <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all duration-200 cursor-pointer relative hover:shadow-md hover:-translate-y-0.5">
                    <Bell size={18} strokeWidth={2.5} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
            </div>

            <StatCards 
                approvedPosts={approvedPosts} 
                scheduledThisWeek={scheduledThisWeek} 
                pendingReview={pendingReview} 
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

            <ActivityFeed 
                activities={activities} 
                getActivityIcon={getActivityIcon} 
                getActivityStyle={getActivityStyle} 
            />
        </div>
    );
};

export default Dashboard;