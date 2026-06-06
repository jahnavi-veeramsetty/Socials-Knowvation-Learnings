import React from 'react';
import { Users, UserPlus, Shield } from 'lucide-react';

const TeamSettings = ({ members }) => {
    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-brand text-xl font-extrabold m-0 mb-1">Team Members</h2>
                    <p className="text-slate-500 text-sm m-0">Manage who has access to this organization.</p>
                </div>
                <button className="bg-brand/[0.08] text-brand py-2 px-4 rounded-xl font-bold flex items-center gap-1.5 border-none cursor-pointer text-[13px] hover:bg-brand/15">
                    <UserPlus size={16} />
                    Invite
                </button>
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
