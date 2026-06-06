import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { Settings as SettingsIcon, Save, AlertCircle, User, Building, Palette, Grid } from 'lucide-react';
import { supabase } from '../supabase/supabase';
import GeneralSettings from '../components/settings/GeneralSettings';
import ProfileSettings from '../components/settings/ProfileSettings';
import BrandSettings from '../components/settings/BrandSettings';
import Toast from '../components/common/Toast';
import ConfirmModal from '../components/common/ConfirmModal';

const Settings = () => {
    const { orgId } = useParams();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [orgName, setOrgName] = useState('');
    const [brandColors, setBrandColors] = useState({ KLM: '#002B72', KLS: '#4f46e5', KLC: '#0ea5e9' });
    const [allOrgs, setAllOrgs] = useState([]);
    const [userRole, setUserRole] = useState('member');
    const [notification, setNotification] = useState(null);
    const [initialData, setInitialData] = useState({ fullName: '', orgName: '', brandColors: { KLM: '#002B72', KLS: '#4f46e5', KLC: '#0ea5e9' } });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const canEditOrg = userRole === 'admin' || userRole === 'owner';

    useEffect(() => { if (orgId) fetchAllData(); }, [orgId]);

    useEffect(() => {
        if (!loading) {
            const profileChanged = fullName !== initialData.fullName;
            const orgChanged = canEditOrg && orgName !== initialData.orgName;
            const brandChanged = userRole === 'owner' && JSON.stringify(brandColors) !== JSON.stringify(initialData.brandColors);
            setHasChanges(profileChanged || orgChanged || brandChanged);
        }
    }, [fullName, orgName, brandColors, initialData, loading, canEditOrg, userRole]);

    useEffect(() => {
        const handleBeforeUnload = (e) => { if (hasChanges) { e.preventDefault(); e.returnValue = ''; } };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasChanges]);

    const fetchAllData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: memberData } = await supabase.from('organization_members').select('role').eq('organization_id', orgId).eq('user_id', user.id).single();
        if (memberData) setUserRole(memberData.role);

        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) { setEmail(profile.email || ''); setFullName(profile.full_name || ''); }

        const { data: org } = await supabase.from('organizations').select('*').eq('id', orgId).single();
        let colors = { KLM: '#002B72', KLS: '#4f46e5', KLC: '#0ea5e9' };
        if (org) { setOrgName(org.name || ''); if (org.brand_colors) { colors = org.brand_colors; setBrandColors(colors); } }

        setInitialData({ fullName: profile?.full_name || '', orgName: org?.name || '', brandColors: colors });

        const { data: memberOrgs } = await supabase.from('organization_members').select(`organizations:organization_id (id, name)`).eq('user_id', user.id);
        if (memberOrgs) setAllOrgs(memberOrgs.map(m => m.organizations).filter(Boolean));

        setLoading(false);
    };

    const blocker = useBlocker(({ currentLocation, nextLocation }) =>
        hasChanges && currentLocation.pathname !== nextLocation.pathname
    );

    const handleSave = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        try {
            const { error: profileErr } = await supabase.from('profiles').update({ full_name: fullName, email: user.email }).eq('id', user.id);
            if (profileErr) throw profileErr;

            if (canEditOrg) {
                const orgUpdate = { name: orgName };
                if (userRole === 'owner') orgUpdate.brand_colors = brandColors;
                const { error: orgErr } = await supabase.from('organizations').update(orgUpdate).eq('id', orgId);
                if (orgErr) throw orgErr;
            }

            setInitialData({ fullName, orgName, brandColors });
            setHasChanges(false);

            if (blocker.state === "blocked") {
                blocker.proceed();
            } else {
                setNotification({ message: 'Settings saved successfully!', type: 'success' });
            }
        } catch (error) {
            console.error(error);
            setNotification({ message: error.message, type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-brand">
                <p>Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="p-8 font-sans max-w-[1000px] mx-auto bg-light-bg min-h-screen text-slate-900 flex flex-col">
            {/* Confirmation Modal */}
            {blocker.state === "blocked" && (
                <ConfirmModal
                    title="Unsaved Changes"
                    message="You have unsaved changes. Would you like to save them before leaving this page?"
                    onConfirm={handleSave}
                    onDiscard={() => blocker.proceed()}
                    onCancel={() => blocker.reset()}
                />
            )}

            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <SettingsIcon size={28} color="#002B72" />
                    <h1 className="text-slate-900 text-2xl font-extrabold m-0 tracking-[-0.5px]">Settings</h1>
                </div>

                <div className="flex items-center">
                    {hasChanges && (
                        <div className="flex items-center gap-2 text-amber-400 text-[13px] font-semibold mr-4">
                            <AlertCircle size={16} />
                            Unsaved Changes
                        </div>
                    )}
                    <button
                        className="bg-brand text-white py-3 px-6 rounded-xl font-bold flex items-center gap-2 border-none cursor-pointer transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:bg-brand-hover hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0"
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Content Layout */}
            <div className="grid grid-cols-[240px_1fr] gap-10 flex-1 items-start">
                {/* Sidebar Navigation */}
                <aside className="flex flex-col gap-2">
                    <button
                        className={`flex items-center gap-3 py-3.5 px-4 rounded-xl border-none font-bold text-sm cursor-pointer transition-all duration-200 w-full text-left ${activeTab === 'profile' ? 'bg-brand text-white shadow-[0_4px_12px_rgba(0,43,114,0.2)]' : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User size={18} /> My Profile
                    </button>

                    <button
                        className={`flex items-center gap-3 py-3.5 px-4 rounded-xl border-none font-bold text-sm cursor-pointer transition-all duration-200 w-full text-left ${activeTab === 'organization' ? 'bg-brand text-white shadow-[0_4px_12px_rgba(0,43,114,0.2)]' : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                        onClick={() => setActiveTab('organization')}
                    >
                        <Building size={18} /> Organization
                    </button>

                    <button
                        className={`flex items-center gap-3 py-3.5 px-4 rounded-xl border-none font-bold text-sm cursor-pointer transition-all duration-200 w-full text-left ${activeTab === 'brand' ? 'bg-brand text-white shadow-[0_4px_12px_rgba(0,43,114,0.2)]' : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                        onClick={() => setActiveTab('brand')}
                    >
                        <Palette size={18} /> Brand Colors
                    </button>

                    {allOrgs.length > 1 && (
                        <button
                            className={`flex items-center gap-3 py-3.5 px-4 rounded-xl border-none font-bold text-sm cursor-pointer transition-all duration-200 w-full text-left ${activeTab === 'workspaces' ? 'bg-brand text-white shadow-[0_4px_12px_rgba(0,43,114,0.2)]' : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                            onClick={() => setActiveTab('workspaces')}
                        >
                            <Grid size={18} /> Switch Workspace
                        </button>
                    )}
                </aside>

                {/* Tab Content */}
                <main className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-8 min-h-[400px]">
                    {activeTab === 'profile' && (
                        <ProfileSettings email={email} fullName={fullName} setFullName={setFullName} />
                    )}

                    {activeTab === 'organization' && (
                        <GeneralSettings orgName={orgName} setOrgName={setOrgName} readOnly={!canEditOrg} />
                    )}

                    {activeTab === 'brand' && (
                        <BrandSettings brandColors={brandColors} setBrandColors={setBrandColors} readOnly={userRole !== 'owner'} />
                    )}

                    {activeTab === 'workspaces' && allOrgs.length > 1 && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-slate-900 text-xl font-extrabold m-0 mb-1">Switch Organization</h2>
                                <p className="text-slate-500 text-sm m-0">Jump to another organization workspace.</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                {allOrgs.map(org => (
                                    <button
                                        key={org.id}
                                        className={`flex justify-between items-center py-4 px-5 border rounded-2xl cursor-pointer transition-all duration-200 w-full text-left ${org.id === orgId ? 'bg-slate-50 border-slate-200 cursor-default' : 'bg-white border-slate-200 hover:border-brand hover:bg-slate-50 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]'}`}
                                        onClick={() => org.id !== orgId && navigate(`/org/${org.id}/dashboard`)}
                                        disabled={org.id === orgId}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-[15px] font-bold text-slate-900">{org.name}</span>
                                            {org.id === orgId && (
                                                <span className="text-[10px] font-extrabold uppercase bg-slate-200 text-slate-600 py-1 px-2 rounded-md tracking-wide">Current</span>
                                            )}
                                        </div>
                                        <div className="text-slate-400 text-lg font-bold">→</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {notification && (
                <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
            )}
        </div>
    );
};

export default Settings;
