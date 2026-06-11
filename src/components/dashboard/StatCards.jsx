import React from 'react';
import { TrendingUp, CheckCircle, AlertCircle, Layers, Film, BookOpen } from 'lucide-react';

const StatCards = ({ approvedCarousels, scheduledCarouselsThisWeek, pendingCarousels, approvedReels, scheduledReelsThisWeek, pendingReels, approvedBlogs, scheduledBlogsThisWeek, pendingBlogs }) => {
    const totalApproved = approvedCarousels + approvedReels + approvedBlogs;
    const totalScheduled = scheduledCarouselsThisWeek + scheduledReelsThisWeek + scheduledBlogsThisWeek;
    const totalPending = pendingCarousels + pendingReels + pendingBlogs;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Approved Card */}
            <div className="bg-light-card p-6 rounded-3xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col gap-4 transition-all hover:shadow-md hover:-translate-y-1">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                    <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center bg-blue-500/10 text-blue-400">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 className="m-0 text-sm text-slate-500 font-bold">Approved</h3>
                        <div className="text-2xl font-black text-slate-900 leading-none mt-1">{totalApproved}</div>
                    </div>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-1.5" title="Carousels"><Layers size={14} className="text-blue-400" /> {approvedCarousels}</div>
                    <div className="flex items-center gap-1.5" title="Reels"><Film size={14} className="text-purple-400" /> {approvedReels}</div>
                    <div className="flex items-center gap-1.5" title="Blogs"><BookOpen size={14} className="text-indigo-400" /> {approvedBlogs}</div>
                </div>
            </div>

            {/* Scheduled Card */}
            <div className="bg-light-card p-6 rounded-3xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col gap-4 transition-all hover:shadow-md hover:-translate-y-1">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                    <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-400">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <h3 className="m-0 text-sm text-slate-500 font-bold">This Week</h3>
                        <div className="text-2xl font-black text-slate-900 leading-none mt-1">{totalScheduled}</div>
                    </div>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-1.5" title="Carousels"><Layers size={14} className="text-emerald-400" /> {scheduledCarouselsThisWeek}</div>
                    <div className="flex items-center gap-1.5" title="Reels"><Film size={14} className="text-emerald-400" /> {scheduledReelsThisWeek}</div>
                    <div className="flex items-center gap-1.5" title="Blogs"><BookOpen size={14} className="text-emerald-400" /> {scheduledBlogsThisWeek}</div>
                </div>
            </div>

            {/* Pending Card */}
            <div className="bg-light-card p-6 rounded-3xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col gap-4 transition-all hover:shadow-md hover:-translate-y-1">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                    <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center bg-amber-500/10 text-amber-400">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h3 className="m-0 text-sm text-slate-500 font-bold">Pending Review</h3>
                        <div className="text-2xl font-black text-slate-900 leading-none mt-1">{totalPending}</div>
                    </div>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-1.5" title="Carousels"><Layers size={14} className="text-amber-400" /> {pendingCarousels}</div>
                    <div className="flex items-center gap-1.5" title="Reels"><Film size={14} className="text-amber-400" /> {pendingReels}</div>
                    <div className="flex items-center gap-1.5" title="Blogs"><BookOpen size={14} className="text-amber-400" /> {pendingBlogs}</div>
                </div>
            </div>
        </div>
    );
};

export default StatCards;
