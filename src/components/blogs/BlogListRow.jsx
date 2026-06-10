import React from 'react';
import { Calendar, ShieldCheck, Clock, FileText, CheckCircle, ChevronRight } from 'lucide-react';

const BlogListRow = ({ blog, onApprove, onRedo, userRole, currentUserId, orgId, isSelected, onSelect }) => {
    const getStatusStyle = (status) => {
        switch (status) {
            case 'published': return { bg: '#f0fdf4', color: '#16a34a', icon: <CheckCircle size={14} /> };
            case 'approved': return { bg: '#eff6ff', color: '#2563eb', icon: <ShieldCheck size={14} /> };
            case 'pending review': return { bg: '#fffbeb', color: '#d97706', icon: <Clock size={14} /> };
            case 'draft': return { bg: '#f1f5f9', color: '#64748b', icon: <FileText size={14} /> };
            default: return { bg: '#f1f5f9', color: '#64748b' };
        }
    };

    const statusStyle = getStatusStyle(blog.status);

    return (
        <div
            className={`bg-white rounded-2xl py-4 px-6 border border-slate-100 grid ${onSelect ? 'grid-cols-[30px_60px_1fr_120px_100px_180px]' : 'grid-cols-[60px_1fr_120px_100px_180px]'} items-center gap-5 transition-all duration-200 cursor-pointer hover:bg-slate-50 hover:border-brand`}
            onClick={() => window.open(`/org/${orgId}/blogs/create?id=${blog.id}`, '_blank')}
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
                <div className="text-xs font-extrabold uppercase text-brand">Blog</div>
            </div>

            <div>
                <h4 className="m-0 text-sm font-bold text-gray-900">{blog.title || 'Untitled Blog'}</h4>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-slate-500 font-semibold">by {blog.profiles?.full_name || blog.profiles?.email || 'Unknown'}</span>
                </div>
            </div>

            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-600">
                <Calendar size={14} color="#94a3b8" />
                {blog.scheduled_date || 'No Date'}
            </div>

            <div
                className="flex items-center gap-1.5 text-[10px] font-bold py-1 px-2.5 rounded-full uppercase w-fit"
                style={{ background: statusStyle.bg, color: statusStyle.color }}
            >
                {statusStyle.icon}
                {blog.status}
            </div>

            <div className="flex justify-end text-slate-600 gap-2">
                {blog.status === 'pending review' && (userRole === 'owner' || userRole === 'admin') ? (
                    <>
                        <button
                            className="py-1.5 px-3 bg-brand text-white border-none rounded-lg text-[11px] font-bold cursor-pointer hover:bg-brand-hover"
                            onClick={e => { e.stopPropagation(); onApprove(blog.id); }}
                        >Approve</button>
                        <button
                            className="py-1.5 px-3 bg-red-50 text-red-400 border border-[#ffccc7] rounded-lg text-[11px] font-bold cursor-pointer hover:bg-red-100"
                            onClick={e => { e.stopPropagation(); onRedo(blog.id); }}
                        >Redo</button>
                    </>
                ) : (
                    <ChevronRight size={18} />
                )}
            </div>
        </div>
    );
};

export default BlogListRow;
