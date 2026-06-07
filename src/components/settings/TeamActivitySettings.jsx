import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabase';
import ActivityFeed from '../dashboard/ActivityFeed';
import { CheckCircle, AlertCircle, Layout } from 'lucide-react';

const TeamActivitySettings = ({ orgId }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orgId) {
            fetchActivities();
        }
    }, [orgId]);

    const fetchActivities = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('activity_log')
            .select(`
                *,
                profiles:user_id (full_name, email),
                posts:post_id (title)
            `)
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (!error) {
            setActivities(data || []);
        }
        setLoading(false);
    };

    const getActivityIcon = (type) => {
        if (type === 'approve') return <CheckCircle size={18} />;
        if (type === 'reject' || type === 'redo') return <AlertCircle size={18} />;
        return <Layout size={18} />;
    };

    const getActivityStyle = (type) => {
        if (type === 'approve') return { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
        if (type === 'reject' || type === 'redo') return { background: 'rgba(239, 68, 68, 0.1)', color: '#ff4d4f' };
        return { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
    };

    if (loading) {
        return <div className="py-10 text-center text-slate-500 font-semibold">Loading activity...</div>;
    }

    return (
        <div className="flex flex-col">
            <div className="mb-6">
                <h2 className="text-slate-900 text-xl font-extrabold m-0 mb-1">Team Activity</h2>
                <p className="text-slate-500 text-sm m-0">Recent actions taken by your team members.</p>
            </div>

            <div className="flex flex-col">
                {activities.length > 0 ? (
                    activities.map((item, idx) => (
                        <div key={idx} className="flex gap-5 py-5 border-b border-slate-200 last:border-b-0">
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={getActivityStyle(item.action_type)}>
                                    {getActivityIcon(item.action_type)}
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-extrabold text-slate-900">
                                    {item.profiles?.full_name || item.profiles?.email || 'Unknown User'}
                                </div>
                                <div className="text-sm text-slate-500 mt-1">
                                    {item.action_text}
                                    <span className="inline-flex items-center py-1 px-2.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 ml-2">{item.posts?.title || 'Untitled'}</span>
                                </div>
                                <div className="text-xs text-slate-500 font-semibold mt-2">
                                    {new Date(item.created_at).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-10 text-center text-slate-500 font-semibold">
                        No activity yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamActivitySettings;
