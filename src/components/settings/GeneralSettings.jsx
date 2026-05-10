import React from 'react';

const GeneralSettings = ({ orgName, setOrgName }) => {
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
            `}</style>

            <div className="section-header">
                <h2>Organization Settings</h2>
                <p>Manage your organization's core information.</p>
            </div>

            <div className="settings-card">
                <div className="form-group">
                    <label className="form-label">Organization Name</label>
                    <input 
                        className="form-input"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="Organization Name"
                    />
                </div>
            </div>
        </div>
    );
};

export default GeneralSettings;
