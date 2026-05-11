import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Layout } from 'lucide-react';
import { supabase } from '../supabase/supabase';

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

    // Stats Calculation
    const postsThisMonth = posts.filter(p => {
        if (!p.scheduled_date) return false;
        const d = new Date(p.scheduled_date);
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }).length;

    const scheduledThisWeek = posts.filter(p => {
        if (!p.scheduled_date) return false;
        const d = new Date(p.scheduled_date);
        return d >= weekRange.start && d <= weekRange.end && p.status === 'approved';
    }).length;

    const pendingReview = posts.filter(p => p.status === 'pending review').length;

    // Weekly Calendar Days
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekRange.start);
        d.setDate(weekRange.start.getDate() + i);
        weekDays.push(d);
    }

    const getPostsForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return posts.filter(p => p.scheduled_date === dateStr && p.status === 'approved');
    };

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
            <div style={{ padding: '48px', textAlign: 'center', color: '#002B72', fontWeight: 800 }}>
                Loading Dashboard...
            </div>
        );
    }

    return (
        <div className="dashboard-page" style={{ padding: '32px 48px', background: '#010D2C', minHeight: '100vh' }}>
            <style>{`
                .dashboard-header { margin-bottom: 32px; }
                .dashboard-header h1 { color: #ffffff; font-size: 32px; font-weight: 900; margin: 0; letter-spacing: -1px; }
            `}</style>

            <div className="dashboard-header">
                <h1>Dashboard</h1>
            </div>

            <StatCards 
                postsThisMonth={postsThisMonth} 
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