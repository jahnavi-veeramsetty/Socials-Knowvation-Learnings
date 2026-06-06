import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { Settings as SettingsIcon, Save, AlertCircle } from 'lucide-react';
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
        <div className="p-8 font-sans max-w-[720px] mx-auto bg-light-bg min-h-screen text-slate-900">
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

            {/* Content Stack */}
            <div className="flex flex-col gap-8">
                <div className="pb-8 border-b border-slate-200">
                    <ProfileSettings email={email} fullName={fullName} setFullName={setFullName} />
                </div>

                <div className="pb-8 border-b border-slate-200">
                    <GeneralSettings orgName={orgName} setOrgName={setOrgName} readOnly={!canEditOrg} />
                </div>

                <div className={allOrgs.length > 1 ? "pb-8 border-b border-slate-200" : ""}>
                    <BrandSettings brandColors={brandColors} setBrandColors={setBrandColors} readOnly={userRole !== 'owner'} />
                </div>

                {allOrgs.length > 1 && (
                    <div>
                        <h3 className="text-base font-extrabold text-slate-900 m-0 mb-1">Switch Organization</h3>
                        <p className="text-[13px] text-slate-500 m-0 mb-4 font-medium">Jump to another organization workspace</p>
                        <div className="flex flex-col gap-3">
                            {allOrgs.map(org => (
                                <button
                                    key={org.id}
                                    className={`flex justify-between items-center py-4 px-5 bg-light-card border rounded-2xl cursor-pointer transition-all duration-200 w-full text-left ${org.id === orgId ? 'bg-slate-50 border-slate-200 cursor-default' : 'border-slate-200 hover:border-brand hover:bg-slate-50 hover:translate-x-1'}`}
                                    onClick={() => org.id !== orgId && navigate(`/org/${org.id}/dashboard`)}
                                    disabled={org.id === orgId}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-[15px] font-bold text-slate-900">{org.name}</span>
                                        {org.id === orgId && (
                                            <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-500 py-1 px-2 rounded-md">Current</span>
                                        )}
                                    </div>
                                    <div className="text-slate-600 text-lg font-bold">→</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {notification && (
                <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
            )}
        </div>
    );
};

export default Settings;
