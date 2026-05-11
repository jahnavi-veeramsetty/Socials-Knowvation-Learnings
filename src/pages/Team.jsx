import React, {
    useState,
    useEffect,
    useRef
} from 'react';

import { useParams } from 'react-router-dom';

import {
    Search,
    MoreVertical,
    Mail,
    ShieldCheck,
    Crown,
    User,
    Plus,
    Trash2
} from 'lucide-react';

import { supabase } from '../supabase/supabase';

const Team = () => {

    const { orgId } = useParams();

    const [members, setMembers] =
        useState([]);

    const [searchQuery, setSearchQuery] =
        useState('');

    const [loading, setLoading] =
        useState(true);

    const [currentUserRole, setCurrentUserRole] =
        useState(null);

    const [currentUserId, setCurrentUserId] =
        useState(null);

    const [openMenu, setOpenMenu] =
        useState(null);

    const menuRef = useRef();

    useEffect(() => {

        if (orgId) {
            fetchTeamData();
        }

    }, [orgId]);

    useEffect(() => {

        const handleClickOutside = (
            e
        ) => {

            if (
                menuRef.current &&
                !menuRef.current.contains(
                    e.target
                )
            ) {
                setOpenMenu(null);
            }
        };

        document.addEventListener(
            'mousedown',
            handleClickOutside
        );

        return () => {

            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );
        };

    }, []);

    const fetchTeamData = async () => {

        setLoading(true);

        try {

            const {
                data: { user }
            } = await supabase.auth.getUser();

            if (!user) return;

            setCurrentUserId(user.id);

            // =========================
            // CURRENT USER ROLE
            // =========================

            const { data: myRoleData } =
                await supabase
                    .from(
                        'organization_members'
                    )
                    .select('role')
                    .eq(
                        'organization_id',
                        orgId
                    )
                    .eq(
                        'user_id',
                        user.id
                    )
                    .single();

            if (myRoleData) {
                setCurrentUserRole(
                    myRoleData.role
                );
            }

            // =========================
            // FETCH MEMBERS
            // =========================

            const {
                data: memberData,
                error: memberError
            } = await supabase
                .from(
                    'organization_members'
                )
                .select(
                    'role, user_id'
                )
                .eq(
                    'organization_id',
                    orgId
                );

            if (memberError)
                throw memberError;

            const membersWithStats =
                await Promise.all(
                    memberData.map(
                        async (m) => {

                            const {
                                data: profile
                            } =
                                await supabase
                                    .from(
                                        'profiles'
                                    )
                                    .select(
                                        'full_name, email'
                                    )
                                    .eq(
                                        'id',
                                        m.user_id
                                    )
                                    .single();

                            const {
                                count: postCount
                            } =
                                await supabase
                                    .from(
                                        'posts'
                                    )
                                    .select(
                                        '*',
                                        {
                                            count: 'exact',
                                            head: true
                                        }
                                    )
                                    .eq(
                                        'created_by',
                                        m.user_id
                                    )
                                    .eq(
                                        'organization_id',
                                        orgId
                                    );

                            const {
                                count: quizCount
                            } =
                                await supabase
                                    .from(
                                        'quiz_questions'
                                    )
                                    .select(
                                        '*',
                                        {
                                            count: 'exact',
                                            head: true
                                        }
                                    )
                                    .eq(
                                        'created_by',
                                        m.user_id
                                    )
                                    .eq(
                                        'organization_id',
                                        orgId
                                    );

                            return {
                                ...m,

                                profiles:
                                    profile || {
                                        full_name:
                                            'Unknown',
                                        email:
                                            'N/A'
                                    },

                                postCount:
                                    postCount ||
                                    0,

                                quizCount:
                                    quizCount ||
                                    0
                            };
                        }
                    )
                );

            setMembers(
                membersWithStats
            );

        } catch (err) {

            console.error(
                'Error fetching team:',
                err.message || err
            );

        } finally {

            setLoading(false);

        }
    };

    const updateRole = async (
        memberId,
        newRole
    ) => {

        const { error } =
            await supabase
                .from(
                    'organization_members'
                )
                .update({
                    role: newRole
                })
                .eq(
                    'organization_id',
                    orgId
                )
                .eq(
                    'user_id',
                    memberId
                );

        if (error) {

            alert(error.message);

            return;
        }

        fetchTeamData();

        setOpenMenu(null);
    };

    const removeMember = async (
        memberId
    ) => {

        if (
            memberId ===
            currentUserId
        ) {

            alert(
                "You can't remove yourself"
            );

            return;
        }

        const confirmed =
            window.confirm(
                'Remove this member?'
            );

        if (!confirmed) return;

        const { error } =
            await supabase
                .from(
                    'organization_members'
                )
                .delete()
                .eq(
                    'organization_id',
                    orgId
                )
                .eq(
                    'user_id',
                    memberId
                );

        if (error) {

            alert(error.message);

            return;
        }

        fetchTeamData();

        setOpenMenu(null);
    };

    const getInitials = (
        name
    ) => {

        if (!name) return '??';

        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const filteredMembers =
        members.filter(
            (m) =>
                m.profiles?.full_name
                    ?.toLowerCase()
                    .includes(
                        searchQuery.toLowerCase()
                    ) ||
                m.profiles?.email
                    ?.toLowerCase()
                    .includes(
                        searchQuery.toLowerCase()
                    )
        );

    const getRoleLabel = (
        role
    ) => {

        if (
            role ===
            'owner'
        ) {
            return 'Super Admin';
        }

        if (
            role ===
            'admin'
        ) {
            return 'Admin';
        }

        return 'Member';
    };

    return (
        <div className="team-page">

            <style>{`
                .team-page {
                    padding: 40px;
                    font-family: 'Inter', sans-serif;
                    background: #010D2C;
                    min-height: 100vh;
                    color: #ffffff;
                }

                .team-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                }

                .team-header h1 {
                    color: #ffffff;
                    font-size: 32px;
                    font-weight: 800;
                    margin: 0;
                }

                .controls-row {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 32px;
                }

                .search-bar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #0a1936;
                    padding: 12px 20px;
                    border-radius: 16px;
                    border: 1.5px solid rgba(255, 255, 255, 0.05);
                    flex: 1;
                    max-width: 400px;
                }

                .search-bar input {
                    border: none;
                    outline: none;
                    width: 100%;
                    font-size: 14px;
                    font-weight: 500;
                    background: transparent;
                    color: white;
                }

                .invite-btn {
                    background: #002B72;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 16px;
                    border: none;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .invite-btn:hover {
                    background: #001f54;
                    transform: translateY(-2px);
                }

                .team-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 24px;
                }

                .team-card {
                    background: #0a1936;
                    border-radius: 32px;
                    padding: 32px;
                    position: relative;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    transition: all 0.3s;
                    text-align: center;
                }

                .team-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
                    border-color: #002B72;
                }

                .card-options {
                    position: absolute;
                    top: 24px;
                    right: 24px;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 50%;
                    color: #64748b;
                }
                
                .card-options:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }

                .dropdown-menu {
                    position: absolute;
                    top: 56px;
                    right: 24px;
                    width: 180px;
                    background: #0a1936;
                    border-radius: 16px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    z-index: 100;
                }

                .dropdown-item {
                    padding: 14px 18px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #cbd5e1;
                }

                .dropdown-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }

                .dropdown-item.danger {
                    color: #ef4444;
                }

                .avatar-container {
                    width: 100px;
                    height: 100px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    font-weight: 900;
                    color: #ffffff;
                    margin: 0 auto 24px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .member-name {
                    font-size: 24px;
                    font-weight: 900;
                    color: #ffffff;
                    margin-bottom: 8px;
                }

                .member-email {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-size: 14px;
                    color: #94a3b8;
                    margin-bottom: 20px;
                }

                .role-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(59, 130, 246, 0.1);
                    color: #3b82f6;
                    padding: 8px 16px;
                    border-radius: 999px;
                    font-size: 13px;
                    font-weight: 800;
                    margin-bottom: 32px;
                }

                .card-divider {
                    width: 100%;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.05);
                    margin-bottom: 24px;
                }

                .stats-container {
                    display: grid;
                    grid-template-columns: 1fr 1px 1fr;
                    align-items: center;
                }

                .stat-box {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .stat-label {
                    font-size: 11px;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                }

                .stat-value {
                    font-size: 22px;
                    font-weight: 900;
                    color: #ffffff;
                }

                .stat-divider {
                    width: 1px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.05);
                }
            `}</style>

            <div className="team-header">

                <div>
                    <h1>
                        Team Members
                    </h1>

                    <p
                        style={{
                            color:
                                '#64748b'
                        }}
                    >
                        Manage team and
                        permissions
                    </p>
                </div>

                <button className="invite-btn">
                    <Plus size={20} />
                    Invite Member
                </button>
            </div>

            <div className="controls-row">

                <div className="search-bar">

                    <Search
                        size={18}
                        color="#94a3b8"
                    />

                    <input
                        placeholder="Search..."
                        value={
                            searchQuery
                        }
                        onChange={(e) =>
                            setSearchQuery(
                                e.target.value
                            )
                        }
                    />
                </div>
            </div>

            {loading ? (

                <div
                    style={{
                        padding:
                            '100px',
                        textAlign:
                            'center'
                    }}
                >
                    Loading...
                </div>

            ) : (

                <div className="team-grid">

                    {filteredMembers.map(
                        (
                            member,
                            idx
                        ) => (

                            <div
                                key={idx}
                                className="team-card"
                            >

                                {/* MENU */}

                                {currentUserRole ===
                                    'owner' && (
                                        <div
                                            ref={
                                                menuRef
                                            }
                                        >

                                            <div
                                                className="card-options"
                                                onClick={() =>
                                                    setOpenMenu(
                                                        openMenu ===
                                                            idx
                                                            ? null
                                                            : idx
                                                    )
                                                }
                                            >
                                                <MoreVertical
                                                    size={
                                                        20
                                                    }
                                                />
                                            </div>

                                            {openMenu ===
                                                idx && (
                                                    <div className="dropdown-menu">

                                                        {member.role !==
                                                            'admin' &&
                                                            member.role !==
                                                            'owner' && (
                                                                <div
                                                                    className="dropdown-item"
                                                                    onClick={() =>
                                                                        updateRole(
                                                                            member.user_id,
                                                                            'admin'
                                                                        )
                                                                    }
                                                                >
                                                                    <ShieldCheck
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                    Make
                                                                    Admin
                                                                </div>
                                                            )}

                                                        {member.role ===
                                                            'admin' && (
                                                                <div
                                                                    className="dropdown-item"
                                                                    onClick={() =>
                                                                        updateRole(
                                                                            member.user_id,
                                                                            'member'
                                                                        )
                                                                    }
                                                                >
                                                                    <User
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                    Make
                                                                    Member
                                                                </div>
                                                            )}

                                                        {member.role !==
                                                            'owner' && (
                                                                <div
                                                                    className="dropdown-item danger"
                                                                    onClick={() =>
                                                                        removeMember(
                                                                            member.user_id
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                    Remove
                                                                    User
                                                                </div>
                                                            )}
                                                    </div>
                                                )}
                                        </div>
                                    )}

                                <div className="avatar-container">
                                    {getInitials(
                                        member
                                            .profiles
                                            ?.full_name
                                    )}
                                </div>

                                <h3 className="member-name">
                                    {member
                                        .profiles
                                        ?.full_name ||
                                        'New Member'}
                                </h3>

                                <div className="member-email">
                                    <Mail
                                        size={
                                            14
                                        }
                                    />
                                    {
                                        member
                                            .profiles
                                            ?.email
                                    }
                                </div>

                                <div className="role-badge">

                                    {member.role ===
                                        'owner' ? (
                                        <Crown
                                            size={
                                                14
                                            }
                                        />
                                    ) : (
                                        <ShieldCheck
                                            size={
                                                14
                                            }
                                        />
                                    )}

                                    {getRoleLabel(
                                        member.role
                                    )}
                                </div>

                                <div className="card-divider"></div>

                                <div className="stats-container">

                                    <div className="stat-box">
                                        <div className="stat-label">
                                            Posts
                                        </div>

                                        <div className="stat-value">
                                            {
                                                member.postCount
                                            }
                                        </div>
                                    </div>

                                    <div className="stat-divider"></div>

                                    <div className="stat-box">
                                        <div className="stat-label">
                                            Quiz
                                            Q's
                                        </div>

                                        <div className="stat-value">
                                            {
                                                member.quizCount
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default Team;