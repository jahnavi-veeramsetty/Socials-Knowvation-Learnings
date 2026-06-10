import React from 'react';
import { Calendar, ShieldCheck, Clock, FileText, CheckCircle } from 'lucide-react';

const BlogCard = ({ blog, onApprove, onRedo, userRole, currentUserId, orgId, isSelected, onSelect }) => {
    const isCreator = blog.created_by === currentUserId;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateString;
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'published': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', icon: <CheckCircle size={14} /> };
            case 'approved': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', icon: <ShieldCheck size={14} /> };
            case 'pending review': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', icon: <Clock size={14} /> };
            case 'draft': return { bg: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', icon: <FileText size={14} /> };
            default: return { bg: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8' };
        }
    };

    const statusStyle = getStatusStyle(blog.status);

    return (
        <div
            className="bg-white rounded-[20px] p-6 border border-slate-200 shadow-sm transition-all duration-300 ease-in-out flex flex-col gap-4 cursor-pointer relative hover:-translate-y-1 hover:shadow-md hover:border-brand/30"
            onClick={() => window.open(`/org/${orgId}/blogs/create?id=${blog.id}`, '_blank')}
        >
            {/* Top */}
            <div className="flex justify-between items-start">
                <div className="flex gap-2 items-center">
                    {onSelect && (
                        <div
                            className="flex items-center justify-center mr-1"
                            onClick={e => e.stopPropagation()}
                        >
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={onSelect}
                                className="w-[18px] h-[18px] cursor-pointer rounded border-[1.5px] border-slate-300 accent-brand transition-all duration-200"
                            />
                        </div>
                    )}
                    <span className="bg-brand/10 text-brand text-[11px] font-extrabold py-1 px-2.5 rounded-lg uppercase tracking-wide">
                        Blog
                    </span>
                </div>
                <div
                    className="flex items-center gap-1.5 text-[10.5px] font-bold py-1 px-3 rounded-full uppercase tracking-wide"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                >
                    {statusStyle.icon}
                    {blog.status}
                </div>
            </div>

            {/* Body */}
            <div>
                <h3 className="text-base font-extrabold m-0 leading-[1.4] text-slate-900">{blog.title || 'Untitled Blog'}</h3>
                <p className="text-[13px] mt-1.5 mb-0 overflow-hidden leading-[1.6] text-slate-600" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {blog.content || 'No content provided.'}
                </p>
                <div className="text-[11.5px] font-semibold mt-3 text-slate-400">
                    Created by {blog.profiles?.full_name || blog.profiles?.email || 'Unknown'}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-4 flex flex-wrap justify-between items-center gap-3 border-t border-slate-100">
                <div className="flex items-center gap-3 text-slate-500">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <Calendar size={13} />{formatDate(blog.scheduled_date) || 'No Date'}
                    </div>
                </div>

                <div className="flex gap-2">
                    {blog.status === 'pending review' && (userRole === 'owner' || userRole === 'admin') && (
                        <div className="flex gap-2">
                            <button
                                className="py-1.5 px-3.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all duration-200 border-none bg-brand text-white hover:bg-brand-hover shadow-sm hover:shadow"
                                onClick={e => { e.stopPropagation(); onApprove(blog.id); }}
                            >Approve</button>
                            <button
                                className="py-1.5 px-3.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all duration-200 bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white hover:border-red-500"
                                onClick={e => { e.stopPropagation(); onRedo(blog.id); }}
                            >Redo</button>
                        </div>
                    )}
                    <button className="py-1.5 px-4 rounded-lg text-[11px] font-bold cursor-pointer transition-all duration-200 border-none bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900">
                        {isCreator ? 'Edit' : 'View'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;
