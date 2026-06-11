import React from 'react';
import { Users, UserPlus, Shield, Plus, Search } from 'lucide-react';

const TeamSettings = ({ members }) => {
    return (
        <div className="flex flex-col">
            {/* Header */}
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h2 className="text-slate-900 text-xl font-extrabold m-0 mb-1">Team Members</h2>
                    <p className="text-slate-500 text-sm m-0">Manage team and permissions.</p>
                </div>
                <button className="bg-brand text-white py-2.5 px-5 rounded-xl border-none font-bold text-sm flex items-center gap-2 cursor-pointer transition-all duration-200 hover:bg-brand-hover hover:-translate-y-0.5">
                    <Plus size={18} />
                    Invite Member
                </button>
            </div>

            {/* Search */}
            <div className="flex gap-4 mb-6">
                <div className="flex items-center gap-3 bg-slate-50 py-2.5 px-4 rounded-xl border border-slate-200 flex-1 max-w-[400px]">
                    <Search size={18} color="#94a3b8" />
                    <input
                        className="border-none outline-none w-full text-sm font-medium bg-transparent text-slate-900 placeholder:text-slate-500"
                        placeholder="Search members..."
                    />
                </div>
            </div>

            {/* Member List */}
            <div className="bg-white rounded-[20px] border border-slate-100 overflow-hidden">
                {members.map((member, i) => (
                    <div key={i} className="flex justify-between items-center py-4 px-6 border-b border-slate-50 last:border-b-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-50 text-brand rounded-xl flex items-center justify-center">
                                <Users size={18} />
                            </div>
                            <div>
                                <h4 className="m-0 text-sm font-bold text-gray-900">{member.full_name || `Member ${i + 1}`}</h4>
                                <p className="m-0 text-xs text-slate-500">{member.email}</p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-1 py-1 px-2.5 rounded-full text-[11px] font-bold capitalize ${member.role === 'owner' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
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
