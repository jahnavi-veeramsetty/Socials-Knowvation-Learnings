import React from 'react';
import { Film, Layers, Smartphone, Layout, Clock } from 'lucide-react';

const AccountOverview = ({ posts, brandColors, today, weekRange, orgId }) => {
    const getIcon = (type) => {
        const t = type?.toLowerCase() || '';
        if (t.includes('reel')) return <Film size={14} />;
        if (t.includes('carousel')) return <Layers size={14} />;
        if (t.includes('story')) return <Smartphone size={14} />;
        return <Layout size={14} />;
    };

    return (
        <div className="mt-12">
            <h2 className="text-xl font-extrabold text-slate-900 mb-6">Account Overview</h2>

            <div className="grid grid-cols-3 gap-6">
                {['KLM', 'KLS', 'KLC'].map(acc => {
                    const color = brandColors[acc] || '#002B72';
                    const name = acc === 'KLM' ? 'KL Main' : acc === 'KLS' ? 'KL Select' : 'KL Community';

                    const accApprovedPosts = posts.filter(p => p.social_account === acc && p.status === 'approved');

                    const accPostsMonth = accApprovedPosts.filter(p => {
                        if (!p.scheduled_date) return false;
                        const d = new Date(p.scheduled_date);
                        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
                    }).length;

                    const accPostsWeek = accApprovedPosts.filter(p => {
                        if (!p.scheduled_date) return false;
                        const d = new Date(p.scheduled_date);
                        return d >= weekRange.start && d <= weekRange.end;
                    }).length;

                    const reelsCount = accApprovedPosts.filter(p => p.post_type?.toLowerCase().includes('reel')).length;
                    const carouselsCount = accApprovedPosts.filter(p => p.post_type?.toLowerCase().includes('carousel')).length;
                    const storiesCount = accApprovedPosts.filter(p => p.post_type?.toLowerCase().includes('story')).length;

                    const upcomingPosts = accApprovedPosts
                        .filter(p => new Date(p.scheduled_date) >= today)
                        .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
                        .slice(0, 3);

                    return (
                        <div key={acc} className="bg-light-card p-6 rounded-3xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-3 h-3 rounded-[4px]" style={{ background: color }}></div>
                                <h4 className="m-0 text-base font-extrabold text-slate-900">{name}</h4>
                            </div>
                            <div className="flex justify-between py-3 border-t border-slate-200">
                                <span className="text-[13px] font-semibold text-slate-500">This Month</span>
                                <span className="text-sm font-extrabold text-slate-900">{accPostsMonth} posts</span>
                            </div>
                            <div className="flex justify-between py-3 border-t border-slate-200">
                                <span className="text-[13px] font-semibold text-slate-500">This Week</span>
                                <span className="text-sm font-extrabold text-slate-900">{accPostsWeek} posts</span>
                            </div>

                            {(reelsCount > 0 || carouselsCount > 0 || storiesCount > 0) && (
                                <div className="mt-1 mb-2 flex flex-wrap gap-2">
                                    {reelsCount > 0 && (
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                                            <Film size={12} className="text-slate-400" />
                                            <span className="text-[11px] font-bold text-slate-600">{reelsCount} {reelsCount === 1 ? 'Reel' : 'Reels'}</span>
                                        </div>
                                    )}
                                    {carouselsCount > 0 && (
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                                            <Layers size={12} className="text-slate-400" />
                                            <span className="text-[11px] font-bold text-slate-600">{carouselsCount} {carouselsCount === 1 ? 'Carousel' : 'Carousels'}</span>
                                        </div>
                                    )}
                                    {storiesCount > 0 && (
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                                            <Smartphone size={12} className="text-slate-400" />
                                            <span className="text-[11px] font-bold text-slate-600">{storiesCount} {storiesCount === 1 ? 'Story' : 'Stories'}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-4 flex flex-col gap-2">
                                <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.5px] mb-1">Upcoming Content</div>
                                {upcomingPosts.length > 0 ? (
                                    upcomingPosts.map(post => (
                                        <div
                                            key={post.id}
                                            className="flex items-center gap-2 py-2 px-3 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200 transition-all duration-200 cursor-pointer hover:bg-slate-100 hover:text-slate-900"
                                            onClick={() => window.open(`/org/${orgId}/posts/create?id=${post.id}`, '_blank')}
                                        >
                                            {getIcon(post.post_type)}
                                            <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">{post.title || 'Untitled'}</span>
                                            <span className="text-[10px] text-slate-500 ml-auto">
                                                {new Date(post.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-[11px] text-slate-600 italic py-2">No upcoming posts</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AccountOverview;
