import React from 'react';
import { CheckCircle, AlertCircle, Layout } from 'lucide-react';

const ActivityFeed = ({ activities, getActivityStyle, getActivityIcon }) => {
    return (
        <div className="mt-12 bg-light-card p-8 rounded-[32px] border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
            <h2 className="text-xl font-extrabold text-slate-900 m-0">Team Activity</h2>

            <div className="flex flex-col mt-6">
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

export default ActivityFeed;
