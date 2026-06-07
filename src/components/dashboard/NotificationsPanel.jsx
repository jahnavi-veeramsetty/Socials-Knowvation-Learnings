import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Bell, MessageSquare, Circle } from 'lucide-react';
import { supabase } from '../../supabase/supabase';
import { useNavigate } from 'react-router-dom';

const NotificationsPanel = ({ isOpen, onClose, orgId, userId, onNotificationRead }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && userId && orgId) {
            fetchNotifications();
        }
    }, [isOpen, userId, orgId]);

    const fetchNotifications = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('notifications')
            .select(`
                *,
                post:post_id(title)
            `)
            .eq('organization_id', orgId)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            // Fetch actor profiles manually
            const actorIds = [...new Set(data.map(n => n.actor_id).filter(Boolean))];
            if (actorIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, email')
                    .in('id', actorIds);
                
                if (profiles) {
                    const profileMap = profiles.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
                    const enrichedData = data.map(n => ({
                        ...n,
                        actor: profileMap[n.actor_id]
                    }));
                    setNotifications(enrichedData);
                    setLoading(false);
                    return;
                }
            }
            setNotifications(data);
        }
        setLoading(false);
    };

    const markAsRead = async (id, e) => {
        e.stopPropagation();
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        fetchNotifications();
        if (onNotificationRead) onNotificationRead();
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.is_read) {
            await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);
            if (onNotificationRead) onNotificationRead();
        }
        onClose();
        navigate(`/org/${orgId}/posts/create?id=${notif.post_id}`);
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
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <span className="text-slate-500 font-semibold text-sm">Loading...</span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-4">
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-brand">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mb-1">You're all caught up!</h3>
                            <p className="text-sm text-slate-500 m-0">You have no new notifications.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {notifications.map(notif => (
                                <div 
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                                        notif.is_read 
                                        ? 'bg-white border-slate-100 hover:bg-slate-50' 
                                        : 'bg-brand/5 border-brand/20 hover:bg-brand/10'
                                    }`}
                                >
                                    <div className="flex gap-4 items-start">
                                        <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${notif.is_read ? 'bg-slate-100 text-slate-500' : 'bg-brand text-white'}`}>
                                            {notif.type === 'mention' ? <MessageSquare size={18} /> : <Bell size={18} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-900 m-0 leading-[1.5]">
                                                <span className="font-extrabold">{notif.actor?.full_name || notif.actor?.email || 'Someone'}</span>{' '}
                                                {notif.content}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-2 font-semibold">
                                                {new Date(notif.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notif.is_read && (
                                            <button 
                                                onClick={(e) => markAsRead(notif.id, e)}
                                                className="p-1.5 shrink-0 rounded-full text-brand hover:bg-brand hover:text-white transition-colors border-none bg-brand/10 cursor-pointer"
                                                title="Mark as read"
                                            >
                                                <CheckCircle size={14} />
                                            </button>
                                        )}
                                    </div>
                                    {!notif.is_read && (
                                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationsPanel;
