import React from 'react';
import { Lock } from 'lucide-react';

const ProfileSettings = ({ email, fullName, setFullName }) => {
    return (
        <div className="settings-section">
            <style>{`
                .section-header {
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
                .settings-card {
                    background: white;
                    border-radius: 20px;
                    padding: 24px;
                    border: 1px solid #f0f0f0;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 6px;
                }
                .form-input {
                    width: 100%;
                    padding: 12px 16px;
                    border-radius: 10px;
                    border: 1.5px solid #eee;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s;
                    box-sizing: border-box;
                }
                .form-input:focus {
                    border-color: #002B72;
                    background: white;
                }
                .danger-zone {
                    margin-top: 32px;
                    padding-top: 24px;
                    border-top: 1px solid #eee;
                }
                .danger-zone h3 {
                    color: #ff4d4f;
                    font-size: 14px;
                    margin-bottom: 12px;
                }
            `}</style>

            <div className="section-header">
                <h2>My Profile</h2>
                <p>Manage your personal information and security.</p>
            </div>

            <div className="settings-card">
                <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                        className="form-input"
                        value={email}
                        disabled
                        style={{ background: '#f7f9fc', color: '#999' }}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                        className="form-input"
                        placeholder="Your Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                </div>

                <div className="danger-zone">
                    <h3>Security</h3>
                    <button className="form-input" style={{ background: 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Lock size={16} />
                        Change Password
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;