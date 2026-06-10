import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Save, Send, FileText, Link as LinkIcon, Info, Users, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import ImageUploadSection from '../components/posts/ImageUploadSection';
import DeleteBlogModal from '../components/blogs/DeleteBlogModal';
import { supabase } from '../supabase/supabase';
import Toast from '../components/common/Toast';

const CreateBlog = () => {
    const { orgId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const blogId = searchParams.get('id');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(blogId ? true : false);
    const [canEdit, setCanEdit] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [creatorName, setCreatorName] = useState(null);
    const [notification, setNotification] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [blogStatus, setBlogStatus] = useState(null);

    const [orgMembers, setOrgMembers] = useState([]);
    const [mentionQuery, setMentionQuery] = useState(null);
    const [mentionCursor, setMentionCursor] = useState(0);
    const notesRef = useRef(null);
    const backdropRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        cta: '',
        notes: '',
        scheduled_date: '',
        images: [],
        uploadedImages: [],
    });

    useEffect(() => { fetchInitialData(); }, [blogId]);

    const fetchInitialData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUserId(user.id);

        const { data: memberData } = await supabase
            .from('organization_members').select('role')
            .eq('organization_id', orgId).eq('user_id', user.id).single();
        const fetchedUserRole = memberData?.role;
        setUserRole(fetchedUserRole);

        const { data: memberDataList } = await supabase
            .from('organization_members').select('user_id')
            .eq('organization_id', orgId);
        
        if (memberDataList && memberDataList.length > 0) {
            const userIds = memberDataList.map(m => m.user_id);
            const { data: profilesList } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .in('id', userIds);
                
            if (profilesList) {
                setOrgMembers(profilesList.map(p => ({
                    id: p.id,
                    name: p.full_name || p.email?.split('@')[0] || 'Unknown'
                })));
            }
        }

        if (blogId) {
            setLoading(true);
            const { data } = await supabase
                .from('blogs').select(`*, profiles:created_by (full_name, email)`)
                .eq('id', blogId).single();

            if (data) {
                setFormData(prev => ({
                    ...prev,
                    title: data.title || '',
                    content: data.content || '',
                    cta: data.cta || '',
                    notes: data.notes || '',
                    scheduled_date: data.scheduled_date || '',
                    created_by: data.created_by,
                    uploadedImages: [],
                    images: [],
                }));
                const isCreator = data.created_by === user.id;
                const isAdmin = fetchedUserRole === 'admin' || fetchedUserRole === 'owner';
                setCanEdit(isCreator || isAdmin);
                setCreatorName(data.profiles?.full_name || data.profiles?.email || 'Unknown');
                setBlogStatus(data.status);
            }

            const { data: imageData } = await supabase.from('blog_images').select('*').eq('blog_id', blogId).order('sort_order');

            if (imageData) {
                const formattedImages = await Promise.all(imageData.map(async (img) => {
                    const { data: signedData, error: signedError } = await supabase.storage.from('blog-images').createSignedUrl(img.image_path, 60 * 60 * 24);
                    if (signedError) { console.error(signedError); return null; }
                    return { url: signedData.signedUrl, name: img.image_path };
                }));
                const validImages = formattedImages.filter(Boolean);
                setFormData(prev => ({ ...prev, uploadedImages: validImages, images: validImages }));
            }
            setLoading(false);
        }
    };

    const handleNotesChange = (e) => {
        const val = e.target.value;
        setFormData({ ...formData, notes: val });
        
        const cursor = e.target.selectionStart;
        const textBefore = val.substring(0, cursor);
        const match = textBefore.match(/(?:^|\s)@(\S*)$/);
        
        if (match) {
            setMentionQuery(match[1].toLowerCase());
            setMentionCursor(cursor - match[1].length - 1);
        } else {
            setMentionQuery(null);
        }
    };

    const handleSelectMention = (member) => {
        if (!notesRef.current) return;
        const val = formData.notes;
        const before = val.substring(0, mentionCursor);
        const after = val.substring(notesRef.current.selectionStart);
        
        const newText = `${before}@${member.name} ${after}`;
        setFormData({ ...formData, notes: newText });
        setMentionQuery(null);
        
        setTimeout(() => {
            if (notesRef.current) {
                notesRef.current.focus();
                const newCursor = before.length + member.name.length + 2;
                notesRef.current.setSelectionRange(newCursor, newCursor);
            }
        }, 0);
    };

    const filteredMembers = mentionQuery !== null 
        ? orgMembers.filter(m => m.name.toLowerCase().includes(mentionQuery))
        : [];

    const handleScroll = (e) => {
        if (backdropRef.current) {
            backdropRef.current.scrollTop = e.target.scrollTop;
        }
    };

    const renderHighlightedNotes = () => {
        if (!formData.notes) return null;
        const parts = formData.notes.split(/(@\S+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                return <span key={i} className="text-brand bg-brand/10 rounded-sm shadow-[0_0_0_2px_rgba(0,43,114,0.1)]">{part}</span>;
            }
            return <span key={i}>{part}</span>;
        });
    };

    const handleSave = async (status) => {
        try {
            setSaving(true);
            if (!currentUserId) { setNotification({ message: 'User not logged in', type: 'error' }); return; }

            const blogData = {
                organization_id: orgId,
                title: formData.title,
                content: formData.content,
                cta: formData.cta,
                notes: formData.notes,
                scheduled_date: formData.scheduled_date || null,
                status,
            };

            if (!blogId) {
                blogData.created_by = currentUserId;
            }

            let savedBlogId = blogId;

            if (blogId) {
                const { error: updateError } = await supabase.from('blogs').update(blogData).eq('id', blogId);
                if (updateError) { setNotification({ message: updateError.message, type: 'error' }); return; }
            } else {
                const { data, error: insertError } = await supabase.from('blogs').insert([blogData]).select().single();
                if (insertError) { setNotification({ message: insertError.message, type: 'error' }); return; }
                savedBlogId = data.id;
            }

            if (formData.images?.length > 0) {
                if (blogId) {
                    const { data: oldImages } = await supabase.from('blog_images').select('*').eq('blog_id', blogId);
                    if (oldImages?.length > 0) {
                        for (const img of oldImages) await supabase.storage.from('blog-images').remove([img.image_path]);
                        await supabase.from('blog_images').delete().eq('blog_id', blogId);
                    }
                }
                for (let i = 0; i < formData.images.length; i++) {
                    const image = formData.images[i];
                    if (!image.file) continue;
                    const file = image.file;
                    const filePath = `${orgId}/${savedBlogId}/${Date.now()}-${file.name}`;
                    const { error: uploadError } = await supabase.storage.from('blog-images').upload(filePath, file);
                    if (uploadError) { console.error(uploadError); alert(uploadError.message); continue; }
                    await supabase.from('blog_images').insert([{ blog_id: savedBlogId, image_url: '', image_path: filePath, sort_order: i }]);
                }
            }

            let actionType = null, actionText = null;
            if (status === 'pending review' && blogStatus !== 'pending review') { actionType = 'submit'; actionText = `submitted blog "${formData.title || 'Untitled'}"`; }
            else if (status === 'approved' && blogStatus === 'pending review') { actionType = 'approve'; actionText = `approved blog "${formData.title || 'Untitled'}"`; }
            else if (status === 'draft' && blogStatus === 'pending review') { actionType = 'redo'; actionText = `sent for redo blog "${formData.title || 'Untitled'}"`; }
            if (actionType) await supabase.from('activity_log').insert([{ organization_id: orgId, user_id: currentUserId, blog_id: savedBlogId, action_type: actionType, action_text: actionText }]);

            if (formData.notes) {
                const mentionRegex = /@(\S+)/g;
                const mentions = [...formData.notes.matchAll(mentionRegex)].map(m => m[1]);
                if (mentions.length > 0) {
                    const taggedMembers = orgMembers.filter(m => mentions.includes(m.name));
                    for (const member of taggedMembers) {
                        if (member.id !== currentUserId) {
                            const { data: existing } = await supabase.from('notifications')
                                .select('id')
                                .eq('blog_id', savedBlogId)
                                .eq('user_id', member.id)
                                .eq('type', 'mention')
                                .single();
                            if (!existing) {
                                await supabase.from('notifications').insert([{
                                    organization_id: orgId,
                                    user_id: member.id,
                                    actor_id: currentUserId,
                                    blog_id: savedBlogId,
                                    type: 'mention',
                                    content: `mentioned you in blog "${formData.title || 'Untitled'}"`
                                }]);
                            }
                        }
                    }
                }
            }

            // Notification for creator if admin rejected
            if (status === 'draft' && blogStatus === 'pending review' && currentUserId !== formData.created_by) {
                const { data: adminProfile } = await supabase.from('profiles').select('full_name, email').eq('id', currentUserId).single();
                const adminName = adminProfile?.full_name || adminProfile?.email || 'An admin';
                await supabase.from('notifications').insert([{
                    organization_id: orgId,
                    user_id: formData.created_by,
                    actor_id: currentUserId,
                    blog_id: savedBlogId,
                    type: 'redo',
                    content: `${adminName} sent your blog "${formData.title || 'Untitled'}" for redo.`
                }]);
            }

            const channel = new BroadcastChannel('blogs_channel');
            channel.postMessage('refresh_blogs');
            channel.close();

            if (window.opener) {
                window.close();
            } else {
                navigate(`/org/${orgId}/blogs`);
            }
        } catch (err) {
            console.error(err);
            setNotification({ message: 'Something went wrong', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const executeDelete = async () => {
        try {
            setIsDeleting(true);
            if (formData.images?.length > 0) {
                const { data: oldImages } = await supabase.from('blog_images').select('*').eq('blog_id', blogId);
                if (oldImages?.length > 0) for (const img of oldImages) await supabase.storage.from('blog-images').remove([img.image_path]);
            }
            
            await supabase.from('notifications').delete().eq('blog_id', blogId);
            await supabase.from('blog_images').delete().eq('blog_id', blogId);
            await supabase.from('activity_log').delete().eq('blog_id', blogId);

            const { error } = await supabase.from('blogs').delete().eq('id', blogId);
            if (error) throw error;
            
            await supabase.from('activity_log').insert([{ 
                organization_id: orgId, 
                user_id: currentUserId, 
                blog_id: null, 
                action_type: 'delete', 
                action_text: `deleted blog "${formData.title || 'Untitled'}"` 
            }]);
            
            navigate(`/org/${orgId}/blogs`);
        } catch (err) {
            console.error(err);
            setNotification({ message: err.message || 'Error deleting blog', type: 'error' });
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    const sidebarInputClass = "w-full py-3 px-3 rounded-xl border-[1.5px] border-slate-200 text-sm font-semibold bg-slate-50 text-slate-900 outline-none transition-all duration-200 focus:border-brand focus:bg-slate-100";

    return (
        <div className="bg-light-bg min-h-screen font-sans flex flex-col text-slate-900">
            {/* Header */}
            <header className="sticky top-0 bg-light-card border-b border-slate-200 py-4 px-10 flex justify-between items-center z-[100]">
                <button
                    className="flex items-center gap-2 text-slate-500 font-semibold text-sm cursor-pointer border-none bg-none transition-colors duration-200 hover:text-slate-900"
                    onClick={() => {
                        if (window.history.length > 1) navigate(`/org/${orgId}/blogs`);
                        else window.close();
                    }}
                >
                    <ChevronLeft size={18} />
                    Back to Blogs
                </button>

                {(canEdit || (blogStatus === 'pending review' && (userRole === 'admin' || userRole === 'owner'))) && (
                    <div className="flex gap-3">
                        {blogId && canEdit && (
                            <button
                                className="py-2.5 px-5 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 transition-all duration-200 border border-red-500/20 bg-transparent text-red-400 hover:bg-red-500/10"
                                onClick={() => setIsDeleteModalOpen(true)} disabled={saving}
                            >
                                <Trash2 size={18} />Delete
                            </button>
                        )}

                        {blogStatus === 'pending review' && (userRole === 'admin' || userRole === 'owner') ? (
                            <>
                                <button className="py-2.5 px-5 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 transition-all duration-200 bg-red-500/10 text-red-400 border border-red-500/20" onClick={() => handleSave('draft')} disabled={saving}>
                                    <XCircle size={18} />{saving ? 'Processing...' : 'Redo'}
                                </button>
                                <button className="py-2.5 px-5 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 transition-all duration-200 bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900" onClick={() => handleSave('pending review')} disabled={saving}>
                                    <Save size={18} />{saving ? 'Saving...' : 'Save Edits'}
                                </button>
                                <button className="py-2.5 px-5 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 transition-all duration-200 bg-emerald-500 text-white border-none shadow-[0_4px_12px_rgba(16,185,129,0.3)]" onClick={() => handleSave('approved')} disabled={saving}>
                                    <CheckCircle size={18} />{saving ? 'Processing...' : 'Approve'}
                                </button>
                            </>
                        ) : (blogStatus === 'approved' || blogStatus === 'published') && (userRole === 'admin' || userRole === 'owner') ? (
                            <button className="py-2.5 px-5 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 transition-all duration-200 bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900" onClick={() => handleSave(blogStatus)} disabled={saving}>
                                <Save size={18} />{saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        ) : currentUserId === formData.created_by || !blogId ? (
                            <>
                                <button className="py-2.5 px-5 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 transition-all duration-200 bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900" onClick={() => handleSave('draft')} disabled={saving}>
                                    <Save size={18} />{saving ? 'Saving...' : 'Save Draft'}
                                </button>
                                <button className="py-2.5 px-5 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 transition-all duration-200 bg-brand text-white border-none shadow-[0_4px_12px_rgba(0,43,114,0.3)] hover:bg-brand-hover hover:-translate-y-px" onClick={() => handleSave('pending review')} disabled={saving}>
                                    <Send size={18} />{saving ? 'Submitting...' : 'Submit Blog'}
                                </button>
                            </>
                        ) : null}
                    </div>
                )}
                {!canEdit && (
                    <div className="text-slate-500 text-sm font-semibold">View Only Mode</div>
                )}
            </header>

            {/* Body Layout */}
            <div className="grid grid-cols-[1fr_350px] flex-1 h-[calc(100vh-73px)] overflow-hidden">
                {/* Document Editor */}
                <main className="py-8 px-10 overflow-y-auto bg-[#f8fafc] flex flex-col gap-6">
                    <div className="max-w-[850px] w-full mx-auto flex flex-col gap-6">
                        {loading ? (
                            <div className="py-10 text-center text-brand font-semibold">Loading blog...</div>
                        ) : (
                            <>
                                {/* Main Content Card */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col gap-8">
                                    <div>
                                        <input
                                            className="text-[32px] font-black border-none outline-none text-slate-900 w-full p-0 bg-transparent placeholder:text-slate-300"
                                            placeholder="Blog Title"
                                            value={formData.title}
                                            readOnly={!canEdit}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        />
                                        {creatorName && (
                                            <div className="flex items-center gap-2 mt-2 text-slate-500 text-[13px] font-medium">
                                                <Users size={14} />
                                                <span>Created by {creatorName}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                            <FileText size={16} className="text-brand" />Content
                                        </label>
                                        <textarea
                                            className="w-full border border-slate-200 rounded-xl p-4 text-sm leading-[1.8] text-slate-700 resize-none outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 transition-all bg-slate-50 focus:bg-white min-h-[300px]"
                                            placeholder="Write your blog content here..."
                                            value={formData.content}
                                            readOnly={!canEdit}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Media Card */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                                    <h3 className="text-base font-bold text-slate-900 m-0 border-b border-slate-100 pb-4 mb-6">Blog Images</h3>
                                    <ImageUploadSection
                                        initialImages={formData.uploadedImages?.length > 0 ? formData.uploadedImages : formData.images || []}
                                        readOnly={!canEdit}
                                        onImagesChange={newImages => setFormData({ ...formData, images: newImages })}
                                    />
                                </div>
                                
                                <div className="h-10"></div>
                            </>
                        )}
                    </div>
                </main>

                {/* Sidebar */}
                <aside className="border-l border-slate-200 py-8 px-8 overflow-y-auto bg-white flex flex-col gap-8 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10">
                    <div className="flex flex-col gap-6">
                        <h3 className="text-sm font-black text-slate-900 m-0 uppercase tracking-wide">Publishing Setup</h3>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[1px] flex items-center gap-1.5">
                                <LinkIcon size={14} /> Call to Action (CTA)
                            </label>
                            <input
                                type="text"
                                className={sidebarInputClass}
                                placeholder="e.g. Subscribe"
                                value={formData.cta}
                                readOnly={!canEdit}
                                onChange={e => setFormData({ ...formData, cta: e.target.value })}
                            />
                        </div>

                        {(userRole === 'admin' || userRole === 'owner') ? (
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[1px]">Scheduled Date (Admin Only)</label>
                                <input type="date" className={sidebarInputClass} value={formData.scheduled_date} onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })} />
                            </div>
                        ) : (
                            <div className="text-[13px] text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                                {formData.scheduled_date ? `Scheduled for: ${formData.scheduled_date}` : "Date will be set by admin upon approval."}
                            </div>
                        )}
                    </div>

                    <div className="w-full h-px bg-slate-100"></div>

                    <div className="flex flex-col gap-6 relative">
                        <h3 className="text-sm font-black text-slate-900 m-0 uppercase tracking-wide">Internal Notes</h3>
                        <div className="relative w-full rounded-xl border-[1.5px] border-slate-200 bg-slate-50 transition-all duration-200 focus-within:border-brand focus-within:bg-slate-100 group">
                            {/* Backdrop for syntax highlighting */}
                            <div 
                                ref={backdropRef}
                                className="w-full h-[150px] py-3 px-3 text-sm font-semibold text-slate-900 whitespace-pre-wrap break-words overflow-hidden pointer-events-none"
                            >
                                {formData.notes ? renderHighlightedNotes() : <span className="text-slate-400">Reviewer notes, instructions, etc... (Type @ to mention)</span>}
                            </div>

                            {/* Actual Textarea */}
                            <textarea 
                                ref={notesRef}
                                className="absolute inset-0 w-full h-[150px] py-3 px-3 text-sm font-semibold resize-none bg-transparent text-transparent caret-slate-900 outline-none border-none focus:ring-0 placeholder-transparent" 
                                style={{ color: 'transparent', backgroundColor: 'transparent' }}
                                spellCheck={false}
                                value={formData.notes} 
                                readOnly={!canEdit} 
                                onChange={handleNotesChange} 
                                onScroll={handleScroll}
                                onBlur={() => setTimeout(() => setMentionQuery(null), 200)}
                            />

                            {mentionQuery !== null && filteredMembers.length > 0 && (
                                <div className="absolute left-0 right-0 bottom-full mb-2 bg-white rounded-xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden z-[100] max-h-[200px] overflow-y-auto">
                                    {filteredMembers.map(m => (
                                        <div 
                                            key={m.id} 
                                            className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleSelectMention(m);
                                            }}
                                        >
                                            {m.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-auto p-5 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col gap-2">
                        <div className="flex gap-2 text-blue-600 items-center">
                            <Info size={16} />
                            <span className="text-xs font-extrabold">PRO TIP</span>
                        </div>
                        <p className="m-0 text-[13px] text-slate-600 leading-[1.5]">Drafts stay private until submitted for review.</p>
                    </div>
                </aside>
            </div>

            {notification && (
                <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
            )}

            <DeleteBlogModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={executeDelete} 
                isDeleting={isDeleting} 
            />
        </div>
    );
};

export default CreateBlog;
