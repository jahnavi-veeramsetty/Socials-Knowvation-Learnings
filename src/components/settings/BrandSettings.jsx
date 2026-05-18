import React, { useState } from 'react';
import { Palette, Pipette } from 'lucide-react';
import { HexColorPicker } from "react-colorful";

const BrandSettings = ({ brandColors, setBrandColors, readOnly = false }) => {
    const [activeTab, setActiveTab] = useState('KLM');

    const accounts = [
        { id: 'KLM', name: 'KL Main (KLM)' },
        { id: 'KLS', name: 'KL Select (KLS)' },
        { id: 'KLC', name: 'KL Community (KLC)' }
    ];

    const handleColorChange = (color) => {
        setBrandColors({
            ...brandColors,
            [activeTab]: color
        });
    };

    return (
        <div className="canva-brand-settings">
            <style>{`
                .canva-brand-settings {
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                    padding: 20px 0;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .section-header h2 {
                    font-size: 18px;
                    font-weight: 800;
                    color: #ffffff;
                    margin: 0;
                }

                .section-header p {
                    font-size: 14px;
                    color: #64748b;
                    margin: 4px 0 0;
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

                .brand-settings-content {
                    display: flex;
                    gap: 32px;
                    align-items: flex-start;
                }

                @media (max-width: 700px) {
                    .brand-settings-content {
                        flex-direction: column;
                    }
                    .picker-container {
                        margin: 0 auto;
                        width: 100%;
                    }
                }

                .picker-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: #0a1936;
                    padding: 24px;
                    border-radius: 20px;
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    width: 320px;
                    flex-shrink: 0;
                }

                /* Customizing react-colorful */
                .react-colorful {
                    width: 100% !important;
                    height: 180px !important;
                }

                .react-colorful__saturation {
                    flex-grow: 1;
                    border-radius: 8px 8px 0 0 !important;
                    border-bottom: none !important;
                    background-image: linear-gradient(transparent, #000), linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
                }

                .react-colorful__hue {
                    height: 16px !important;
                    border-radius: 8px !important;
                    margin-top: 16px;
                    background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
                }
                
                .react-colorful__pointer {
                    width: 24px !important;
                    height: 24px !important;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
                }

                .bottom-controls {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    margin-top: 20px;
                }
                
                .hex-input-wrapper {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 8px 12px;
                    background: rgba(255, 255, 255, 0.05);
                }
                
                .color-preview-circle {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    flex-shrink: 0;
                }
                
                .hex-input-field {
                    border: none;
                    outline: none;
                    font-family: 'Inter', sans-serif;
                    font-weight: 600;
                    color: #ffffff;
                    width: 100%;
                    text-transform: uppercase;
                    font-size: 14px;
                    background: transparent;
                }
                
                .hex-input-field::selection {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                }
                
                .eyedropper-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 38px;
                    height: 38px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    color: #94a3b8;
                    cursor: pointer;
                    flex-shrink: 0;
                    transition: all 0.2s;
                }

                .eyedropper-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #ffffff;
                }

                .account-cards-row {
                    flex: 1;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
                    gap: 16px;
                }

                .account-color-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    padding: 24px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 24px;
                    border: 2px solid transparent;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .account-color-card:hover {
                    background: rgba(255, 255, 255, 0.05);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
                    border-color: rgba(255, 255, 255, 0.05);
                }

                .account-color-card.active {
                    background: rgba(0, 43, 114, 0.2);
                    border-color: #002B72;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
                    transform: translateY(-4px);
                }

                .preview-circle {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    border: 4px solid #0a1936;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    transition: transform 0.3s;
                }

                .active .preview-circle {
                    transform: scale(1.1);
                }

                .card-meta {
                    text-align: center;
                }

                .card-meta strong {
                    display: block;
                    font-size: 15px;
                    color: #ffffff;
                    margin-bottom: 2px;
                }

                .card-meta span {
                    font-size: 12px;
                    color: #64748b;
                    font-weight: 600;
                }
            `}</style>

            <div className="section-header">
                <Palette size={22} color="#002B72" />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h2>Brand Colors</h2>
                        <p>Select a card below, then use the color picker to set its color.</p>
                    </div>
                    {readOnly && <span className="readonly-badge">View Only</span>}
                </div>
            </div>

            <div className="brand-settings-content">
                <div className="picker-container">
                    <div style={{ width: '100%', ...(readOnly ? { pointerEvents: 'none', opacity: 0.6 } : {}) }}>
                        <HexColorPicker
                            color={brandColors[activeTab] || '#002B72'}
                            onChange={handleColorChange}
                        />
                    </div>

                    <div className="bottom-controls" style={readOnly ? { opacity: 0.6 } : {}}>
                        <div className="hex-input-wrapper">
                            <div className="color-preview-circle" style={{ background: brandColors[activeTab] || '#002B72' }} />
                            <input
                                className="hex-input-field"
                                value={brandColors[activeTab] || '#002B72'}
                                onChange={(e) => {
                                    let val = e.target.value;
                                    if (!val.startsWith('#') && val.length > 0) val = '#' + val;
                                    handleColorChange(val);
                                }}
                                placeholder="#FFFFFF"
                                disabled={readOnly}
                            />
                        </div>
                        <button className="eyedropper-btn" disabled={readOnly}>
                            <Pipette size={18} />
                        </button>
                    </div>
                </div>

                <div className="account-cards-row">
                    {accounts.map(acc => (
                        <div
                            key={acc.id}
                            className={`account-color-card ${activeTab === acc.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(acc.id)}
                        >
                            <div
                                className="preview-circle"
                                style={{ background: brandColors[acc.id] || '#002B72' }}
                            />
                            <div className="card-meta">
                                <strong>{acc.id}</strong>
                                <span>{acc.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BrandSettings;
