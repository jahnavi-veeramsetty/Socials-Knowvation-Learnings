import React from 'react';
import { Calendar, ShieldCheck, Clock, FileText, CheckCircle, ChevronRight } from 'lucide-react';

const PostListRow = ({ post, onApprove, onReject, userRole, currentUserId, orgId }) => {
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
        <div className="post-list-row" onClick={() => window.open(`/org/${orgId}/posts/create?id=${post.id}`, '_blank')}>
            <style>{`
                .post-list-row {
                    background: white;
                    border-radius: 16px;
                    padding: 16px 24px;
                    border: 1px solid #f1f5f9;
                    display: grid;
                    grid-template-columns: 80px 1fr 100px 120px 100px 180px;
                    align-items: center;
                    gap: 20px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                .post-list-row:hover {
                    background: #f8fafc;
                    border-color: #002B72;
                }
                .social-acc {
                    font-size: 12px;
                    font-weight: 800;
                    color: #002B72;
                    text-transform: uppercase;
                }
                .social-acc-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .type-badge {
                    font-size: 10px;
                    font-weight: 800;
                    padding: 2px 6px;
                    border-radius: 4px;
                    background: #f1f5f9;
                    color: #64748b;
                    text-transform: uppercase;
                    width: fit-content;
                }
                .post-info h4 {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 700;
                    color: #111;
                }
                .post-meta-small {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 4px;
                }
                .creator-tag {
                    font-size: 11px;
                    color: #94a3b8;
                    font-weight: 600;
                }
                .platforms-cell {
                    display: flex;
                    gap: 8px;
                    color: #94a3b8;
                }
                .date-cell {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #475569;
                }
                .status-cell {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 10px;
                    font-weight: 700;
                    padding: 4px 10px;
                    border-radius: 999px;
                    text-transform: uppercase;
                    width: fit-content;
                }
                .action-cell {
                    display: flex;
                    justify-content: flex-end;
                    color: #cbd5e1;
                    gap: 8px;
                }
                .row-approve-btn {
                    padding: 6px 12px;
                    background: #002B72;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                }
                .row-reject-btn {
                    padding: 6px 12px;
                    background: #fff1f0;
                    color: #ff4d4f;
                    border: 1px solid #ffccc7;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                }
            `}</style>

            <div className="social-acc-group">
                <div className="social-acc">{post.social_account}</div>
                {post.post_type && (
                    <div className="type-badge">{post.post_type}</div>
                )}
            </div>
            
            <div className="post-info">
                <h4>{post.title}</h4>
                <div className="post-meta-small">
                    <span className="creator-tag">by {post.profiles?.full_name || post.profiles?.email || 'Unknown'}</span>
                </div>
            </div>

            <div className="platforms-cell">
                {post.platforms.map((p, i) => <PlatformIcon key={i} platform={p} />)}
            </div>

            <div className="date-cell">
                <Calendar size={14} color="#94a3b8" />
                {post.scheduled_date}
            </div>

            <div 
                className="status-cell"
                style={{ background: statusStyle.bg, color: statusStyle.color }}
            >
                {statusStyle.icon}
                {post.status}
            </div>

            <div className="action-cell">
                {post.status === 'pending review' && (userRole === 'owner' || userRole === 'admin') ? (
                    <>
                        <button 
                            className="row-approve-btn"
                            onClick={(e) => { e.stopPropagation(); onApprove(post.id); }}
                        >
                            Approve
                        </button>
                        <button 
                            className="row-reject-btn"
                            onClick={(e) => { e.stopPropagation(); onReject(post.id); }}
                        >
                            Reject
                        </button>
                    </>
                ) : (
                    <ChevronRight size={18} />
                )}
            </div>
        </div>
    );
};

export default PostListRow;
