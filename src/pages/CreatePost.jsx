import React, { useState, useEffect, useRef } from 'react';
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
import CustomDatePicker from '../components/common/CustomDatePicker';
import { supabase } from '../supabase/supabase';
import Toast from '../components/common/Toast';

const CreatePost = ({ defaultType }) => {
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

    const [orgMembers, setOrgMembers] = useState([]);
    const [mentionQuery, setMentionQuery] = useState(null);
    const [mentionCursor, setMentionCursor] = useState(0);
    const notesRef = useRef(null);
    const backdropRef = useRef(null);
    const [linkInput, setLinkInput] = useState('');

    const [formData, setFormData] = useState({
        social_account: 'KLM',
        post_type: defaultType || 'reel',
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

        if (postId) {
            setLoading(true);
            const { data } = await supabase
                .from('posts').select(`*, profiles:created_by (full_name, email)`)
                .eq('id', postId).single();

            if (data) {
                setFormData(prev => ({
                    ...prev,
                    social_account: data.social_account || 'KLM',
                    post_type: data.post_type || defaultType || 'reel',
                    platforms: data.platforms || [],
                    scheduled_date: data.scheduled_date || '',
                    title: data.title || '',
                    caption: data.caption || '',
                    script: data.script || '',
                    hashtags: data.hashtags || '',
                    reference_link: data.reference_link || '',
                    notes: data.notes || '',
                    created_by: data.created_by,
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

            const postData = {
                organization_id: orgId,
                social_account: formData.social_account, post_type: formData.post_type,
                platforms: formData.platforms, scheduled_date: formData.scheduled_date || null,
                title: formData.title, caption: formData.caption, script: formData.script,
                hashtags: formData.hashtags, reference_link: formData.reference_link,
                notes: formData.notes, status,
            };

            if (!postId) {
                postData.created_by = currentUserId;
            }

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
            else if (status === 'draft' && postStatus === 'pending review') { actionType = 'redo'; actionText = `sent for redo "${formData.title || 'Untitled'}"`; }
            if (actionType) await supabase.from('activity_log').insert([{ organization_id: orgId, user_id: currentUserId, post_id: savedPostId, action_type: actionType, action_text: actionText }]);

            if (formData.notes) {
                const mentionRegex = /@(\S+)/g;
                const mentions = [...formData.notes.matchAll(mentionRegex)].map(m => m[1]);
                if (mentions.length > 0) {
                    const taggedMembers = orgMembers.filter(m => mentions.includes(m.name));
                    for (const member of taggedMembers) {
                        if (member.id !== currentUserId) {
                            const { data: existing } = await supabase.from('notifications')
                                .select('id')
                                .eq('post_id', savedPostId)
                                .eq('user_id', member.id)
                                .eq('type', 'mention')
                                .single();
                            if (!existing) {
                                await supabase.from('notifications').insert([{
                                    organization_id: orgId,
                                    user_id: member.id,
                                    actor_id: currentUserId,
                                    post_id: savedPostId,
                                    type: 'mention',
                                    content: `mentioned you in "${formData.title || 'Untitled'}"`
                                }]);
                            }
                        }
                    }
                }
            }

            const channel = new BroadcastChannel('posts_channel');
            channel.postMessage('refresh_posts');
            channel.close();

            if (window.opener) {
                window.close();
            } else {
                navigate(`/org/${orgId}/${formData.post_type}s`);
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
            
            // Delete dependent records to avoid foreign key constraints
            await supabase.from('notifications').delete().eq('post_id', postId);
            await supabase.from('post_images').delete().eq('post_id', postId);
            await supabase.from('activity_log').delete().eq('post_id', postId);

            const { error } = await supabase.from('posts').delete().eq('id', postId);
            if (error) throw error;
            
            // Insert log with post_id as null because the post no longer exists
            await supabase.from('activity_log').insert([{ 
                organization_id: orgId, 
                user_id: currentUserId, 
                post_id: null, 
                action_type: 'delete', 
                action_text: `deleted "${formData.title || 'Untitled'}"` 
            }]);
            
            navigate(`/org/${orgId}/${formData.post_type}s`);
        } catch (err) {
            console.error(err);
            setNotification({ message: err.message || 'Error deleting post', type: 'error' });
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
                        if (window.history.length > 1) navigate(`/org/${orgId}/${formData.post_type}s`);
                        else window.close();
                    }}
                >
                    <ChevronLeft size={18} />
                    Back to {formData.post_type === 'carousel' ? 'Carousels' : 'Reels'}
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
                                    <XCircle size={18} />{saving ? 'Processing...' : 'Redo'}
                                </button>
                                {currentUserId === formData.created_by && (
                                    <button className="py-2.5 px-5 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 transition-all duration-200 bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900" onClick={() => handleSave('pending review')} disabled={saving}>
                                        <Save size={18} />{saving ? 'Saving...' : 'Save Edits'}
                                    </button>
                                )}
                                <button className="py-2.5 px-5 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 transition-all duration-200 bg-emerald-500 text-white border-none shadow-[0_4px_12px_rgba(16,185,129,0.3)]" onClick={() => handleSave('approved')} disabled={saving}>
                                    <CheckCircle size={18} />{saving ? 'Processing...' : 'Approve'}
                                </button>
                            </>
                        ) : currentUserId === formData.created_by || !postId ? (
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
            <div className="grid grid-cols-[1fr_350px] flex-1 h-[calc(100vh-73px)] overflow-hidden">
                {/* Document Editor */}
                <main className="py-8 px-10 overflow-y-auto bg-[#f8fafc] flex flex-col gap-6">
                    <div className="max-w-[850px] w-full mx-auto flex flex-col gap-6">
                        {loading ? (
                            <div className="py-10 text-center text-brand font-semibold">Loading post...</div>
                        ) : (
                            <>
                                {/* Main Content Card */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col gap-8">
                                    <div>
                                        <input
                                            className="text-[32px] font-black border-none outline-none text-slate-900 w-full p-0 bg-transparent placeholder:text-slate-300"
                                            placeholder="Post Title"
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
                                            <FileText size={16} className="text-brand" />Caption
                                        </label>
                                        <textarea
                                            className="w-full border border-slate-200 rounded-xl p-4 text-sm leading-[1.6] text-slate-700 resize-none outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 transition-all bg-slate-50 focus:bg-white h-[120px]"
                                            placeholder="Write an engaging caption..."
                                            value={formData.caption}
                                            readOnly={!canEdit}
                                            onChange={e => setFormData({ ...formData, caption: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                            <StickyNote size={16} className="text-brand" />Script / Core Content
                                        </label>
                                        <textarea
                                            className="w-full border border-slate-200 rounded-xl p-4 text-sm leading-[1.8] text-slate-700 resize-none outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 transition-all bg-slate-50 focus:bg-white min-h-[300px]"
                                            placeholder="Draft your main content, script, or outline here..."
                                            value={formData.script}
                                            readOnly={!canEdit}
                                            onChange={e => setFormData({ ...formData, script: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Media Card */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                                    <h3 className="text-base font-bold text-slate-900 m-0 border-b border-slate-100 pb-4 mb-6">Media Assets</h3>
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
                            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[1px]">Target Platforms</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Instagram', 'LinkedIn', 'YouTube'].map(p => (
                                    <div
                                        key={p}
                                        className={`py-2 rounded-lg border-[1.5px] text-xs font-bold text-center cursor-pointer transition-all duration-200 ${formData.platforms.includes(p) ? 'bg-brand text-white border-brand shadow-[0_2px_8px_rgba(0,43,114,0.2)]' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'}`}
                                        onClick={() => togglePlatform(p)}
                                    >{p}</div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[1px]">Scheduled Date</label>
                            <CustomDatePicker className={`${sidebarInputClass} py-3 !border-slate-200`} value={formData.scheduled_date} onChange={val => setFormData({ ...formData, scheduled_date: val })} />
                        </div>
                    </div>

                    <div className="w-full h-px bg-slate-100"></div>

                    <div className="flex flex-col gap-6">
                        <h3 className="text-sm font-black text-slate-900 m-0 uppercase tracking-wide">Additional Details</h3>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[1px]">Hashtags</label>
                            <textarea 
                                className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700 resize-none outline-none focus:border-brand bg-slate-50 focus:bg-white h-[80px] italic" 
                                placeholder="#marketing #social" 
                                value={formData.hashtags} 
                                readOnly={!canEdit} 
                                onChange={e => setFormData({ ...formData, hashtags: e.target.value })} 
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[1px]">Reference Links</label>
                            {!canEdit ? (
                                <div className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700 bg-slate-50 h-[80px] overflow-y-auto whitespace-pre-wrap break-words">
                                    {formData.reference_link ? (
                                        formData.reference_link.split(/\s+/).map((part, i) => {
                                            if (part.match(/https?:\/\/[^\s]+/)) {
                                                return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline font-medium break-all mr-2">{part}</a>;
                                            }
                                            return <span key={i} className="mr-2">{part}</span>;
                                        })
                                    ) : (
                                        <span className="text-slate-400 italic">No reference links</span>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 focus-within:bg-white focus-within:border-brand transition-colors h-[120px] overflow-y-auto flex flex-col gap-2">
                                    {formData.reference_link && (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.reference_link.split(/\s+/).filter(Boolean).map((link, i) => (
                                                <div key={i} className="flex items-center gap-1 bg-brand/5 border border-brand/20 text-brand px-2 py-1 rounded-md text-xs">
                                                    <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 max-w-[150px] truncate" title={link}>
                                                        <LinkIcon size={12} className="shrink-0" />
                                                        <span className="truncate">{link}</span>
                                                    </a>
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            const newLinks = formData.reference_link.split(/\s+/).filter((_, idx) => idx !== i).join(' ');
                                                            setFormData({ ...formData, reference_link: newLinks });
                                                        }}
                                                        className="ml-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors"
                                                    >
                                                        <XCircle size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <input 
                                        type="text"
                                        className="w-full bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400" 
                                        placeholder={formData.reference_link ? "Add another link..." : "Type link & Enter..."}
                                        value={linkInput}
                                        onChange={e => setLinkInput(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const trimmed = linkInput.trim();
                                                if (trimmed) {
                                                    let formattedLink = trimmed;
                                                    if (!/^https?:\/\//i.test(trimmed) && trimmed.includes('.')) {
                                                        formattedLink = `https://${trimmed}`;
                                                    }
                                                    const newLinks = formData.reference_link ? `${formData.reference_link} ${formattedLink}` : formattedLink;
                                                    setFormData({ ...formData, reference_link: newLinks });
                                                    setLinkInput('');
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </div>
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