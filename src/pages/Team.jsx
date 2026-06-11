import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Search, MoreVertical, Mail, ShieldCheck, Crown, User, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../supabase/supabase';

const Team = () => {
    const { orgId } = useParams();
    const [members, setMembers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [openMenu, setOpenMenu] = useState(null);
    const menuRef = useRef();

    useEffect(() => { if (orgId) fetchTeamData(); }, [orgId]);

    useEffect(() => {
        const handleClickOutside = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchTeamData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setCurrentUserId(user.id);

            const { data: myRoleData } = await supabase.from('organization_members').select('role').eq('organization_id', orgId).eq('user_id', user.id).single();
            if (myRoleData) setCurrentUserRole(myRoleData.role);

            const { data: memberData, error: memberError } = await supabase.from('organization_members').select('role, user_id').eq('organization_id', orgId);
            if (memberError) throw memberError;

            const membersWithStats = await Promise.all(memberData.map(async (m) => {
                const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', m.user_id).single();
                const { count: postCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('created_by', m.user_id).eq('organization_id', orgId);
                const { count: quizCount } = await supabase.from('quiz_questions').select('*', { count: 'exact', head: true }).eq('created_by', m.user_id).eq('organization_id', orgId);
                return { ...m, profiles: profile || { full_name: 'Unknown', email: 'N/A' }, postCount: postCount || 0, quizCount: quizCount || 0 };
            }));

            setMembers(membersWithStats);
        } catch (err) {
            console.error('Error fetching team:', err.message || err);
        } finally {
            setLoading(false);
        }
    };

    const updateRole = async (memberId, newRole) => {
        const { error } = await supabase.from('organization_members').update({ role: newRole }).eq('organization_id', orgId).eq('user_id', memberId);
        if (error) { alert(error.message); return; }
        fetchTeamData();
        setOpenMenu(null);
    };

    const removeMember = async (memberId) => {
        if (memberId === currentUserId) { alert("You can't remove yourself"); return; }
        const confirmed = window.confirm('Remove this member?');
        if (!confirmed) return;
        const { error } = await supabase.from('organization_members').delete().eq('organization_id', orgId).eq('user_id', memberId);
        if (error) { alert(error.message); return; }
        fetchTeamData();
        setOpenMenu(null);
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const filteredMembers = members.filter(m =>
        m.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleLabel = (role) => {
        if (role === 'owner') return 'Super Admin';
        if (role === 'admin') return 'Admin';
        return 'Member';
    };

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
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-24">Loading...</div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
                    {filteredMembers.map((member, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-6 relative shadow-sm border border-slate-200 transition-all duration-300 text-center hover:-translate-y-1 hover:shadow-md hover:border-brand">

                            {/* Menu */}
                            {currentUserRole === 'owner' && (
                                <div ref={menuRef}>
                                    <div
                                        className="absolute top-6 right-6 cursor-pointer p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
                                        onClick={() => setOpenMenu(openMenu === idx ? null : idx)}
                                    >
                                        <MoreVertical size={20} />
                                    </div>

                                    {openMenu === idx && (
                                        <div className="absolute top-14 right-6 w-44 bg-light-card rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-slate-200 overflow-hidden z-[100]">
                                            {member.role !== 'admin' && member.role !== 'owner' && (
                                                <div className="py-3.5 px-4.5 text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center gap-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                                    onClick={() => updateRole(member.user_id, 'admin')}>
                                                    <ShieldCheck size={16} />
                                                    Make Admin
                                                </div>
                                            )}
                                            {member.role === 'admin' && (
                                                <div className="py-3.5 px-4.5 text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center gap-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                                    onClick={() => updateRole(member.user_id, 'member')}>
                                                    <User size={16} />
                                                    Make Member
                                                </div>
                                            )}
                                            {member.role !== 'owner' && (
                                                <div className="py-3.5 px-4.5 text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center gap-2.5 text-red-500 hover:bg-slate-100"
                                                    onClick={() => removeMember(member.user_id)}>
                                                    <Trash2 size={16} />
                                                    Remove User
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Avatar */}
                            <div className="w-24 h-24 bg-slate-50 rounded-[30px] flex items-center justify-center text-[32px] font-black text-slate-900 mx-auto mb-6 border border-slate-200">
                                {getInitials(member.profiles?.full_name)}
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-1">{member.profiles?.full_name || 'New Member'}</h3>

                            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mb-4">
                                <Mail size={14} />
                                {member.profiles?.email}
                            </div>

                            <div className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 py-2 px-4 rounded-full text-[13px] font-extrabold mb-8">
                                {member.role === 'owner' ? <Crown size={14} /> : <ShieldCheck size={14} />}
                                {getRoleLabel(member.role)}
                            </div>

                            <div className="w-full h-px bg-slate-100 mb-6"></div>

                            <div className="grid grid-cols-[1fr_1px_1fr] items-center">
                                <div className="flex flex-col gap-1.5">
                                    <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">Posts</div>
                                    <div className="text-[22px] font-black text-slate-900">{member.postCount}</div>
                                </div>
                                <div className="w-px h-10 bg-slate-100"></div>
                                <div className="flex flex-col gap-1.5">
                                    <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">Quiz Q's</div>
                                    <div className="text-[22px] font-black text-slate-900">{member.quizCount}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Team;