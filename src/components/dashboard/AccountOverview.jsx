import React from 'react';
import { Film, Layers, Smartphone, Layout, Clock } from 'lucide-react';

const AccountOverview = ({ posts, brandColors, today, weekRange, orgId }) => {
    const getIcon = (type) => {
        const t = type?.toLowerCase() || '';
        if (t.includes('reel')) return <Film size={14} />;
        if (t.includes('carousel')) return <Layers size={14} />;
        if (t.includes('story')) return <Smartphone size={14} />;
        return <Layout size={14} />;
    };

    return (
        <div className="account-overview-section" style={{ marginTop: '48px' }}>
            <style>{`
                .section-header h2 {
                    font-size: 20px;
                    font-weight: 800;
                    color: #ffffff;
                    margin-bottom: 24px;
                }
                .accounts-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                }
                .account-card {
                    background: #0a1936;
                    padding: 24px;
                    border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                    display: flex;
                    flex-direction: column;
                }
                .account-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                .account-color {
                    width: 12px;
                    height: 12px;
                    border-radius: 4px;
                }
                .account-header h4 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 800;
                    color: #ffffff;
                }
                .account-stats-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }
                .account-stat-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #94a3b8;
                }
                .account-stat-value {
                    font-size: 14px;
                    font-weight: 800;
                    color: #ffffff;
                }
                .upcoming-posts {
                    margin-top: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .upcoming-title {
                    font-size: 11px;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                }
                .mini-post-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #cbd5e1;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    transition: all 0.2s;
                }
                .mini-post-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }
                .mini-post-date {
                    font-size: 10px;
                    color: #64748b;
                    margin-left: auto;
                }
            `}</style>

            <div className="section-header">
                <h2>Account Overview</h2>
            </div>

            <div className="accounts-grid">
                {['KLM', 'KLS', 'KLC'].map(acc => {
                    const color = brandColors[acc] || '#002B72';
                    const name = acc === 'KLM' ? 'KL Main' : acc === 'KLS' ? 'KL Select' : 'KL Community';
                    
                    const accPostsMonth = posts.filter(p => {
                        if (!p.scheduled_date) return false;
                        const d = new Date(p.scheduled_date);
                        return p.social_account === acc && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
                    }).length;

                    const accPostsWeek = posts.filter(p => {
                        if (!p.scheduled_date) return false;
                        const d = new Date(p.scheduled_date);
                        return p.social_account === acc && d >= weekRange.start && d <= weekRange.end;
                    }).length;

                    // Get next 3 upcoming approved posts
                    const upcomingPosts = posts
                        .filter(p => p.social_account === acc && p.status === 'approved' && new Date(p.scheduled_date) >= today)
                        .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
                        .slice(0, 3);

                    return (
                        <div key={acc} className="account-card">
                            <div className="account-header">
                                <div className="account-color" style={{ background: color }}></div>
                                <h4>{name}</h4>
                            </div>
                            <div className="account-stats-row">
                                <span className="account-stat-label">This Month</span>
                                <span className="account-stat-value">{accPostsMonth} posts</span>
                            </div>
                            <div className="account-stats-row">
                                <span className="account-stat-label">This Week</span>
                                <span className="account-stat-value">{accPostsWeek} posts</span>
                            </div>

                            <div className="upcoming-posts">
                                <div className="upcoming-title">Upcoming Content</div>
                                {upcomingPosts.length > 0 ? (
                                    upcomingPosts.map(post => (
                                        <div key={post.id} className="mini-post-item" onClick={() => window.open(`/org/${orgId}/posts/create?id=${post.id}`, '_blank')} style={{ cursor: 'pointer' }}>
                                            {getIcon(post.post_type)}
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>
                                                {post.title || 'Untitled'}
                                            </span>
                                            <span className="mini-post-date">
                                                {new Date(post.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ fontSize: '11px', color: '#cbd5e1', fontStyle: 'italic', padding: '8px' }}>
                                        No upcoming posts
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AccountOverview;
