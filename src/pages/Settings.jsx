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

    // Data states
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [orgName, setOrgName] = useState('');
    const [brandColors, setBrandColors] = useState({
        KLM: '#002B72',
        KLS: '#4f46e5',
        KLC: '#0ea5e9'
    });
    const [allOrgs, setAllOrgs] = useState([]);
    const [notification, setNotification] = useState(null);
    
    // Initial data to check for changes
    const [initialData, setInitialData] = useState({ 
        fullName: '', 
        orgName: '',
        brandColors: { KLM: '#002B72', KLS: '#4f46e5', KLC: '#0ea5e9' }
    });
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (orgId) {
            fetchAllData();
        }
    }, [orgId]);

    // Check for changes
    useEffect(() => {
        if (!loading) {
            const changed = fullName !== initialData.fullName || 
                           orgName !== initialData.orgName ||
                           JSON.stringify(brandColors) !== JSON.stringify(initialData.brandColors);
            setHasChanges(changed);
        }
    }, [fullName, orgName, brandColors, initialData, loading]);

    // Browser-level navigation guard
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasChanges]);

    const fetchAllData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch Profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profile) {
            setEmail(profile.email || '');
            setFullName(profile.full_name || '');
        }

        // Fetch Org
        const { data: org } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', orgId)
            .single();

        let colors = { KLM: '#002B72', KLS: '#4f46e5', KLC: '#0ea5e9' };
        if (org) {
            setOrgName(org.name || '');
            if (org.brand_colors) {
                colors = org.brand_colors;
                setBrandColors(colors);
            }
        }

        // Store initial data
        setInitialData({
            fullName: profile?.full_name || '',
            orgName: org?.name || '',
            brandColors: colors
        });

        // Fetch all organizations for switching
        const { data: memberOrgs } = await supabase
            .from('organization_members')
            .select(`
                organizations:organization_id (
                    id,
                    name
                )
            `)
            .eq('user_id', user.id);

        if (memberOrgs) {
            const orgs = memberOrgs.map(m => m.organizations).filter(Boolean);
            setAllOrgs(orgs);
        }

        setLoading(false);
    };

    // Navigation blocker
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            hasChanges && currentLocation.pathname !== nextLocation.pathname
    );

    const handleSave = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();

        try {
            // Update Profile
            const { error: profileErr } = await supabase
                .from('profiles')
                .update({ full_name: fullName })
                .eq('id', user.id);

            if (profileErr) throw profileErr;

            // Update Org
            const { error: orgErr } = await supabase
                .from('organizations')
                .update({ 
                    name: orgName,
                    brand_colors: brandColors 
                })
                .eq('id', orgId);

            if (orgErr) throw orgErr;

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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#002B72' }}>
                <p>Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="settings-page">
            <style>{`
                .settings-page {
                    padding: 32px;
                    font-family: 'Inter', sans-serif;
                    max-width: 720px;
                    margin: 0 auto;
                }
                .settings-header {
                    margin-bottom: 32px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .header-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .header-title h1 {
                    color: #002B72;
                    font-size: 24px;
                    font-weight: 800;
                    margin: 0;
                    letter-spacing: -0.5px;
                }
                .global-save-btn {
                    background: #002B72;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(0, 43, 114, 0.2);
                }
                .global-save-btn:hover:not(:disabled) {
                    background: #001f54;
                    transform: translateY(-2px);
                }
                .global-save-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }
                .unsaved-warning {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #f59e0b;
                    font-size: 13px;
                    font-weight: 600;
                    margin-right: 16px;
                }
                .settings-content-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }
                .settings-content-stack > div:not(:last-child) {
                    position: relative;
                    padding-bottom: 32px;
                }
                .settings-content-stack > div:not(:last-child)::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: #f1f5f9;
                }
                
                .section-title {
                    font-size: 16px;
                    font-weight: 800;
                    color: #002B72;
                    margin: 0 0 4px 0;
                }
                .section-desc {
                    font-size: 13px;
                    color: #64748b;
                    margin: 0 0 16px 0;
                    font-weight: 500;
                }
                .org-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .org-switch-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                    width: 100%;
                    text-align: left;
                }
                .org-switch-item:hover:not(:disabled) {
                    border-color: #002B72;
                    background: #f8fafc;
                    transform: translateX(4px);
                }
                .org-switch-item.current {
                    background: #f8fafc;
                    border-color: #e2e8f0;
                    cursor: default;
                }
                .org-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .org-name {
                    font-size: 15px;
                    font-weight: 700;
                    color: #1e293b;
                }
                .current-tag {
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    background: #e2e8f0;
                    color: #64748b;
                    padding: 4px 8px;
                    border-radius: 6px;
                }
                .switch-arrow {
                    color: #cbd5e1;
                    font-size: 18px;
                    font-weight: 700;
                }
                .org-switch-item:hover .switch-arrow {
                    color: #002B72;
                }
                
                @media (max-width: 600px) {
                    .settings-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 20px;
                    }
                }
            `}</style>

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

            <div className="settings-header">
                <div className="header-title">
                    <SettingsIcon size={28} color="#002B72" />
                    <h1>Settings</h1>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {hasChanges && (
                        <div className="unsaved-warning">
                            <AlertCircle size={16} />
                            Unsaved Changes
                        </div>
                    )}
                    <button 
                        className="global-save-btn" 
                        onClick={handleSave} 
                        disabled={saving || !hasChanges}
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="settings-content-stack">
                <ProfileSettings 
                    email={email} 
                    fullName={fullName} 
                    setFullName={setFullName} 
                />
                
                <GeneralSettings 
                    orgName={orgName} 
                    setOrgName={setOrgName} 
                />

                <BrandSettings 
                    brandColors={brandColors}
                    setBrandColors={setBrandColors}
                />

                {allOrgs.length > 1 && (
                    <div className="org-switcher-section">
                        <h3 className="section-title">Switch Organization</h3>
                        <p className="section-desc">Jump to another organization workspace</p>
                        <div className="org-list">
                            {allOrgs.map(org => (
                                <button 
                                    key={org.id}
                                    className={`org-switch-item ${org.id === orgId ? 'current' : ''}`}
                                    onClick={() => org.id !== orgId && navigate(`/org/${org.id}/dashboard`)}
                                    disabled={org.id === orgId}
                                >
                                    <div className="org-info">
                                        <span className="org-name">{org.name}</span>
                                        {org.id === orgId && <span className="current-tag">Current</span>}
                                    </div>
                                    <div className="switch-arrow">→</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {notification && (
                <Toast 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification(null)} 
                />
            )}
        </div>
    );
};

export default Settings;
