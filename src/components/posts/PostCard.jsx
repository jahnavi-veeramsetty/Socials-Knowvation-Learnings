import React from 'react';
import { Calendar, MessageSquare, ExternalLink, ShieldCheck, Clock, FileText, CheckCircle } from 'lucide-react';

const PostCard = ({ post, onApprove, onReject, userRole, currentUserId, orgId, isSelected, onSelect, brandColors }) => {
    const isCreator = post.created_by === currentUserId;

    const defaultColors = {
        KLM: '#002B72',
        KLS: '#4f46e5',
        KLC: '#0ea5e9'
    };
    const cardColor = (brandColors && brandColors[post.social_account]) || defaultColors[post.social_account] || '#e2e8f0';

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
            case 'approved': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', icon: <ShieldCheck size={14} /> };
            case 'pending review': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', icon: <Clock size={14} /> };
            case 'draft': return { bg: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', icon: <FileText size={14} /> };
            default: return { bg: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8' };
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

    const getBrightness = (hex) => {
        if (!hex) return 255;
        let c = hex.replace('#', '');
        if (c.length === 3) c = c.split('').map(char => char + char).join('');
        if (c.length > 6) c = c.substring(0, 6);
        const r = parseInt(c.substring(0, 2), 16);
        const g = parseInt(c.substring(2, 4), 16);
        const b = parseInt(c.substring(4, 6), 16);
        return (r * 299 + g * 587 + b * 114) / 1000;
    };

    const isLight = getBrightness(cardColor) > 140;
    const textColor = isLight ? '#0f172a' : '#ffffff';
    const textMutedColor = isLight ? '#64748b' : 'rgba(255,255,255,0.75)';
    const textMutedLightColor = isLight ? '#94a3b8' : 'rgba(255,255,255,0.5)';
    const tagBg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)';
    const tagTextColor = isLight ? '#475569' : '#ffffff';
    const borderCol = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)';

    return (
        <div
            className="rounded-[20px] p-6 transition-all duration-300 ease-in-out flex flex-col gap-4 cursor-pointer relative hover:-translate-y-1"
            style={{ 
                background: `linear-gradient(135deg, ${cardColor}e6 0%, ${cardColor}b3 100%)`,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${borderCol}`,
                boxShadow: `0 10px 30px -10px ${cardColor}80, inset 0 0 0 1px rgba(255, 255, 255, 0.2)`
            }}
            onClick={() => window.open(`/org/${orgId}/posts/create?id=${post.id}`, '_blank')}
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
                    <span className="text-[11px] font-extrabold py-1 px-2 rounded-[6px] uppercase" style={{ background: isLight ? `${cardColor}30` : 'rgba(255,255,255,0.2)', color: textColor }}>{post.social_account}</span>
                    {post.post_type && <span className="text-[11px] font-extrabold py-1 px-2 rounded-[6px] uppercase" style={{ background: tagBg, color: tagTextColor }}>{post.post_type}</span>}
                </div>
                <div
                    className="flex items-center gap-1.5 text-[10px] font-bold py-1 px-2.5 rounded-full uppercase"
                    style={{ background: isLight ? statusStyle.bg : 'rgba(255,255,255,0.15)', color: isLight ? (statusStyle.icon ? statusStyle.color : '#64748b') : '#ffffff' }}
                >
                    {statusStyle.icon}
                    {post.status}
                </div>
            </div>

            {/* Body */}
            <div>
                <h3 className="text-base font-extrabold m-0 leading-[1.4]" style={{ color: textColor }}>{post.title}</h3>
                <p className="text-[13px] mt-1 mb-0 overflow-hidden leading-[1.5]" style={{ color: textMutedColor, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{post.caption}</p>
                <div className="text-[11px] font-semibold mt-2" style={{ color: textMutedLightColor }}>
                    Created by {post.profiles?.full_name || post.profiles?.email || 'Unknown'}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-4 flex justify-between items-center" style={{ borderTop: `1px solid ${borderCol}` }}>
                <div className="flex items-center gap-3" style={{ color: textMutedColor }}>
                    <div className="flex gap-1.5">{post.platforms.map((p, i) => <PlatformIcon key={i} platform={p} />)}</div>
                    <div className="flex items-center gap-1 text-xs font-semibold">
                        <Calendar size={12} />{formatDate(post.scheduled_date)}
                    </div>
                </div>

                <div className="flex gap-2">
                    {post.status === 'pending review' && (userRole === 'owner' || userRole === 'admin') && (
                        <div className="flex gap-2">
                            <button
                                className="py-1.5 px-3 rounded-lg text-[11px] font-bold cursor-pointer transition-all duration-200 border-none bg-brand text-white hover:bg-brand-hover"
                                onClick={e => { e.stopPropagation(); onApprove(post.id); }}
                            >Approve</button>
                            <button
                                className="py-1.5 px-3 rounded-lg text-[11px] font-bold cursor-pointer transition-all duration-200 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white"
                                onClick={e => { e.stopPropagation(); onReject(post.id); }}
                            >Reject</button>
                        </div>
                    )}
                    <button className="py-1.5 px-3 rounded-lg text-[11px] font-bold cursor-pointer transition-all duration-200 border-none" style={{ background: tagBg, color: tagTextColor }}>
                        {isCreator ? 'Edit' : 'View'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
