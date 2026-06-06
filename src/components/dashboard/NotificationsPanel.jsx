import React from 'react';
import { X, CheckCircle, AlertCircle, Layout } from 'lucide-react';

const NotificationsPanel = ({ isOpen, onClose, activities }) => {
    // Re-using the same icon logic from Dashboard for consistency
    const getActivityIcon = (type) => {
        if (type === 'approve') return <CheckCircle size={18} />;
        if (type === 'reject') return <AlertCircle size={18} />;
        return <Layout size={18} />;
    };

    const getActivityStyle = (type) => {
        if (type === 'approve') return { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
        if (type === 'reject') return { background: 'rgba(239, 68, 68, 0.1)', color: '#ff4d4f' };
        return { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[2000] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>

            {/* Panel */}
            <div 
                className={`fixed top-0 right-0 h-full w-[400px] max-w-full bg-white shadow-2xl z-[2001] transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-extrabold text-slate-900 m-0">Notifications</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-none cursor-pointer transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {activities && activities.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {activities.map((item, idx) => (
                                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand hover:shadow-sm transition-all duration-200">
                                    <div className="flex-col items-center shrink-0">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={getActivityStyle(item.action_type)}>
                                            {getActivityIcon(item.action_type)}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-extrabold text-slate-900 truncate">
                                            {item.profiles?.full_name || item.profiles?.email || 'Unknown User'}
                                        </div>
                                        <div className="text-sm text-slate-600 mt-1 leading-snug">
                                            {item.action_text}
                                            {item.posts && (
                                                <span className="inline-flex items-center py-0.5 px-2 bg-white rounded text-xs font-bold text-brand ml-1 border border-brand/20">
                                                    {item.posts.title}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-400 font-semibold mt-2">
                                            {new Date(item.created_at).toLocaleString(undefined, {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center px-4">
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-300">
                                <Layout size={32} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mb-1">No Notifications Yet</h3>
                            <p className="text-sm text-slate-500 m-0">When your team members take actions, they will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationsPanel;
