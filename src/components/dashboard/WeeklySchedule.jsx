import React from 'react';
import { Calendar as CalendarIcon, Film, Layers, Smartphone, Layout } from 'lucide-react';

const WeeklySchedule = ({ weekDays, today, getPostsForDate, brandColors, orgId }) => {
    const getIcon = (type) => {
        const t = type?.toLowerCase() || '';
        if (t.includes('reel')) return <Film size={14} />;
        if (t.includes('carousel')) return <Layers size={14} />;
        if (t.includes('story')) return <Smartphone size={14} />;
        return <Layout size={14} />;
    };

    return (
        <div className="weekly-schedule-section">
            <style>{`
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .section-header h2 {
                    font-size: 20px;
                    font-weight: 800;
                    color: #002B72;
                    margin: 0;
                }
                .weekly-view {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 16px;
                }
                .week-day-card {
                    background: white;
                    border-radius: 20px;
                    border: 1px solid #e2e8f0;
                    min-height: 200px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    transition: all 0.2s;
                }
                .week-day-card:hover {
                    border-color: #cbd5e1;
                    box-shadow: 0 10px 20px rgba(0, 43, 114, 0.04);
                }
                .day-header {
                    padding: 12px;
                    background: #fbfcfd;
                    border-bottom: 1px solid #f1f5f9;
                    text-align: center;
                }
                .day-name {
                    font-size: 11px;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .day-number {
                    font-size: 18px;
                    font-weight: 900;
                    color: #002B72;
                    margin-top: 2px;
                }
                .day-number.is-today {
                    color: #3b82f6;
                }
                .day-content {
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    flex: 1;
                }
                .post-pill {
                    padding: 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    border: 1px solid transparent;
                    cursor: pointer;
                }
                .post-pill span {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #cbd5e1;
                    gap: 8px;
                    opacity: 0.5;
                }
            `}</style>

            <div className="section-header">
                <h2>Weekly Schedule</h2>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>
                    {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
            </div>

            <div className="weekly-view">
                {weekDays.map((date, i) => {
                    const dayPosts = getPostsForDate(date);
                    const isToday = date.toDateString() === today.toDateString();
                    
                    return (
                        <div key={i} className="week-day-card">
                            <div className="day-header">
                                <div className="day-name">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                <div className={`day-number ${isToday ? 'is-today' : ''}`}>{date.getDate()}</div>
                            </div>
                            <div className="day-content">
                                {dayPosts.length > 0 ? (
                                    dayPosts.map(post => {
                                        const color = brandColors[post.social_account] || '#002B72';
                                        return (
                                            <div 
                                                key={post.id} 
                                                className="post-pill"
                                                style={{ 
                                                    background: `${color}10`,
                                                    borderColor: `${color}30`,
                                                    color: color
                                                }}
                                                title={post.title}
                                                onClick={() => window.open(`/org/${orgId}/posts/create?id=${post.id}`, '_blank')}
                                            >
                                                {getIcon(post.post_type)}
                                                <span>{post.title || 'Untitled'}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="empty-state">
                                        <CalendarIcon size={16} />
                                        <span style={{ fontSize: '10px', fontWeight: 700 }}>Free</span>
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

export default WeeklySchedule;
