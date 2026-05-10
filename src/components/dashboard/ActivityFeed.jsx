import React from 'react';
import { CheckCircle, AlertCircle, Layout } from 'lucide-react';

const ActivityFeed = ({ activities, getActivityStyle, getActivityIcon }) => {
    return (
        <div className="activity-section" style={{ marginTop: '48px' }}>
            <style>{`
                .activity-section {
                    background: white;
                    padding: 32px;
                    border-radius: 32px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 12px rgba(0, 43, 114, 0.03);
                }
                .activity-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    margin-top: 24px;
                }
                .activity-item {
                    display: flex;
                    gap: 20px;
                    padding: 20px 0;
                    border-bottom: 1px solid #f1f5f9;
                }
                .activity-item:last-child {
                    border-bottom: none;
                }
                .activity-marker {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .activity-icon-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .activity-content {
                    flex: 1;
                }
                .activity-user {
                    font-size: 14px;
                    font-weight: 800;
                    color: #002B72;
                }
                .activity-text {
                    font-size: 14px;
                    color: #64748b;
                    margin-top: 4px;
                }
                .activity-time {
                    font-size: 12px;
                    color: #94a3b8;
                    font-weight: 600;
                    margin-top: 8px;
                }
                .activity-post-tag {
                    display: inline-flex;
                    align-items: center;
                    padding: 4px 10px;
                    background: #f1f5f9;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    color: #475569;
                    margin-left: 8px;
                }
            `}</style>

            <div className="section-header" style={{ marginBottom: '0' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#002B72', margin: 0 }}>Team Activity</h2>
            </div>

            <div className="activity-list">
                {activities.length > 0 ? (
                    activities.map((item, idx) => (
                        <div key={idx} className="activity-item">
                            <div className="activity-marker">
                                <div className="activity-icon-circle" style={getActivityStyle(item.action_type)}>
                                    {getActivityIcon(item.action_type)}
                                </div>
                            </div>
                            <div className="activity-content">
                                <div className="activity-user">
                                    {item.profiles?.full_name || item.profiles?.email || 'Unknown User'}
                                </div>
                                <div className="activity-text">
                                    {item.action_text} 
                                    <span className="activity-post-tag">{item.posts?.title || 'Untitled'}</span>
                                </div>
                                <div className="activity-time">
                                    {new Date(item.created_at).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
                        No activity yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;
