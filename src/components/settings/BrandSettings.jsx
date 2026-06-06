import React from 'react';
import { Palette, Pipette } from 'lucide-react';
import { HexColorPicker } from "react-colorful";

const BrandSettings = ({ brandColors, setBrandColors, readOnly = false }) => {
    const [activeTab, setActiveTab] = React.useState('KLM');

    const accounts = [
        { id: 'KLM', name: 'KL Main (KLM)' },
        { id: 'KLS', name: 'KL Select (KLS)' },
        { id: 'KLC', name: 'KL Community (KLC)' }
    ];

    const handleColorChange = (color) => {
        setBrandColors({ ...brandColors, [activeTab]: color });
    };

    return (
        <div className="flex flex-col gap-8 py-5">
            {/* Section Header */}
            <div className="flex items-center gap-3">
                <Palette size={22} color="#002B72" />
                <div className="flex-1 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-extrabold text-slate-900 m-0">Brand Colors</h2>
                        <p className="text-sm text-slate-500 mt-1 mb-0">Select a card below, then use the color picker to set its color.</p>
                    </div>
                    {readOnly && (
                        <span className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-500 py-1 px-2.5 rounded-lg text-[11px] font-bold uppercase tracking-[0.5px]">View Only</span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex gap-8 items-start flex-wrap md:flex-nowrap">
                {/* Color Picker */}
                <div className="flex flex-col items-center bg-light-card py-6 px-6 rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.3)] border border-slate-200 w-[320px] shrink-0">
                    <div className="w-full" style={{ ...(readOnly ? { pointerEvents: 'none', opacity: 0.6 } : {}) }}>
                        <HexColorPicker
                            color={brandColors[activeTab] || '#002B72'}
                            onChange={handleColorChange}
                            style={{ width: '100%', height: '180px' }}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full mt-5" style={readOnly ? { opacity: 0.6 } : {}}>
                        <div className="flex-1 flex items-center gap-3 border border-slate-200 rounded-lg py-2 px-3 bg-slate-100">
                            <div
                                className="w-5 h-5 rounded-full border border-slate-200 shrink-0"
                                style={{ background: brandColors[activeTab] || '#002B72' }}
                            />
                            <input
                                className="border-none outline-none font-semibold text-slate-900 w-full uppercase text-sm bg-transparent"
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
                        <button className="flex items-center justify-center w-[38px] h-[38px] border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-pointer shrink-0 transition-all duration-200 hover:bg-slate-200 hover:text-slate-900" disabled={readOnly}>
                            <Pipette size={18} />
                        </button>
                    </div>
                </div>

                {/* Account Cards */}
                <div className="flex-1 grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-4">
                    {accounts.map(acc => (
                        <div
                            key={acc.id}
                            className={`flex flex-col items-center gap-4 p-6 bg-slate-50 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${activeTab === acc.id ? 'bg-brand/20 border-brand shadow-[0_10px_25px_rgba(0,0,0,0.3)] -translate-y-1' : 'border-transparent hover:bg-slate-100 hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:border-slate-200'}`}
                            onClick={() => setActiveTab(acc.id)}
                        >
                            <div
                                className={`w-[60px] h-[60px] rounded-full border-4 border-dark-card shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-transform duration-300 ${activeTab === acc.id ? 'scale-110' : ''}`}
                                style={{ background: brandColors[acc.id] || '#002B72' }}
                            />
                            <div className="text-center">
                                <strong className="block text-[15px] text-slate-900 mb-0.5">{acc.id}</strong>
                                <span className="text-xs text-slate-500 font-semibold">{acc.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BrandSettings;
