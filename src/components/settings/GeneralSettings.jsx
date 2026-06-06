import React from 'react';

const GeneralSettings = ({ orgName, setOrgName, readOnly = false }) => {
    return (
        <div className="flex flex-col">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-slate-900 text-xl font-extrabold m-0">Organization Settings</h2>
                    {readOnly && (
                        <span className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-500 py-1 px-2.5 rounded-lg text-[11px] font-bold uppercase tracking-[0.5px]">View Only</span>
                    )}
                </div>
                <p className="text-slate-500 text-sm m-0">Manage your organization's core information.</p>
            </div>

            <div className="mb-5">
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Organization Name</label>
                <input
                    className="w-full py-3 px-4 rounded-xl border-[1.5px] border-slate-200 text-sm outline-none transition-all duration-200 box-border bg-slate-100 text-slate-900 focus:border-brand focus:bg-slate-100"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    placeholder="Organization Name"
                    disabled={readOnly}
                    style={readOnly ? { background: 'rgba(255, 255, 255, 0.02)', color: '#64748b' } : {}}
                />
            </div>
        </div>
    );
};

export default GeneralSettings;
