import React from 'react';
import { Calendar, ShieldCheck, Clock, FileText, CheckCircle, ChevronRight } from 'lucide-react';

const PostListRow = ({ post, onApprove, onRedo, userRole, currentUserId, orgId, isSelected, onSelect, brandColors }) => {
    const defaultColors = {
        KLM: '#002B72',
        KLS: '#4f46e5',
        KLC: '#0ea5e9'
    };
    const rowColor = (brandColors && brandColors[post.social_account]) || defaultColors[post.social_account] || '#002B72';

    const getStatusStyle = (status) => {
        switch (status) {
            case 'published': return { bg: '#f0fdf4', color: '#16a34a', icon: <CheckCircle size={14} /> };
            case 'approved': return { bg: '#eff6ff', color: '#2563eb', icon: <ShieldCheck size={14} /> };
            case 'pending review': return { bg: '#fffbeb', color: '#d97706', icon: <Clock size={14} /> };
            case 'draft': return { bg: '#f1f5f9', color: '#64748b', icon: <FileText size={14} /> };
            default: return { bg: '#f1f5f9', color: '#64748b' };
        }
    };

    const statusStyle = getStatusStyle(post.status);

    const PlatformIcon = ({ platform }) => {
        switch (platform.toLowerCase()) {
            case 'instagram': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
            );
            case 'linkedin': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                </svg>
            );
            case 'youtube': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
            );
            default: return null;
        }
    };

    return (
        <div
            className={`bg-white rounded-2xl py-4 px-6 border border-slate-100 grid ${onSelect ? 'grid-cols-[30px_80px_1fr_100px_120px_100px_180px]' : 'grid-cols-[80px_1fr_100px_120px_100px_180px]'} items-center gap-5 transition-all duration-200 cursor-pointer hover:bg-slate-50 hover:border-brand`}
            onClick={() => window.open(`/org/${orgId}/${post.post_type || 'reel'}s/create?id=${post.id}`, '_blank')}
        >
            {onSelect && (
                <div className="flex items-center justify-center" onClick={e => e.stopPropagation()}>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={onSelect}
                        className="w-[18px] h-[18px] cursor-pointer rounded border-[1.5px] border-slate-300 accent-brand transition-all duration-200"
                    />
                </div>
            )}
            <div className="flex flex-col gap-1">
                <div className="text-xs font-extrabold uppercase" style={{ color: rowColor }}>{post.social_account}</div>
                {post.post_type && (
                    <div className="text-[10px] font-extrabold py-0.5 px-1.5 rounded bg-slate-100 text-slate-500 uppercase w-fit">{post.post_type}</div>
                )}
            </div>

            <div>
                <h4 className="m-0 text-sm font-bold text-gray-900">{post.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-slate-500 font-semibold">by {post.profiles?.full_name || post.profiles?.email || 'Unknown'}</span>
                </div>
            </div>

            <div className="flex gap-2 text-slate-500">
                {post.platforms.map((p, i) => <PlatformIcon key={i} platform={p} />)}
            </div>

            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-600">
                <Calendar size={14} color="#94a3b8" />
                {post.scheduled_date}
            </div>

            <div
                className="flex items-center gap-1.5 text-[10px] font-bold py-1 px-2.5 rounded-full uppercase w-fit"
                style={{ background: statusStyle.bg, color: statusStyle.color }}
            >
                {statusStyle.icon}
                {post.status}
            </div>

            <div className="flex justify-end text-slate-600 gap-2">
                {post.status === 'pending review' && (userRole === 'owner' || userRole === 'admin') ? (
                    <>
                        <button
                            className="py-1.5 px-3 bg-brand text-white border-none rounded-lg text-[11px] font-bold cursor-pointer hover:bg-brand-hover"
                            onClick={e => { e.stopPropagation(); onApprove(post.id); }}
                        >Approve</button>
                        <button
                            className="py-1.5 px-3 bg-red-50 text-red-400 border border-[#ffccc7] rounded-lg text-[11px] font-bold cursor-pointer hover:bg-red-100"
                            onClick={e => { e.stopPropagation(); onRedo(post.id); }}
                        >Redo</button>
                    </>
                ) : (
                    <ChevronRight size={18} />
                )}
            </div>
        </div>
    );
};

export default PostListRow;
