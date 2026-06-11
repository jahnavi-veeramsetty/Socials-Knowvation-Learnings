import React from 'react';
import { BookOpen } from 'lucide-react';

const BlogOverview = ({ blogs, today, orgId }) => {
    // Strip time from today to compare dates properly
    const todayDate = new Date(today);
    todayDate.setHours(0, 0, 0, 0);

    const upcomingBlogs = blogs
        .filter(b => {
            if (!b.scheduled_date) return false;
            const scheduledDate = new Date(b.scheduled_date);
            scheduledDate.setHours(0,0,0,0);
            return scheduledDate >= todayDate && (b.status === 'approved' || b.status === 'pending review');
        })
        .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));

    return (
        <div className="mt-12 mb-8">
            <h2 className="text-xl font-extrabold text-slate-900 mb-6">Blog Overview</h2>
            <div className="bg-light-card p-6 rounded-3xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <h4 className="m-0 text-base font-extrabold text-slate-900">Upcoming Blogs</h4>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">Blogs that need to be posted on their scheduled dates</p>
                    </div>
                </div>
                
                {upcomingBlogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingBlogs.map(blog => (
                            <div
                                key={blog.id}
                                className="flex flex-col gap-2 p-4 bg-white rounded-2xl border border-slate-200 transition-all duration-200 cursor-pointer hover:bg-slate-50 hover:border-indigo-200 hover:shadow-sm"
                                onClick={() => window.open(`/org/${orgId}/blogs/create?id=${blog.id}`, '_blank')}
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <span className="font-extrabold text-slate-900 text-sm line-clamp-1">{blog.title || 'Untitled Blog'}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${blog.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {blog.status === 'approved' ? 'Approved' : 'Pending'}
                                    </span>
                                </div>
                                <div className="text-[12px] text-slate-500 font-semibold mt-1">
                                    Scheduled for: <span className="text-slate-700">{new Date(blog.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-sm font-semibold text-slate-500 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        No upcoming blogs scheduled.
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogOverview;
