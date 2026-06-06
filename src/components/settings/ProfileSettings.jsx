import React from 'react';
import { Lock } from 'lucide-react';

const ProfileSettings = ({ email, fullName, setFullName }) => {
    const inputClass = "w-full py-3 px-4 rounded-xl border-[1.5px] border-slate-200 text-sm outline-none transition-all duration-200 box-border bg-slate-100 text-slate-900 focus:border-brand focus:bg-slate-100";

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-slate-900 text-xl font-extrabold m-0 mb-1">My Profile</h2>
                <p className="text-slate-500 text-sm m-0">Manage your personal information and security.</p>
            </div>

            {/* Card */}
            <div className="bg-light-card rounded-[20px] p-6 border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <div className="mb-5">
                    <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Email Address</label>
                    <input
                        className={inputClass}
                        value={email}
                        disabled
                        style={{ background: 'rgba(255, 255, 255, 0.02)', color: '#64748b' }}
                    />
                </div>

                <div className="mb-5">
                    <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Full Name</label>
                    <input
                        className={inputClass}
                        placeholder="Your Name"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                    />
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200">
                    <h3 className="text-red-500 text-sm mb-3">Security</h3>
                    <button
                        className="w-full py-3 px-4 rounded-xl border-[1.5px] border-slate-200 text-sm outline-none bg-slate-50 text-slate-900 text-left flex items-center gap-2.5 cursor-pointer"
                    >
                        <Lock size={16} />
                        Change Password
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;