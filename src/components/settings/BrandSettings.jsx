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

                .picker-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                    background: #0a1936;
                    padding: 40px;
                    border-radius: 32px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                }

                /* Customizing react-colorful */
                .react-colorful {
                    width: 100% !important;
                    max-width: 400px;
                    height: 240px !important;
                    border-radius: 16px;
                }

                .react-colorful__saturation {
                    border-bottom: 12px solid #0a1936;
                    border-radius: 12px 12px 0 0;
                }

                .react-colorful__hue {
                    height: 14px !important;
                    border-radius: 10px;
                }

                .hex-input-section {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 10px 20px;
                    border-radius: 14px;
                    border: 1.5px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    width: 200px;
                }

                .hex-input-section span {
                    font-weight: 800;
                    color: #64748b;
                }

                .hex-input-field {
                    border: none;
                    outline: none;
                    font-family: 'Inter', sans-serif;
                    font-weight: 700;
                    color: #ffffff;
                    width: 100%;
                    text-transform: uppercase;
                    font-size: 15px;
                    background: transparent;
                }

                .account-cards-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
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
                        <p>Select a card below, then use the Canva-style picker to set its color.</p>
                    </div>
                    {readOnly && <span className="readonly-badge">View Only</span>}
                </div>
            </div>

            <div className="picker-container">
                <div style={readOnly ? { pointerEvents: 'none', opacity: 0.6 } : {}}>
                    <HexColorPicker 
                        color={brandColors[activeTab] || '#002B72'} 
                        onChange={handleColorChange} 
                    />
                </div>
                
                <div className="hex-input-section" style={readOnly ? { opacity: 0.6 } : {}}>
                    <span>#</span>
                    <input 
                        className="hex-input-field"
                        value={(brandColors[activeTab] || '#002B72').replace('#', '')}
                        onChange={(e) => handleColorChange('#' + e.target.value)}
                        placeholder="FFFFFF"
                        disabled={readOnly}
                    />
                    <Pipette size={18} color="#94a3b8" />
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
    );
};

export default BrandSettings;
