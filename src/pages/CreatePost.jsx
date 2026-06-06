import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    ChevronLeft,
    Save,
    Send,
    FileText,
    Hash,
    Link as LinkIcon,
    StickyNote,
    Info,
    Users,
    Image as ImageIcon,
    CheckCircle,
    XCircle,
    Trash2,
} from 'lucide-react';
import ImageUploadSection from '../components/posts/ImageUploadSection';
import DeletePostModal from '../components/posts/DeletePostModal';
import CustomSelect from '../components/common/CustomSelect';
import { supabase } from '../supabase/supabase';
import Toast from '../components/common/Toast';

const CreatePost = () => {
    const { orgId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const postId = searchParams.get('id');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(postId ? true : false);
    const [canEdit, setCanEdit] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [creatorName, setCreatorName] = useState(null);
    const [notification, setNotification] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [postStatus, setPostStatus] = useState(null);

    const [formData, setFormData] = useState({
        social_account: 'KLM',
        post_type: 'reel',
        platforms: [],
        scheduled_date: '',
        title: '',
        caption: '',
        script: '',
        hashtags: '',
        reference_link: '',
        notes: '',
        images: [],
        uploadedImages: [],
    });

    useEffect(() => { fetchInitialData(); }, [postId]);

    const fetchInitialData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUserId(user.id);

        const { data: memberData } = await supabase
            .from('organization_members').select('role')
            .eq('organization_id', orgId).eq('user_id', user.id).single();
        const fetchedUserRole = memberData?.role;
        setUserRole(fetchedUserRole);

        if (postId) {
            setLoading(true);
            const { data } = await supabase
                .from('posts').select(`*, profiles:created_by (full_name, email)`)
                .eq('id', postId).single();

            if (data) {
                setFormData(prev => ({
                    ...prev,
                    social_account: data.social_account || 'KLM',
                    post_type: data.post_type || 'reel',
                    platforms: data.platforms || [],
                    scheduled_date: data.scheduled_date || '',
                    title: data.title || '',
                    caption: data.caption || '',
                    script: data.script || '',
                    hashtags: data.hashtags || '',
                    reference_link: data.reference_link || '',
                    notes: data.notes || '',
                    uploadedImages: [],
                    images: [],
                }));
                const isCreator = data.created_by === user.id;
                const isAdmin = fetchedUserRole === 'admin' || fetchedUserRole === 'owner';
                setCanEdit(isCreator || isAdmin);
                setCreatorName(data.profiles?.full_name || data.profiles?.email || 'Unknown');
                setPostStatus(data.status);
            }

            const { data: imageData } = await supabase.from('post_images').select('*').eq('post_id', postId).order('sort_order');

            if (imageData) {
                const formattedImages = await Promise.all(imageData.map(async (img) => {
                    const { data: signedData, error: signedError } = await supabase.storage.from('post-images').createSignedUrl(img.image_path, 60 * 60 * 24);
                    if (signedError) { console.error(signedError); return null; }
                    return { url: signedData.signedUrl, name: img.image_path };
                }));
                const validImages = formattedImages.filter(Boolean);
                setFormData(prev => ({ ...prev, uploadedImages: validImages, images: validImages }));
            }
            setLoading(false);
        }
    };

    const togglePlatform = (p) => {
        setFormData(prev => ({
            ...prev,
            platforms: prev.platforms.includes(p)
                ? prev.platforms.filter(plat => plat !== p)
                : [...prev.platforms, p],
        }));
    };

    const handleSave = async (status) => {
        try {
            setSaving(true);
            if (!currentUserId) { setNotification({ message: 'User not logged in', type: 'error' }); return; }

            const postData = {
                organization_id: orgId, created_by: currentUserId,
                social_account: formData.social_account, post_type: formData.post_type,
                platforms: formData.platforms, scheduled_date: formData.scheduled_date || null,
                title: formData.title, caption: formData.caption, script: formData.script,
                hashtags: formData.hashtags, reference_link: formData.reference_link,
                notes: formData.notes, status,
            };

            let savedPostId = postId;

            if (postId) {
                const { error: updateError } = await supabase.from('posts').update(postData).eq('id', postId);
                if (updateError) { setNotification({ message: updateError.message, type: 'error' }); return; }
            } else {
                const { data, error: insertError } = await supabase.from('posts').insert([postData]).select().single();
                if (insertError) { setNotification({ message: insertError.message, type: 'error' }); return; }
                savedPostId = data.id;
            }

            if (formData.images?.length > 0) {
                if (postId) {
                    const { data: oldImages } = await supabase.from('post_images').select('*').eq('post_id', postId);
                    if (oldImages?.length > 0) {
                        for (const img of oldImages) await supabase.storage.from('post-images').remove([img.image_path]);
                        await supabase.from('post_images').delete().eq('post_id', postId);
                    }
                }
                for (let i = 0; i < formData.images.length; i++) {
                    const image = formData.images[i];
                    if (!image.file) continue;
                    const file = image.file;
                    const filePath = `${orgId}/${savedPostId}/${Date.now()}-${file.name}`;
                    const { error: uploadError } = await supabase.storage.from('post-images').upload(filePath, file);
                    if (uploadError) { console.error(uploadError); alert(uploadError.message); continue; }
                    await supabase.from('post_images').insert([{ post_id: savedPostId, image_url: '', image_path: filePath, sort_order: i }]);
                }
            }

            let actionType = null, actionText = null;
            if (status === 'pending review' && postStatus !== 'pending review') { actionType = 'submit'; actionText = `submitted "${formData.title || 'Untitled'}"`; }
            else if (status === 'approved' && postStatus === 'pending review') { actionType = 'approve'; actionText = `approved "${formData.title || 'Untitled'}"`; }
            else if (status === 'draft' && postStatus === 'pending review') { actionType = 'reject'; actionText = `rejected "${formData.title || 'Untitled'}"`; }
            if (actionType) await supabase.from('activity_log').insert([{ organization_id: orgId, user_id: currentUserId, post_id: savedPostId, action_type: actionType, action_text: actionText }]);

            const channel = new BroadcastChannel('posts_channel');
            channel.postMessage('refresh_posts');
            channel.close();

            if (window.opener) {
                window.close();
            } else {
                navigate(`/org/${orgId}/posts`);
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
                const { data: oldImages } = await supabase.from('post_images').select('*').eq('post_id', postId);
                if (oldImages?.length > 0) for (const img of oldImages) await supabase.storage.from('post-images').remove([img.image_path]);
            }
            const { error } = await supabase.from('posts').delete().eq('id', postId);
            if (error) throw error;
            await supabase.from('activity_log').insert([{ organization_id: orgId, user_id: currentUserId, post_id: postId, action_type: 'delete', action_text: `deleted "${formData.title || 'Untitled'}"` }]);
            navigate(`/org/${orgId}/posts`);
        } catch (err) {
            console.error(err);
            setNotification({ message: 'Error deleting post', type: 'error' });
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
                        if (window.history.length > 1) navigate(`/org/${orgId}/posts`);
                        else window.close();
                    }}
                >
                    <ChevronLeft size={18} />
                    Back to Posts
                </button>

                {(canEdit || (postStatus === 'pending review' && (userRole === 'admin' || userRole === 'owner'))) && (
                    <div className="flex gap-3">
                        {postId && canEdit && (
                            <button
                                className="py-2.5 px-5 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 transition-all duration-200 border border-red-500/20 bg-transparent text-red-400 hover:bg-red-500/10"
                                onClick={() => setIsDeleteModalOpen(true)} disabled={saving}
                            >
                                <Trash2 size={18} />Delete
                            </button>
                        )}

                        {postStatus === 'pending review' && (userRole === 'admin' || userRole === 'owner') ? (
                            <>
                                <button className="py-2.5 px-5 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 transition-all duration-200 bg-red-500/10 text-red-400 border border-red-500/20" onClick={() => handleSave('draft')} disabled={saving}>
                                    <XCircle size={18} />{saving ? 'Processing...' : 'Reject'}
                                </button>
                                <button className="py-2.5 px-5 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 transition-all duration-200 bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900" onClick={() => handleSave('pending review')} disabled={saving}>
                                    <Save size={18} />{saving ? 'Saving...' : 'Save Edits'}
                                </button>
                                <button className="py-2.5 px-5 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 transition-all duration-200 bg-emerald-500 text-white border-none shadow-[0_4px_12px_rgba(16,185,129,0.3)]" onClick={() => handleSave('approved')} disabled={saving}>
                                    <CheckCircle size={18} />{saving ? 'Processing...' : 'Approve'}
                                </button>
                            </>
                        ) : canEdit ? (
                            <>
                                <button className="py-2.5 px-5 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 transition-all duration-200 bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900" onClick={() => handleSave('draft')} disabled={saving}>
                                    <Save size={18} />{saving ? 'Saving...' : 'Save Draft'}
                                </button>
                                <button className="py-2.5 px-5 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 transition-all duration-200 bg-brand text-white border-none shadow-[0_4px_12px_rgba(0,43,114,0.3)] hover:bg-brand-hover hover:-translate-y-px" onClick={() => handleSave('pending review')} disabled={saving}>
                                    <Send size={18} />{saving ? 'Submitting...' : 'Submit Post'}
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
            <div className="grid grid-cols-[350px_1fr] flex-1 h-[calc(100vh-73px)]">
                {/* Sidebar */}
                <aside className="border-r border-slate-200 py-8 px-8 overflow-y-auto bg-light-card flex flex-col gap-7">
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[1px]">Social Account</label>
                        <CustomSelect 
                            className={sidebarInputClass} 
                            value={formData.social_account} 
                            onChange={val => setFormData({ ...formData, social_account: val })}
                            options={[
                                { value: 'KLM', label: 'KL Main (KLM)' },
                                { value: 'KLS', label: 'KL Select (KLS)' },
                                { value: 'KLC', label: 'KL Community (KLC)' }
                            ]}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[1px]">Post Type</label>
                        <CustomSelect 
                            className={sidebarInputClass} 
                            value={formData.post_type} 
                            onChange={val => setFormData({ ...formData, post_type: val })}
                            options={[
                                { value: 'reel', label: 'Reel' },
                                { value: 'story', label: 'Story' },
                                { value: 'carousel', label: 'Carousel' }
                            ]}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[1px]">Target Platforms</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Instagram', 'LinkedIn', 'YouTube'].map(p => (
                                <div
                                    key={p}
                                    className={`py-2.5 rounded-xl border-[1.5px] text-xs font-bold text-center cursor-pointer transition-all duration-200 ${formData.platforms.includes(p) ? 'bg-brand text-white border-brand shadow-[0_4px_12px_rgba(0,43,114,0.2)]' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-white hover:border-brand/50'}`}
                                    onClick={() => togglePlatform(p)}
                                >{p}</div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[1px]">Scheduled Date</label>
                        <input type="date" className={sidebarInputClass} value={formData.scheduled_date} onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[1px]">Hashtags</label>
                        <textarea className={`${sidebarInputClass} h-20 resize-none italic`} placeholder="#hashtags" value={formData.hashtags} readOnly={!canEdit} onChange={e => setFormData({ ...formData, hashtags: e.target.value })} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[1px]">Reference Links</label>
                        <textarea className={`${sidebarInputClass} h-[120px] resize-none`} placeholder="https://..." value={formData.reference_link} readOnly={!canEdit} onChange={e => setFormData({ ...formData, reference_link: e.target.value })} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[1px]">Internal Notes</label>
                        <textarea className={`${sidebarInputClass} h-20 resize-none`} placeholder="Drafting notes..." value={formData.notes} readOnly={!canEdit} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                    </div>

                    <div className="mt-5 p-5 bg-blue-500/10 rounded-2xl border border-blue-500/10 flex flex-col gap-2">
                        <div className="flex gap-2 text-blue-400 items-center">
                            <Info size={16} />
                            <span className="text-xs font-extrabold">PRO TIP</span>
                        </div>
                        <p className="m-0 text-xs text-slate-500 leading-[1.5]">Drafts stay private until submitted.</p>
                    </div>
                </aside>

                {/* Document Editor */}
                <main className="py-10 px-10 overflow-y-auto bg-light-bg">
                    <div className="max-w-[850px] mx-auto flex flex-col gap-10 bg-light-card py-20 px-[100px] shadow-[0_10px_40px_rgba(0,0,0,0.4)] rounded-sm min-h-[1000px] border border-white/[0.03]">
                        {loading ? (
                            <div className="py-10 text-center text-brand font-semibold">Loading post...</div>
                        ) : (
                            <>
                                <input
                                    className="text-[42px] font-extrabold border-none outline-none text-slate-900 w-full p-0 bg-transparent placeholder:text-slate-900/10"
                                    placeholder="Untitled Post"
                                    value={formData.title}
                                    readOnly={!canEdit}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />

                                {creatorName && (
                                    <div className="flex items-center gap-2 -mt-7 mb-2.5 text-slate-500 text-[13px] font-semibold">
                                        <Users size={14} />
                                        <span>Created by {creatorName}</span>
                                    </div>
                                )}

                                <div className="flex flex-col gap-3">
                                    <label className="flex items-center gap-2.5 text-sm font-bold text-slate-500 pb-2 border-b border-slate-200">
                                        <FileText size={16} />Caption
                                    </label>
                                    <textarea
                                        className="w-full border-none outline-none text-base leading-[1.6] text-slate-600 resize-none font-[inherit] p-0 bg-transparent h-[120px]"
                                        placeholder="Start writing your caption here..."
                                        value={formData.caption}
                                        readOnly={!canEdit}
                                        onChange={e => setFormData({ ...formData, caption: e.target.value })}
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="flex items-center gap-2.5 text-sm font-bold text-slate-500 pb-2 border-b border-slate-200">
                                        <StickyNote size={16} />Script / Core Content
                                    </label>
                                    <textarea
                                        className="w-full border-none outline-none text-base leading-[1.8] text-slate-600 resize-none font-sans p-0 bg-transparent min-h-[500px]"
                                        placeholder="Write your long-form script or content here..."
                                        value={formData.script}
                                        readOnly={!canEdit}
                                        onChange={e => setFormData({ ...formData, script: e.target.value })}
                                    />
                                </div>

                                <ImageUploadSection
                                    initialImages={formData.uploadedImages?.length > 0 ? formData.uploadedImages : formData.images || []}
                                    readOnly={!canEdit}
                                    onImagesChange={newImages => setFormData({ ...formData, images: newImages })}
                                />
                            </>
                        )}
                    </div>
                </main>
            </div>

            {notification && (
                <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
            )}

            <DeletePostModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={executeDelete} 
                isDeleting={isDeleting} 
            />
        </div>
    );
};

export default CreatePost;