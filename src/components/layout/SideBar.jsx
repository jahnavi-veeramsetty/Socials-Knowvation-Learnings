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

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            navigate('/login');
        }
    };

    const menuItems = [
        { name: 'Dashboard', path: `/org/${orgId}/dashboard`, icon: <LayoutDashboard size={18} /> },
        { name: 'Content Calendar', path: `/org/${orgId}/calendar`, icon: <CalendarDays size={18} /> },
        { name: 'Posts', path: `/org/${orgId}/posts`, icon: <Send size={18} /> },
        { name: 'Quiz Bank', path: `/org/${orgId}/quiz`, icon: <BrainCircuit size={18} /> },
        { name: 'Team', path: `/org/${orgId}/team`, icon: <Users size={18} /> },
        { name: 'Settings', path: `/org/${orgId}/settings`, icon: <Settings size={18} /> },
    ];

    const socialItems = [
        { name: 'KLM', path: `/org/${orgId}/socials/klm` },
        { name: 'KLS', path: `/org/${orgId}/socials/kls` },
        { name: 'KLC', path: `/org/${orgId}/socials/klc` },
    ];

    return (
        <aside className="sidebar">
            <style>{`
                .sidebar {
                    width: 230px;
                    background: white;
                    border-right: 1px solid #f1f5f9;
                    display: flex;
                    flex-direction: column;
                    padding: 28px 12px;
                    font-family: 'Inter', sans-serif;
                    height: 100vh;
                    position: sticky;
                    top: 0;
                }

                .sidebar-logo {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 32px;
                    padding: 0 10px;
                }

                .logo-img {
                    height: 26px;
                    object-fit: contain;
                }

                .toggle-icon {
                    color: #94a3b8;
                    cursor: pointer;
                    transition: color 0.2s;
                }

                .toggle-icon:hover {
                    color: #002B72;
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
                    gap: 10px;
                    padding: 10px 14px;
                    border-radius: 12px;
                    color: #64748b;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 13px;
                    transition: all 0.2s;
                    border: none;
                    background: transparent;
                    width: 100%;
                    cursor: pointer;
                    text-align: left;
                }

                .nav-link:hover {
                    background: #f7f9fc;
                    color: #002B72;
                }

                .nav-link.active {
                    background: rgba(0, 43, 114, 0.06);
                    color: #002B72;
                }

                .dropdown-trigger {
                    justify-content: space-between;
                }

                .dropdown-content {
                    margin-top: 4px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    padding-left: 12px;
                    animation: slideDown 0.2s ease-out;
                }

                .sub-nav-link {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 14px;
                    border-radius: 8px;
                    color: #777;
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 13px;
                    transition: all 0.2s;
                }

                .sub-nav-link:hover {
                    background: #f7f9fc;
                    color: #002B72;
                }

                .sub-nav-link.active {
                    color: #002B72;
                    background: rgba(0, 43, 114, 0.04);
                    font-weight: 600;
                }

                .sidebar-footer {
                    margin-top: auto;
                    padding-top: 24px;
                    border-top: 1px solid #f0f0f0;
                }

                .logout-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 14px;
                    border-radius: 10px;
                    color: #ff4d4f;
                    background: transparent;
                    border: none;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .logout-btn:hover {
                    background: #fff1f0;
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div className="sidebar-logo">
                <img src={logo} alt="Knowvation" className="logo-img" />
                <PanelLeft size={20} className="toggle-icon" />
            </div>

            <nav>
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Share2 size={18} />
                                <span>Socials</span>
                            </div>
                            {socialsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        
                        {socialsOpen && (
                            <div className="dropdown-content">
                                {socialItems.map((item) => (
                                    <NavLink 
                                        key={item.name} 
                                        to={item.path} 
                                        className={({ isActive }) => `sub-nav-link ${isActive ? 'active' : ''}`}
                                    >
                                        <Hash size={14} />
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
                    <LogOut size={18} />
                    <span>Log Out</span>
                </button>
            </div>
        </aside>
    );
};

export default SideBar;
