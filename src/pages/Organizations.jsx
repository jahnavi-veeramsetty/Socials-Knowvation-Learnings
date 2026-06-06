import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Building2,
    ChevronRight,
    LayoutGrid,
    List,
    Users,
    X,
} from 'lucide-react';
import { supabase } from '../supabase/supabase';

const Organizations = () => {
    const navigate = useNavigate();
    const [orgs, setOrgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newOrgName, setNewOrgName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchOrgs();
    }, []);

    const fetchOrgs = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/login'); return; }

        const { data, error } = await supabase
            .from('organization_members')
            .select(`role, organizations (id, name, created_at)`)
            .eq('user_id', user.id);

        if (error) { console.error(error); setLoading(false); return; }

        const formattedOrgs = await Promise.all(data.map(async (item) => {
            const { count } = await supabase
                .from('organization_members')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', item.organizations.id);
            return {
                id: item.organizations.id,
                name: item.organizations.name,
                created_at: item.organizations.created_at,
                role: item.role,
                memberCount: count || 0
            };
        }));

        setOrgs(formattedOrgs);
        setLoading(false);
    };

    const handleCreateOrg = async (e) => {
        e.preventDefault();
        if (!newOrgName.trim()) return;
        setIsCreating(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setIsCreating(false); return; }

        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert([{ name: newOrgName.trim(), created_by: user.id }])
            .select().single();

        if (orgError) { alert(orgError.message); setIsCreating(false); return; }

        const { error: memberError } = await supabase
            .from('organization_members')
            .insert([{ organization_id: org.id, user_id: user.id, role: 'owner' }]);

        if (memberError) { alert(memberError.message); setIsCreating(false); return; }

        setNewOrgName('');
        setIsModalOpen(false);
        setIsCreating(false);
        fetchOrgs();
    };

    const handleSelectOrg = (org) => {
        navigate(`/org/${org.id}/dashboard`);
    };

    return (
        <div className="min-h-screen bg-light-bg py-10 px-5 font-sans text-slate-900">
            <div className="max-w-[1000px] mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-10 gap-5 flex-wrap">
                    <div>
                        <h1 className="text-slate-900 text-[32px] font-extrabold m-0 mb-2 tracking-[-0.5px]">Your Organizations</h1>
                        <p className="text-slate-500 text-base m-0">Select an organization to continue or create a new one</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <div className="flex bg-light-card p-1 rounded-[10px] gap-1 border border-slate-200">
                            <button
                                className={`p-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center border-none ${viewMode === 'grid' ? 'bg-brand text-white shadow-[0_2px_12px_rgba(0,0,0,0.2)]' : 'bg-transparent text-slate-500'}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                className={`p-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center border-none ${viewMode === 'list' ? 'bg-brand text-white shadow-[0_2px_12px_rgba(0,0,0,0.2)]' : 'bg-transparent text-slate-500'}`}
                                onClick={() => setViewMode('list')}
                            >
                                <List size={18} />
                            </button>
                        </div>
                        <button
                            className="bg-brand text-white py-3.5 px-5 rounded-2xl font-semibold flex items-center gap-2 border-none cursor-pointer transition-all duration-200 shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:bg-brand-hover hover:-translate-y-0.5"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus size={20} />
                            New Organization
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-24 text-slate-500">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-400 border border-slate-200 mx-auto mb-5">
                            <Building2 size={28} />
                        </div>
                        <p>Loading organizations...</p>
                    </div>
                ) : orgs.length > 0 ? (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6' : 'flex flex-col gap-4'}>
                        {orgs.map((org) => (
                            <div
                                key={org.id}
                                className="bg-light-card p-6 rounded-3xl border border-slate-200 cursor-pointer transition-all duration-300 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:border-brand"
                                onClick={() => handleSelectOrg(org)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-[54px] h-[54px] bg-slate-50 rounded-2xl flex items-center justify-center text-blue-400 shrink-0 border border-slate-200">
                                        <Building2 size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="m-0 text-slate-900 text-lg font-bold">{org.name}</h3>
                                        <div className="flex items-center gap-1.5 text-slate-500 text-[13px] mt-1.5">
                                            <Users size={14} />
                                            <span>{org.memberCount} {org.memberCount === 1 ? 'member' : 'members'}</span>
                                        </div>
                                    </div>
                                    {viewMode === 'list' && <ChevronRight size={20} color="#ccc" />}
                                </div>

                                {viewMode === 'grid' && (
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                                        <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold capitalize">{org.role}</span>
                                        <span className="text-slate-500 text-[13px]">{new Date(org.created_at).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-light-card py-20 px-10 rounded-[32px] text-center border-2 border-dashed border-slate-200">
                        <Building2 size={56} color="#002B72" opacity={0.3} />
                        <h2 className="text-slate-900 mt-5 mb-2.5 text-[28px]">No Organizations Found</h2>
                        <p className="text-slate-500 mb-8">You haven't created or joined any organizations yet.</p>
                        <button
                            className="bg-brand text-white py-3.5 px-5 rounded-2xl font-semibold flex items-center gap-2 border-none cursor-pointer transition-all duration-200 shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:bg-brand-hover hover:-translate-y-0.5 mx-auto"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus size={20} />
                            Create Your First Organization
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-[1000] p-5 animate-[fadeIn_0.2s_ease-out]"
                    onClick={() => !isCreating && setIsModalOpen(false)}>
                    <div className="bg-light-card w-full max-w-[480px] rounded-[28px] p-10 relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-slate-200 animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]"
                        onClick={e => e.stopPropagation()}>
                        <button
                            className="absolute top-6 right-6 bg-slate-50 border-none w-9 h-9 rounded-full flex items-center justify-center cursor-pointer text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
                            onClick={() => setIsModalOpen(false)} disabled={isCreating}>
                            <X size={20} />
                        </button>

                        <div className="mb-8">
                            <h2 className="text-slate-900 text-2xl font-extrabold m-0 mb-2">Create New Organization</h2>
                            <p className="text-slate-500 text-[15px] m-0">Build a home for your team's projects and members.</p>
                        </div>

                        <form className="flex flex-col gap-6" onSubmit={handleCreateOrg}>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="orgName" className="text-sm font-semibold text-slate-600 ml-1">Organization Name</label>
                                <input
                                    id="orgName" type="text"
                                    className="w-full py-4 px-5 rounded-2xl border-2 border-slate-200 bg-slate-50 text-base transition-all duration-200 box-border text-slate-900 outline-none focus:border-brand focus:bg-slate-100 focus:shadow-[0_0_0_4px_rgba(0,43,114,0.2)]"
                                    placeholder="e.g. Acme Corporation"
                                    value={newOrgName}
                                    onChange={(e) => setNewOrgName(e.target.value)}
                                    autoFocus required disabled={isCreating}
                                />
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button
                                    type="button"
                                    className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold border-none cursor-pointer transition-all duration-200 hover:bg-slate-200 hover:text-slate-900"
                                    onClick={() => setIsModalOpen(false)} disabled={isCreating}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] bg-brand text-white py-4 rounded-2xl font-bold border-none cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:bg-brand-hover hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isCreating}>
                                    {isCreating ? 'Creating...' : 'Create Organization'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Organizations;