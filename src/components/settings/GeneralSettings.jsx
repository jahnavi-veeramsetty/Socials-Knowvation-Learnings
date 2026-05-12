import React from 'react';

const GeneralSettings = ({ orgName, setOrgName, readOnly = false }) => {
    return (
        <div className="settings-section">
            <style>{`
                .section-header {
                    margin-bottom: 24px;
                }
                .section-header h2 {
                    color: #ffffff;
                    font-size: 20px;
                    font-weight: 800;
                    margin: 0 0 4px;
                }
                .section-header p {
                    color: #64748b;
                    font-size: 14px;
                }
                .readonly-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(59, 130, 246, 0.1);
                    color: #3b82f6;
                    padding: 4px 10px;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .settings-card {
                    background: #0a1936;
                    border-radius: 20px;
                    padding: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    color: #cbd5e1;
                    margin-bottom: 6px;
                }
                .form-input {
                    width: 100%;
                    padding: 12px 16px;
                    border-radius: 10px;
                    border: 1.5px solid rgba(255, 255, 255, 0.05);
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s;
                    box-sizing: border-box;
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }
                .form-input:focus {
                    border-color: #002B72;
                    background: rgba(255, 255, 255, 0.08);
                }
            `}</style>

            <div className="section-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2>Organization Settings</h2>
                    {readOnly && <span className="readonly-badge">View Only</span>}
                </div>
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
                        disabled={readOnly}
                        style={readOnly ? { background: 'rgba(255, 255, 255, 0.02)', color: '#64748b' } : {}}
                    />
                </div>
            </div>
        </div>
    );
};

export default GeneralSettings;
