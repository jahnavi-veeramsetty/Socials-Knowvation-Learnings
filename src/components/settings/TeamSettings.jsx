import React from 'react';
import { Users, UserPlus, Shield } from 'lucide-react';

const TeamSettings = ({ members }) => {
    return (
        <div className="settings-section">
            <style>{`
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 24px;
                }
                .section-header h2 {
                    color: #002B72;
                    font-size: 20px;
                    font-weight: 800;
                    margin: 0 0 4px;
                }
                .section-header p {
                    color: #666;
                    font-size: 14px;
                }
                .invite-btn {
                    background: rgba(0, 43, 114, 0.08);
                    color: #002B72;
                    padding: 8px 16px;
                    border-radius: 10px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    border: none;
                    cursor: pointer;
                    font-size: 13px;
                }
                .member-list {
                    background: white;
                    border-radius: 20px;
                    border: 1px solid #f0f0f0;
                    overflow: hidden;
                }
                .member-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    border-bottom: 1px solid #f9fafb;
                }
                .member-item:last-child {
                    border-bottom: none;
                }
                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .user-avatar {
                    width: 36px;
                    height: 36px;
                    background: #f0f4ff;
                    color: #002B72;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .user-details h4 {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 700;
                    color: #111;
                }
                .user-details p {
                    margin: 0;
                    font-size: 12px;
                    color: #777;
                }
                .role-badge {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: #f1f5f9;
                    color: #475569;
                    padding: 4px 10px;
                    border-radius: 999px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: capitalize;
                }
                .role-badge.owner {
                    background: #fef3c7;
                    color: #92400e;
                }
            `}</style>

            <div className="section-header">
                <div>
                    <h2>Team Members</h2>
                    <p>Manage who has access to this organization.</p>
                </div>
                <button className="invite-btn">
                    <UserPlus size={16} />
                    Invite
                </button>
            </div>

            <div className="member-list">
                {members.map((member, i) => (
                    <div key={i} className="member-item">
                        <div className="user-info">
                            <div className="user-avatar">
                                <Users size={18} />
                            </div>
                            <div className="user-details">
                                <h4>{member.full_name || `Member ${i + 1}`}</h4>
                                <p>{member.email}</p>
                            </div>
                        </div>
                        <div className={`role-badge ${member.role}`}>
                            <Shield size={10} />
                            {member.role}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamSettings;
