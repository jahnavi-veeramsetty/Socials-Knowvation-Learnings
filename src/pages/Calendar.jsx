import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    CheckCircle,
    ShieldCheck,
    Search,
    Layout,
    Link as LinkIcon,
    Film,
    Layers,
    Smartphone
} from 'lucide-react';
import { supabase } from '../supabase/supabase';

const Calendar = () => {
    const { orgId } = useParams();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [brandColors, setBrandColors] = useState({
        KLM: '#002B72',
        KLS: '#4f46e5',
        KLC: '#0ea5e9'
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [socialFilter, setSocialFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        fetchApprovedPosts();
        fetchBrandSettings();
    }, [orgId, currentDate]);

    const fetchBrandSettings = async () => {
        const { data, error } = await supabase
            .from('organizations')
            .select('brand_colors')
            .eq('id', orgId)
            .single();

        if (data?.brand_colors) {
            setBrandColors(data.brand_colors);
        }
    };

    const fetchApprovedPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('posts')
            .select('*, profiles:created_by(full_name, email)')
            .eq('organization_id', orgId)
            .eq('status', 'approved');

        if (!error) {
            setPosts(data || []);
        }
        setLoading(false);
    };

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Generate calendar grid
    const calendarDays = [];
    // Padding for start of month
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i);
    }

    const getPostsForDate = (day) => {
        if (!day) return [];
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        return posts.filter(p => {
            const matchesDate = p.scheduled_date === dateStr;
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSocial = socialFilter === 'all' || p.social_account === socialFilter;
            const matchesType = typeFilter === 'all' || p.post_type === typeFilter;

            return matchesDate && matchesSearch && matchesSocial && matchesType;
        });
    };

    const today = new Date();
    const isToday = (day) => {
        return year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
    };

    return (
        <div className="calendar-page">
            <style>{`
                .calendar-page {
                    padding: 32px 48px;
                    font-family: 'Inter', sans-serif;
                    background: #010D2C;
                    min-height: 100vh;
                    color: #ffffff;
                }
                .calendar-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 32px;
                    gap: 32px;
                }
                .header-main {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    flex: 1;
                }
                .header-top {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .header-top h1 {
                    color: #ffffff;
                    font-size: 32px;
                    font-weight: 900;
                    margin: 0;
                    letter-spacing: -1px;
                }
                .filter-bar {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    background: #0a1936;
                    padding: 8px;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                    width: fit-content;
                }
                .search-wrapper {
                    position: relative;
                    width: 240px;
                }
                .search-input {
                    width: 100%;
                    padding: 10px 16px 10px 40px;
                    border-radius: 12px;
                    border: 1px solid transparent;
                    background: rgba(255, 255, 255, 0.05);
                    font-size: 14px;
                    font-weight: 600;
                    outline: none;
                    transition: all 0.2s;
                    color: white;
                }
                .search-input:focus {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: #002B72;
                }
                .search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #64748b;
                }
                .brand-legend {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 16px;
                    justify-content: flex-end;
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                    font-weight: 800;
                    padding: 6px 14px;
                    border-radius: 10px;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                }
                .legend-item:hover {
                    transform: translateY(-1px);
                    filter: brightness(1.1);
                }
                .legend-marker {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                }
                .right-side-header {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }
                .filter-select {
                    padding: 10px 16px;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    font-size: 13px;
                    font-weight: 700;
                    color: #cbd5e1;
                    background: #0a1936;
                    outline: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .filter-select:hover {
                    border-color: #002B72;
                    color: white;
                }
                .month-nav {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #0a1936;
                    padding: 8px;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                }
                .month-nav h2 {
                    font-size: 16px;
                    font-weight: 800;
                    color: #ffffff;
                    margin: 0;
                    padding: 0 16px;
                    min-width: 140px;
                    text-align: center;
                }
                .nav-btn {
                    background: transparent;
                    border: none;
                    color: #64748b;
                    padding: 8px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .nav-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }
                .calendar-container {
                    background: #0a1936;
                    border-radius: 32px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                }
                .days-header {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    background: rgba(255, 255, 255, 0.02);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .day-label {
                    padding: 20px;
                    text-align: center;
                    font-size: 11px;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }
                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                }
                .calendar-day {
                    min-height: 140px;
                    padding: 14px;
                    border-right: 1px solid rgba(255, 255, 255, 0.05);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    position: relative;
                    transition: all 0.2s;
                    background: #0a1936;
                }
                .calendar-day:nth-child(7n) {
                    border-right: none;
                }
                .calendar-day:hover {
                    background: rgba(255, 255, 255, 0.02);
                    z-index: 10;
                }
                .day-number {
                    font-size: 13px;
                    font-weight: 800;
                    color: #64748b;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    margin-bottom: 12px;
                    transition: all 0.2s;
                }
                .calendar-day:hover .day-number {
                    color: #ffffff;
                    background: rgba(255, 255, 255, 0.05);
                }
                .day-number.is-today {
                    background: #002B72;
                    color: white;
                    box-shadow: 0 4px 12px rgba(0, 43, 114, 0.4);
                }
                .day-posts {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .post-indicator {
                    padding: 6px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .post-indicator:hover {
                    transform: translateY(-2px);
                    background: rgba(255, 255, 255, 0.1);
                    filter: brightness(1.2);
                }
                .platform-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.8;
                }
                .empty-day {
                    background: rgba(0, 0, 0, 0.1);
                }
            `}</style>

            <div className="calendar-header">
                <div className="header-main">
                    <div className="header-top">
                        <CalendarIcon size={32} color="#002B72" />
                        <h1>Content Calendar</h1>
                    </div>

                    <div className="filter-bar">
                        <div className="search-wrapper">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search posts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <select
                            className="filter-select"
                            value={socialFilter}
                            onChange={(e) => setSocialFilter(e.target.value)}
                        >
                            <option value="all">All Accounts</option>
                            <option value="KLM">KL Main</option>
                            <option value="KLS">KL Select</option>
                            <option value="KLC">KL Community</option>
                        </select>

                        <select
                            className="filter-select"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="reel">Reel</option>
                            <option value="story">Story</option>
                            <option value="carousel">Carousel</option>
                        </select>
                    </div>
                </div>

                <div className="right-side-header">
                    <div className="brand-legend">
                        {['KLM', 'KLS', 'KLC'].map(acc => {
                            const color = brandColors[acc] || '#002B72';
                            const label = acc === 'KLM' ? 'KL Main' : acc === 'KLS' ? 'KL Select' : 'KL Community';
                            return (
                                <div
                                    key={acc}
                                    className="legend-item"
                                    style={{
                                        background: `${color}10`,
                                        borderColor: `${color}30`,
                                        color: color
                                    }}
                                >
                                    <div className="legend-marker" style={{ background: color }}></div>
                                    {label}
                                </div>
                            );
                        })}
                    </div>

                    <div className="month-nav">
                        <button className="nav-btn" onClick={prevMonth}><ChevronLeft size={20} /></button>
                        <h2>{monthNames[month]} {year}</h2>
                        <button className="nav-btn" onClick={nextMonth}><ChevronRight size={20} /></button>
                    </div>
                </div>
            </div>

            <div className="calendar-container">
                <div className="days-header">
                    {days.map(d => <div key={d} className="day-label">{d}</div>)}
                </div>

                <div className="calendar-grid">
                    {calendarDays.map((day, idx) => {
                        const dayPosts = getPostsForDate(day);
                        return (
                            <div key={idx} className={`calendar-day ${!day ? 'empty-day' : ''}`}>
                                {day && (
                                    <>
                                        <span className={`day-number ${isToday(day) ? 'is-today' : ''}`}>
                                            {day}
                                        </span>
                                        <div className="day-posts">
                                            {getPostsForDate(day).map(post => {
                                                const color = brandColors[post.social_account] || '#002B72';

                                                const getIcon = () => {
                                                    const type = post.post_type?.toLowerCase() || '';
                                                    if (type.includes('reel')) return <Film size={14} />;
                                                    if (type.includes('carousel')) return <Layers size={14} />;
                                                    if (type.includes('story')) return <Smartphone size={14} />;
                                                    return <Layout size={14} />;
                                                };

                                                return (
                                                    <div
                                                        key={post.id}
                                                        className={`post-indicator ${post.social_account}`}
                                                        style={{
                                                            background: `${color}10`, // 10% opacity hex
                                                            borderColor: `${color}40`, // 25% opacity hex
                                                            color: color
                                                        }}
                                                        onClick={() => window.open(`/org/${orgId}/posts/create?id=${post.id}`, '_blank')}
                                                        title={post.title}
                                                    >
                                                        <span className="platform-icon">{getIcon()}</span>
                                                        <span style={{ textTransform: 'capitalize' }}>
                                                            {post.post_type}: {post.title}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Calendar;
