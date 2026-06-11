import React from 'react';
import { Calendar as CalendarIcon, Film, Layers, Smartphone, Layout, X } from 'lucide-react';

const WeeklySchedule = ({ weekDays, today, getPostsForDate, brandColors, orgId }) => {
    const getIcon = (type) => {
        const t = type?.toLowerCase() || '';
        if (t.includes('reel')) return <Film size={14} />;
        if (t.includes('carousel')) return <Layers size={14} />;
        if (t.includes('story')) return <Smartphone size={14} />;
        return <Layout size={14} />;
    };

    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isPast = (dateObj) => {
        return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()) < todayStart;
    };

    return (
        <div className="mt-10">
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-extrabold text-slate-900 m-0">Weekly Schedule</h2>
                <div className="text-sm font-semibold text-slate-500">
                    {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
            </div>

            <div className="grid grid-cols-7 gap-4">
                {weekDays.map((date, i) => {
                    const dayPosts = getPostsForDate(date);
                    const isToday = date.toDateString() === today.toDateString();
                    const pastDay = isPast(date);

                    return (
                        <div key={i} className={`relative bg-light-card rounded-[20px] border border-slate-200 min-h-[200px] flex flex-col overflow-hidden transition-all duration-200 ${pastDay ? 'opacity-60 grayscale cursor-default' : 'hover:border-slate-200 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]'}`}>
                            {pastDay && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] z-0">
                                    <X size={140} strokeWidth={1.5} className="mt-12" />
                                </div>
                            )}
                            <div className="relative z-10 p-3 bg-slate-50 border-b border-slate-200 flex flex-col items-center justify-center">
                                <div className={`text-[11px] font-extrabold uppercase tracking-[1px] ${isToday ? 'text-emerald-600' : 'text-slate-500'}`}>
                                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                                <div className={`mt-1 flex items-center justify-center w-8 h-8 rounded-xl text-base font-black transition-all duration-200 ${isToday ? 'bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.4)]' : 'text-slate-900'}`}>
                                    {date.getDate()}
                                </div>
                            </div>
                            <div className="relative z-10 p-3 flex flex-col gap-2 flex-1">
                                {dayPosts.length > 0 ? (
                                    dayPosts.map(post => {
                                        const color = brandColors[post.social_account] || '#002B72';
                                        return (
                                            <div
                                                key={post.id}
                                                className={`py-2 px-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border ${pastDay ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`}
                                                style={{ background: `${color}10`, borderColor: `${color}30`, color: color }}
                                                title={pastDay ? undefined : post.title}
                                                onClick={(e) => {
                                                    if (!pastDay) {
                                                        window.open(`/org/${orgId}/${post.post_type || 'reel'}s/create?id=${post.id}`, '_blank');
                                                    }
                                                }}
                                            >
                                                {getIcon(post.post_type)}
                                                <span className="whitespace-nowrap overflow-hidden text-ellipsis">{post.title || 'Untitled'}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2 opacity-50">
                                        <CalendarIcon size={16} />
                                        <span className="text-[10px] font-bold">Free</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WeeklySchedule;
