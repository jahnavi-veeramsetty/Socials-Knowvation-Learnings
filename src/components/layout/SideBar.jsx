import React, { useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { supabase } from '../../supabase/supabase';
import {
    LayoutDashboard,
    CalendarDays,
    Send,
    BrainCircuit,
    Users,
    Settings,
    LogOut,
    Share2,
    ChevronDown,
    ChevronUp,
    Hash,
    PanelLeft
} from 'lucide-react';

const SideBar = () => {
    const { orgId } = useParams();
    const navigate = useNavigate();
    const [socialsOpen, setSocialsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            navigate('/login');
        }
    };

    const menuItems = [
        { name: 'Dashboard', path: `/org/${orgId}/dashboard`, icon: <LayoutDashboard size={22} style={{ flexShrink: 0 }} /> },
        { name: 'Content Calendar', path: `/org/${orgId}/calendar`, icon: <CalendarDays size={22} style={{ flexShrink: 0 }} /> },
        { name: 'Posts', path: `/org/${orgId}/posts`, icon: <Send size={22} style={{ flexShrink: 0 }} /> },
        { name: 'Quiz Bank', path: `/org/${orgId}/quiz`, icon: <BrainCircuit size={22} style={{ flexShrink: 0 }} /> },
        { name: 'Team', path: `/org/${orgId}/team`, icon: <Users size={22} style={{ flexShrink: 0 }} /> },
        { name: 'Settings', path: `/org/${orgId}/settings`, icon: <Settings size={22} style={{ flexShrink: 0 }} /> },
    ];

    const socialItems = [
        { name: 'KLM', path: `/org/${orgId}/socials/klm` },
        { name: 'KLS', path: `/org/${orgId}/socials/kls` },
        { name: 'KLC', path: `/org/${orgId}/socials/klc` },
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <style>{`
                .sidebar {
                    width: 250px;
                    background: #01081a;
                    border-right: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    flex-direction: column;
                    padding: 24px 12px;
                    font-family: 'Inter', sans-serif;
                    height: 100vh;
                    position: sticky;
                    top: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 1000;
                }

                .sidebar.collapsed {
                    width: 80px;
                    padding: 24px 10px;
                }

                .sidebar-logo {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 32px;
                    padding: 0 10px;
                    min-height: 66px;
                    transition: all 0.3s;
                    flex-shrink: 0;
                }

                .sidebar.collapsed .sidebar-logo {
                    padding: 0;
                    justify-content: center;
                }

                .logo-img {
                    height: 66px;
                    object-fit: contain;
                    filter: brightness(0) invert(1);
                    transition: opacity 0.2s, width 0.3s;
                    width: auto;
                }

                .sidebar.collapsed .logo-img {
                    opacity: 0;
                    width: 0;
                    pointer-events: none;
                    margin: 0;
                }

                .toggle-icon {
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .toggle-icon:hover {
                    color: white;
                }

                .sidebar-nav {
                    flex: 1;
                    overflow-y: auto;
                    padding-right: 4px;
                    margin-right: -4px;
                }

                /* Hide scrollbar */
                .sidebar-nav::-webkit-scrollbar {
                    width: 0;
                    background: transparent;
                }
                .sidebar-nav {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }

                .nav-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .nav-item {
                    width: 100%;
                }

                .nav-link {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 14px;
                    border-radius: 12px;
                    color: #94a3b8;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 14px;
                    transition: all 0.2s;
                    border: none;
                    background: transparent;
                    width: 100%;
                    cursor: pointer;
                    text-align: left;
                    white-space: nowrap;
                }

                .sidebar.collapsed .nav-link {
                    padding: 10px 14px;
                    justify-content: flex-start;
                }

                .nav-link:hover {
                    background: rgba(255, 255, 255, 0.04);
                    color: white;
                }

                .nav-link.active {
                    background: #002B72;
                    color: white;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                }

                .nav-link span {
                    transition: opacity 0.2s, transform 0.2s;
                }

                .sidebar.collapsed .nav-link span,
                .sidebar.collapsed .chevron-icon {
                    opacity: 0;
                    transform: translateX(-10px);
                    pointer-events: none;
                    width: 0;
                    overflow: hidden;
                }

                .dropdown-trigger {
                    justify-content: space-between;
                }

                .dropdown-content {
                    margin-top: 4px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    padding-left: 16px;
                    animation: slideDown 0.2s ease-out;
                }

                .sidebar.collapsed .dropdown-content {
                    display: none;
                }

                .sub-nav-link {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 14px;
                    border-radius: 10px;
                    color: #64748b;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 13px;
                    transition: all 0.2s;
                }

                .sub-nav-link:hover {
                    background: rgba(255, 255, 255, 0.03);
                    color: white;
                }

                .sub-nav-link.active {
                    color: white;
                    background: rgba(255, 255, 255, 0.05);
                }

                .sidebar-footer {
                    margin-top: auto;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    flex-shrink: 0;
                }

                .logout-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 14px;
                    border-radius: 10px;
                    color: #ef4444;
                    background: transparent;
                    border: none;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .logout-btn:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: #f87171;
                }

                .sidebar.collapsed .logout-btn span {
                    opacity: 0;
                    pointer-events: none;
                    width: 0;
                    overflow: hidden;
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div className="sidebar-logo">
                <img src={logo} alt="Knowvation" className="logo-img" />
                <PanelLeft
                    size={22}
                    className="toggle-icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                />
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {menuItems.map((item) => (
                        <li key={item.name} className="nav-item">
                            <NavLink to={item.path} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                {item.icon}
                                <span>{item.name}</span>
                            </NavLink>
                        </li>
                    ))}

                    {/* Socials Dropdown */}
                    <li className="nav-item">
                        <button
                            className={`nav-link dropdown-trigger ${socialsOpen ? 'active' : ''}`}
                            onClick={() => setSocialsOpen(!socialsOpen)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Share2 size={22} style={{ flexShrink: 0 }} />
                                <span>Socials</span>
                            </div>
                            <div className="chevron-icon">
                                {socialsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                        </button>

                        {socialsOpen && (
                            <div className="dropdown-content">
                                {socialItems.map((item) => (
                                    <NavLink
                                        key={item.name}
                                        to={item.path}
                                        className={({ isActive }) => `sub-nav-link ${isActive ? 'active' : ''}`}
                                    >
                                        <Hash size={18} style={{ flexShrink: 0 }} />
                                        <span>{item.name}</span>
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={22} style={{ flexShrink: 0 }} />
                    <span>Log Out</span>
                </button>
            </div>
        </aside>
    );
};

export default SideBar;
