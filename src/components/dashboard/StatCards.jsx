import React from 'react';
import { TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

const StatCards = ({ approvedPosts, scheduledThisWeek, pendingReview }) => {
    return (
        <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="bg-light-card p-6 rounded-3xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-500/10 text-blue-400">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <h3 className="m-0 text-sm text-slate-500 font-bold">Approved posts</h3>
                    <div className="text-[28px] font-black text-slate-900 mt-1">{approvedPosts}</div>
                </div>
            </div>

            <div className="bg-light-card p-6 rounded-3xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-400">
                    <CheckCircle size={24} />
                </div>
                <div>
                    <h3 className="m-0 text-sm text-slate-500 font-bold">Scheduled this week</h3>
                    <div className="text-[28px] font-black text-slate-900 mt-1">{scheduledThisWeek}</div>
                </div>
            </div>

            <div className="bg-light-card p-6 rounded-3xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-500/10 text-amber-400">
                    <AlertCircle size={24} />
                </div>
                <div>
                    <h3 className="m-0 text-sm text-slate-500 font-bold">Pending review</h3>
                    <div className="text-[28px] font-black text-slate-900 mt-1">{pendingReview}</div>
                </div>
            </div>
        </div>
    );
};

export default StatCards;
