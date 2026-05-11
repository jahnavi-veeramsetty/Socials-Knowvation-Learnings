import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Building2,
    ChevronRight,
    LayoutGrid,
    List,
    Users,
    X, // Added X icon for closing modal
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

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            navigate('/login');
            return;
        }

        const { data, error } = await supabase
            .from('organization_members')
            .select(`
                role,
                organizations (
                    id,
                    name,
                    created_at
                )
            `)
            .eq('user_id', user.id);

        if (error) {
            console.error(error);
            setLoading(false);
            return;
        }

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

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setIsCreating(false);
            return;
        }

        // Create organization
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert([
                {
                    name: newOrgName.trim(),
                    created_by: user.id,
                },
            ])
            .select()
            .single();

        if (orgError) {
            console.error(orgError);
            alert(orgError.message);
            setIsCreating(false);
            return;
        }

        // Add creator as owner
        const { error: memberError } = await supabase
            .from('organization_members')
            .insert([
                {
                    organization_id: org.id,
                    user_id: user.id,
                    role: 'owner',
                },
            ]);

        if (memberError) {
            console.error(memberError);
            alert(memberError.message);
            setIsCreating(false);
            return;
        }

        setNewOrgName('');
        setIsModalOpen(false);
        setIsCreating(false);
        fetchOrgs();
    };

    const handleSelectOrg = (org) => {
        console.log('Selected Organization:', org);
        navigate(`/org/${org.id}/dashboard`);
    };

    return (
        <div className="orgs-page">
            <style>{`
                .orgs-page {
                    min-height: 100vh;
                    background: #010D2C;
                    padding: 40px 20px;
                    font-family: 'Inter', sans-serif;
                    color: #ffffff;
                }

                .container {
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                    gap: 20px;
                }

                .header-content h1 {
                    color: #ffffff;
                    font-size: 32px;
                    font-weight: 800;
                    margin: 0 0 8px;
                    letter-spacing: -0.5px;
                }

                .header-content p {
                    color: #64748b;
                    font-size: 16px;
                    margin: 0;
                }

                .actions {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .view-toggle {
                    display: flex;
                    background: #0a1936;
                    padding: 4px;
                    border-radius: 10px;
                    gap: 4px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .toggle-btn {
                    padding: 8px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    border: none;
                    background: transparent;
                    color: #64748b;
                }

                .toggle-btn.active {
                    background: #002B72;
                    color: white;
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
                }

                .create-btn {
                    background: #002B72;
                    color: white;
                    padding: 14px 20px;
                    border-radius: 14px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                }

                .create-btn:hover {
                    background: #001f54;
                    transform: translateY(-2px);
                }

                .orgs-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 24px;
                }

                .orgs-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .org-card {
                    background: #0a1936;
                    padding: 24px;
                    border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .org-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
                    border-color: #002B72;
                }

                .org-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .org-icon {
                    width: 54px;
                    height: 54px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #3b82f6;
                    flex-shrink: 0;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .org-details h3 {
                    margin: 0;
                    color: #ffffff;
                    font-size: 18px;
                    font-weight: 700;
                }

                .org-details p {
                    margin: 6px 0 0;
                    color: #64748b;
                    font-size: 14px;
                }

                .org-team {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #64748b;
                    font-size: 13px;
                    margin-top: 6px;
                }

                .org-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }

                .role-badge {
                    background: rgba(59, 130, 246, 0.1);
                    color: #3b82f6;
                    padding: 5px 12px;
                    border-radius: 999px;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: capitalize;
                }

                .meta-date {
                    color: #64748b;
                    font-size: 13px;
                }

                .empty-state {
                    background: #0a1936;
                    padding: 80px 40px;
                    border-radius: 32px;
                    text-align: center;
                    border: 2px dashed rgba(255, 255, 255, 0.05);
                }

                .empty-state h2 {
                    color: #ffffff;
                    margin: 20px 0 10px;
                    font-size: 28px;
                }

                .empty-state p {
                    color: #64748b;
                    margin-bottom: 30px;
                }

                .loading-state {
                    text-align: center;
                    padding: 100px;
                    color: #64748b;
                }

                @media (max-width: 700px) {
                    .header {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .actions {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .create-btn {
                        flex: 1;
                        justify-content: center;
                    }

                    .orgs-grid {
                        grid-template-columns: 1fr;
                    }
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                    animation: fadeIn 0.2s ease-out;
                }

                .modal-content {
                    background: #0a1936;
                    width: 100%;
                    max-width: 480px;
                    border-radius: 28px;
                    padding: 40px;
                    position: relative;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .modal-close {
                    position: absolute;
                    top: 24px;
                    right: 24px;
                    background: rgba(255, 255, 255, 0.02);
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #64748b;
                    transition: all 0.2s;
                }

                .modal-close:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: #ffffff;
                }

                .modal-header h2 {
                    color: #ffffff;
                    font-size: 24px;
                    font-weight: 800;
                    margin: 0 0 8px;
                }

                .modal-header p {
                    color: #64748b;
                    font-size: 15px;
                    margin: 0 0 32px;
                }

                .modal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .modal-input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .modal-input-group label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #cbd5e1;
                    margin-left: 4px;
                }

                .modal-input {
                    width: 100%;
                    padding: 16px 20px;
                    border-radius: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.05);
                    background: rgba(255, 255, 255, 0.02);
                    font-size: 16px;
                    transition: all 0.2s;
                    box-sizing: border-box;
                    color: white;
                }

                .modal-input:focus {
                    outline: none;
                    border-color: #002B72;
                    background: rgba(255, 255, 255, 0.05);
                    box-shadow: 0 0 0 4px rgba(0, 43, 114, 0.2);
                }

                .modal-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 8px;
                }

                .cancel-btn {
                    flex: 1;
                    background: rgba(255, 255, 255, 0.05);
                    color: #94a3b8;
                    padding: 16px;
                    border-radius: 16px;
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .cancel-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #ffffff;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>

            <div className="container">
                <div className="header">
                    <div className="header-content">
                        <h1>Your Organizations</h1>

                        <p>
                            Select an organization to continue or create a new one
                        </p>
                    </div>

                    <div className="actions">
                        <div className="view-toggle">
                            <button
                                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''
                                    }`}
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid size={18} />
                            </button>

                            <button
                                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''
                                    }`}
                                onClick={() => setViewMode('list')}
                            >
                                <List size={18} />
                            </button>
                        </div>

                        <button
                            className="create-btn"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus size={20} />
                            New Organization
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div
                            className="org-icon"
                            style={{ margin: '0 auto 20px' }}
                        >
                            <Building2 size={28} />
                        </div>

                        <p>Loading organizations...</p>
                    </div>
                ) : orgs.length > 0 ? (
                    <div
                        className={
                            viewMode === 'grid'
                                ? 'orgs-grid'
                                : 'orgs-list'
                        }
                    >
                        {orgs.map((org) => (
                            <div
                                key={org.id}
                                className="org-card"
                                onClick={() => handleSelectOrg(org)}
                            >
                                <div className="org-info">
                                    <div className="org-icon">
                                        <Building2 size={24} />
                                    </div>

                                    <div className="org-details">
                                        <h3>{org.name}</h3>

                                        <div className="org-team">
                                            <Users size={14} />
                                            <span>{org.memberCount} {org.memberCount === 1 ? 'member' : 'members'}</span>
                                        </div>
                                    </div>

                                    {viewMode === 'list' && (
                                        <div style={{ marginLeft: 'auto' }}>
                                            <ChevronRight
                                                size={20}
                                                color="#ccc"
                                            />
                                        </div>
                                    )}
                                </div>

                                {viewMode === 'grid' && (
                                    <div className="org-meta">
                                        <span className="role-badge">
                                            {org.role}
                                        </span>

                                        <span className="meta-date">
                                            {new Date(
                                                org.created_at
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Building2
                            size={56}
                            color="#002B72"
                            opacity={0.3}
                        />

                        <h2>No Organizations Found</h2>

                        <p>
                            You haven't created or joined any organizations yet.
                        </p>

                        <button
                            className="create-btn"
                            style={{ margin: '0 auto' }}
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus size={20} />
                            Create Your First Organization
                        </button>
                    </div>
                )}
            </div>

            {/* Create Organization Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => !isCreating && setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="modal-close" 
                            onClick={() => setIsModalOpen(false)}
                            disabled={isCreating}
                        >
                            <X size={20} />
                        </button>

                        <div className="modal-header">
                            <h2>Create New Organization</h2>
                            <p>Build a home for your team's projects and members.</p>
                        </div>

                        <form className="modal-form" onSubmit={handleCreateOrg}>
                            <div className="modal-input-group">
                                <label htmlFor="orgName">Organization Name</label>
                                <input
                                    id="orgName"
                                    type="text"
                                    className="modal-input"
                                    placeholder="e.g. Acme Corporation"
                                    value={newOrgName}
                                    onChange={(e) => setNewOrgName(e.target.value)}
                                    autoFocus
                                    required
                                    disabled={isCreating}
                                />
                            </div>

                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="cancel-btn"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isCreating}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="create-btn" 
                                    style={{ flex: 2, justifyContent: 'center' }}
                                    disabled={isCreating}
                                >
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