import React from 'react';
import { TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

const StatCards = ({ postsThisMonth, scheduledThisWeek, pendingReview }) => {
    return (
        <div className="stats-grid">
            <style>{`
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    margin-bottom: 40px;
                }
                .stat-card {
                    background: #0a1936;
                    padding: 24px;
                    border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .stat-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .stat-info h3 {
                    margin: 0;
                    font-size: 14px;
                    color: #94a3b8;
                    font-weight: 700;
                }
                .stat-info .value {
                    font-size: 28px;
                    font-weight: 900;
                    color: #ffffff;
                    margin-top: 4px;
                }
            `}</style>

            <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                    <TrendingUp size={24} />
                </div>
                <div className="stat-info">
                    <h3>Posts this month</h3>
                    <div className="value">{postsThisMonth}</div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <CheckCircle size={24} />
                </div>
                <div className="stat-info">
                    <h3>Scheduled this week</h3>
                    <div className="value">{scheduledThisWeek}</div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                    <AlertCircle size={24} />
                </div>
                <div className="stat-info">
                    <h3>Pending review</h3>
                    <div className="value">{pendingReview}</div>
                </div>
            </div>
        </div>
    );
};

export default StatCards;
