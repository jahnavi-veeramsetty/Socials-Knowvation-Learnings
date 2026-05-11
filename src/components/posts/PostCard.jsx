import React from 'react';
import { Calendar, MessageSquare, ExternalLink, ShieldCheck, Clock, FileText, CheckCircle } from 'lucide-react';

const PostCard = ({ post, onApprove, onReject, userRole, currentUserId, orgId }) => {
    const isCreator = post.created_by === currentUserId;

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

    return (
        <div className="post-card" onClick={() => window.open(`/org/${orgId}/posts/create?id=${post.id}`, '_blank')}>
            <style>{`
                .post-card {
                    background: #0a1936;
                    border-radius: 20px;
                    padding: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    cursor: pointer;
                    position: relative;
                }
                .post-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
                    border-color: #002B72;
                }
                .card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .social-badge {
                    font-size: 11px;
                    font-weight: 800;
                    padding: 4px 8px;
                    border-radius: 6px;
                    background: rgba(0, 43, 114, 0.3);
                    color: white;
                    text-transform: uppercase;
                }
                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 10px;
                    font-weight: 700;
                    padding: 4px 10px;
                    border-radius: 999px;
                    text-transform: uppercase;
                }
                .post-title {
                    font-size: 16px;
                    font-weight: 800;
                    color: #ffffff;
                    margin: 0;
                    line-height: 1.4;
                }
                .post-caption {
                    font-size: 13px;
                    color: #94a3b8;
                    margin: 4px 0 0;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    line-height: 1.5;
                }
                .creator-info {
                    font-size: 11px;
                    color: #64748b;
                    font-weight: 600;
                    margin-top: 8px;
                }
                .card-footer {
                    margin-top: auto;
                    padding-top: 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .meta-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #64748b;
                }
                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 12px;
                    font-weight: 600;
                }
                .platforms-row {
                    display: flex;
                    gap: 6px;
                }
                .action-btns {
                    display: flex;
                    gap: 8px;
                }
                .approve-btn, .edit-btn {
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }
                .approve-btn {
                    background: #002B72;
                    color: white;
                }
                .approve-btn:hover { background: #001f54; }
                .reject-btn {
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: rgba(239, 68, 68, 0.1);
                    color: #ff4d4f;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                }
                .reject-btn:hover {
                    background: #ff4d4f;
                    color: white;
                }
                .edit-btn {
                    background: rgba(255, 255, 255, 0.05);
                    color: #cbd5e1;
                }
                .edit-btn:hover { background: rgba(255, 255, 255, 0.1); color: white; }
            `}</style>

            <div className="card-top">
                <span className="social-badge">{post.social_account}</span>
                <div
                    className="status-badge"
                    style={{ background: statusStyle.bg, color: statusStyle.icon ? statusStyle.color : '#64748b' }}
                >
                    {statusStyle.icon}
                    {post.status}
                </div>
            </div>

            <div className="card-body">
                <h3 className="post-title">{post.title}</h3>
                <p className="post-caption">{post.caption}</p>
                <div className="creator-info">
                    Created by {post.profiles?.full_name || post.profiles?.email || 'Unknown'}
                </div>
            </div>

            <div className="card-footer">
                <div className="meta-group">
                    <div className="platforms-row">
                        {post.platforms.map((p, i) => <PlatformIcon key={i} platform={p} />)}
                    </div>
                    <div className="meta-item">
                        <Calendar size={12} />
                        {post.scheduled_date}
                    </div>
                </div>

                <div className="action-btns">

                    {post.status === 'pending review' &&
                        (
                            userRole === 'owner' ||
                            userRole === 'admin'
                        ) && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    className="approve-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onApprove(post.id);
                                    }}
                                >
                                    Approve
                                </button>
                                <button
                                    className="reject-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onReject(post.id);
                                    }}
                                >
                                    Reject
                                </button>
                            </div>
                        )}

                    <button className="edit-btn">
                        {isCreator ? 'Edit' : 'View'}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default PostCard;
