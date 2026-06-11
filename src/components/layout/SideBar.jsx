import React, { useState, useEffect } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { supabase } from '../../supabase/supabase';
import {
    LayoutDashboard,
    CalendarDays,
    Images,
    Film,
    BrainCircuit,
    Settings,
    LogOut,
    PanelLeft,
    BookOpen,
    CheckCircle
} from 'lucide-react';

const SideBar = () => {
    const { orgId } = useParams();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar_collapsed');
        return saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', isCollapsed);
    }, [isCollapsed]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) navigate('/login');
    };

    const menuItems = [
        { name: 'Dashboard', path: `/org/${orgId}/dashboard`, icon: <LayoutDashboard size={22} className="shrink-0" /> },
        { name: 'Content Calendar', path: `/org/${orgId}/calendar`, icon: <CalendarDays size={22} className="shrink-0" /> },
        { name: 'Carousels', path: `/org/${orgId}/carousels`, icon: <Images size={22} className="shrink-0" /> },
        { name: 'Reels', path: `/org/${orgId}/reels`, icon: <Film size={22} className="shrink-0" /> },
        { name: 'Blogs', path: `/org/${orgId}/blogs`, icon: <BookOpen size={22} className="shrink-0" /> },
        { name: 'Published', path: `/org/${orgId}/published`, icon: <CheckCircle size={22} className="shrink-0" /> },
        { name: 'Settings', path: `/org/${orgId}/settings`, icon: <Settings size={22} className="shrink-0" /> },
    ];

    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-3 py-2.5 px-3.5 rounded-xl no-underline font-semibold text-sm transition-all duration-200 border-none cursor-pointer text-left whitespace-nowrap w-full ${isActive
            ? 'bg-brand text-white shadow-[0_4px_15px_rgba(0,0,0,0.3)]'
            : 'bg-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-900'
        }`;

    return (
        <aside
            className={`bg-light-sidebar border-r border-slate-200 flex flex-col py-6 font-sans h-screen sticky top-0 transition-all duration-300 z-[1000] ${isCollapsed ? 'w-20 px-2.5' : 'w-[250px] px-3'
                }`}
        >
            {/* Logo Row */}
            <div className={`flex items-center min-h-[66px] mb-8 shrink-0 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'}`}>
                <img
                    src={logo}
                    alt="Knowvation"
                    className={`h-[66px] object-contain brightness-0 invert transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 pointer-events-none m-0' : 'w-auto opacity-100'}`}
                />
                <PanelLeft
                    size={22}
                    className="text-slate-500 cursor-pointer shrink-0 transition-colors duration-200 hover:text-slate-900"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                />
            </div>

            {/* Navigation */}
            <nav className={`flex-1 pr-1 -mr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
                <ul className="list-none p-0 m-0 flex flex-col gap-1.5">
                    {menuItems.map(item => (
                        <li key={item.name} className="w-full relative group">
                            <NavLink to={item.path} className={navLinkClass}>
                                {item.icon}
                                <span
                                    className={`transition-all duration-200 ${isCollapsed ? 'opacity-0 -translate-x-2.5 pointer-events-none w-0 overflow-hidden' : 'opacity-100'}`}
                                >
                                    {item.name}
                                </span>
                            </NavLink>
                            {isCollapsed && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                                    {item.name}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="mt-auto pt-5 border-t border-slate-200 shrink-0 relative group">
                <button
                    className="w-full flex items-center gap-3 py-3 px-3.5 rounded-xl text-red-400 bg-transparent border-none font-bold text-sm cursor-pointer transition-all duration-200 whitespace-nowrap hover:bg-red-400/10 hover:text-[#f87171]"
                    onClick={handleLogout}
                >
                    <LogOut size={22} className="shrink-0" />
                    <span
                        className={`transition-all duration-200 ${isCollapsed ? 'opacity-0 pointer-events-none w-0 overflow-hidden' : 'opacity-100'}`}
                    >
                        Log Out
                    </span>
                </button>
                {isCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                        Log Out
                    </div>
                )}
            </div>
        </aside>
    );
};

export default SideBar;
