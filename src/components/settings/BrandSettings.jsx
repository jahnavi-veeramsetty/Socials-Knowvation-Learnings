import React from 'react';
import { Palette } from 'lucide-react';

const BrandSettings = ({ brandColors, setBrandColors }) => {
    const accounts = [
        { id: 'KLM', name: 'KL Main (KLM)' },
        { id: 'KLS', name: 'KL Select (KLS)' },
        { id: 'KLC', name: 'KL Community (KLC)' }
    ];

    const handleColorChange = (accId, color) => {
        setBrandColors({
            ...brandColors,
            [accId]: color
        });
    };

    const presets = [
        '#002B72', '#4f46e5', '#0ea5e9', '#10b981', 
        '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899',
        '#000000', '#64748b'
    ];

    return (
        <div className="settings-section">
            <style>{`
                .settings-section {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .section-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 8px;
                }
                .section-info h2 {
                    font-size: 18px;
                    font-weight: 800;
                    color: #111;
                    margin: 0;
                }
                .section-info p {
                    font-size: 14px;
                    color: #64748b;
                    margin: 4px 0 0;
                }
                .brand-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .brand-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 16px;
                    border: 1px solid #f1f5f9;
                }
                .brand-name {
                    font-weight: 700;
                    color: #002B72;
                }
                .color-controls {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .color-picker-wrapper {
                    position: relative;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 2px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    cursor: pointer;
                }
                .color-input {
                    position: absolute;
                    top: -10px;
                    left: -10px;
                    width: 60px;
                    height: 60px;
                    cursor: pointer;
                    border: none;
                    background: none;
                }
                .presets {
                    display: flex;
                    gap: 6px;
                }
                .preset-dot {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: transform 0.1s;
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .preset-dot:hover {
                    transform: scale(1.2);
                }
            `}</style>

            <div className="section-info">
                <Palette size={20} color="#002B72" />
                <div>
                    <h2>Brand Colors</h2>
                    <p>Customize how each social account appears on your calendar.</p>
                </div>
            </div>

            <div className="brand-grid">
                {accounts.map(acc => (
                    <div key={acc.id} className="brand-item">
                        <span className="brand-name">{acc.name}</span>
                        
                        <div className="color-controls">
                            <div className="presets">
                                {presets.map(p => (
                                    <div 
                                        key={p} 
                                        className="preset-dot" 
                                        style={{ background: p }}
                                        onClick={() => handleColorChange(acc.id, p)}
                                    />
                                ))}
                            </div>
                            <div className="color-picker-wrapper" style={{ background: brandColors[acc.id] || '#002B72' }}>
                                <input 
                                    type="color" 
                                    className="color-input"
                                    value={brandColors[acc.id] || '#002B72'}
                                    onChange={(e) => handleColorChange(acc.id, e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BrandSettings;
