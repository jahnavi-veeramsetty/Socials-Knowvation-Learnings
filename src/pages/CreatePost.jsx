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
} from 'lucide-react';

import ImageUploadSection from '../components/posts/ImageUploadSection';

import { supabase } from '../supabase/supabase';
import Toast from '../components/common/Toast';

const CreatePost = () => {
    const { orgId } = useParams();

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const postId = searchParams.get('id');

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(postId ? true : false);
    const [canEdit, setCanEdit] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [creatorName, setCreatorName] = useState(null);
    const [notification, setNotification] = useState(null);

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

    useEffect(() => {
        fetchInitialData();
    }, [postId]);

    const fetchInitialData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUserId(user.id);

        // Fetch user role
        const { data: memberData } = await supabase
            .from('organization_members')
            .select('role')
            .eq('organization_id', orgId)
            .eq('user_id', user.id)
            .single();

        const userRole = memberData?.role;

        if (postId) {
            setLoading(true);
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles:created_by (full_name, email)
                `)
                .eq('id', postId)
                .single();

            if (data) {
                setFormData((prev) => ({
                    ...prev,

                    social_account:
                        data.social_account || 'KLM',

                    post_type:
                        data.post_type || 'reel',

                    platforms:
                        data.platforms || [],

                    scheduled_date:
                        data.scheduled_date || '',

                    title:
                        data.title || '',

                    caption:
                        data.caption || '',

                    script:
                        data.script || '',

                    hashtags:
                        data.hashtags || '',

                    reference_link:
                        data.reference_link || '',

                    notes:
                        data.notes || '',

                    uploadedImages: [],
                    images: [],
                }));
                const isCreator = data.created_by === user.id;
                const isAdmin = userRole === 'admin' || userRole === 'owner';
                setCanEdit(isCreator || isAdmin);

                // Store creator name for display
                const creator = data.profiles?.full_name || data.profiles?.email || 'Unknown';
                setCreatorName(creator);
            }

            // =====================================
            // FETCH POST IMAGES
            // =====================================

            const {
                data: imageData
            } = await supabase
                .from('post_images')
                .select('*')
                .eq('post_id', postId)
                .order('sort_order');

            if (imageData) {

                const formattedImages =
                    await Promise.all(

                        imageData.map(async (img) => {

                            const {
                                data: signedData,
                                error: signedError
                            } = await supabase
                                .storage
                                .from('post-images')
                                .createSignedUrl(
                                    img.image_path,
                                    60 * 60 * 24
                                );

                            if (signedError) {

                                console.error(signedError);

                                return null;
                            }

                            return {
                                url: signedData.signedUrl,
                                name: img.image_path,
                            };
                        })
                    );

                const validImages =
                    formattedImages.filter(Boolean);

                setFormData((prev) => ({
                    ...prev,

                    uploadedImages:
                        validImages,

                    images:
                        validImages,
                }));
            }
            setLoading(false);
        }
    };

    const togglePlatform = (p) => {
        setFormData((prev) => ({
            ...prev,
            platforms: prev.platforms.includes(p)
                ? prev.platforms.filter(
                    (plat) => plat !== p
                )
                : [...prev.platforms, p],
        }));
    };

    const handleSave = async (status) => {

        try {

            setSaving(true);

            if (!currentUserId) {

                setNotification({
                    message: 'User not logged in',
                    type: 'error'
                });

                return;
            }

            // =====================================
            // POST DATA
            // =====================================

            const postData = {
                organization_id: orgId,
                created_by: currentUserId,
                social_account: formData.social_account,
                post_type: formData.post_type,
                platforms: formData.platforms,
                scheduled_date: formData.scheduled_date || null,
                title: formData.title,
                caption: formData.caption,
                script: formData.script,
                hashtags: formData.hashtags,
                reference_link: formData.reference_link,
                notes: formData.notes,
                status,
            };

            let savedPostId = postId;

            // =====================================
            // UPDATE POST
            // =====================================

            if (postId) {

                const { error: updateError } =
                    await supabase
                        .from('posts')
                        .update(postData)
                        .eq('id', postId);

                if (updateError) {

                    console.error(updateError);

                    setNotification({
                        message: updateError.message,
                        type: 'error',
                    });

                    return;
                }
            }

            // =====================================
            // CREATE POST
            // =====================================

            else {

                const {
                    data,
                    error: insertError
                } = await supabase
                    .from('posts')
                    .insert([postData])
                    .select()
                    .single();

                if (insertError) {

                    console.error(insertError);

                    setNotification({
                        message: insertError.message,
                        type: 'error',
                    });

                    return;
                }

                savedPostId = data.id;
            }

            // =====================================
            // UPLOAD IMAGES
            // =====================================

            if (formData.images?.length > 0) {

                // remove old images first if editing

                if (postId) {

                    const {
                        data: oldImages
                    } = await supabase
                        .from('post_images')
                        .select('*')
                        .eq('post_id', postId);

                    if (oldImages?.length > 0) {

                        for (const img of oldImages) {

                            await supabase
                                .storage
                                .from('post-images')
                                .remove([img.image_path]);
                        }

                        await supabase
                            .from('post_images')
                            .delete()
                            .eq('post_id', postId);
                    }
                }

                // upload new images

                for (let i = 0; i < formData.images.length; i++) {

                    const image = formData.images[i];

                    // skip already uploaded images

                    if (!image.file) continue;

                    const file = image.file;

                    const filePath =
                        `${orgId}/${savedPostId}/${Date.now()}-${file.name}`;

                    const {
                        error: uploadError
                    } = await supabase
                        .storage
                        .from('post-images')
                        .upload(filePath, file);

                    if (uploadError) {

                        console.error(uploadError);

                        alert(uploadError.message);

                        continue;
                    }

                    const {
                        data: signedUrlData,
                        error: signedUrlError
                    } = await supabase
                        .storage
                        .from('post-images')
                        .createSignedUrl(filePath, 60 * 60 * 24 * 365);

                    if (signedUrlError) {

                        console.error(signedUrlError);

                        continue;
                    }

                    const publicUrl =
                        signedUrlData.signedUrl;

                    await supabase
                        .from('post_images')
                        .insert([
                            {
                                post_id: savedPostId,
                                image_url: '',
                                image_path: filePath,
                                sort_order: i,
                            }
                        ]);
                }
            }

            // =====================================
            // ACTIVITY LOG
            // =====================================

            if (status === 'pending review') {

                await supabase
                    .from('activity_log')
                    .insert([
                        {
                            organization_id: orgId,
                            user_id: currentUserId,
                            post_id: savedPostId,
                            action_type: 'submit',
                            action_text:
                                `submitted "${formData.title || 'Untitled'}"`
                        }
                    ]);
            }

            // =====================================
            // SUCCESS
            // =====================================

            navigate(`/org/${orgId}/posts`);

        } catch (err) {

            console.error(err);

            setNotification({
                message: 'Something went wrong',
                type: 'error',
            });

        } finally {

            setSaving(false);

        }
    };

    return (
        <div className="create-post-page">
            <style>{`
                .create-post-page {
                    background: #010D2C;
                    min-height: 100vh;
                    font-family: 'Inter', sans-serif;
                    display: flex;
                    flex-direction: column;
                    color: #ffffff;
                }

                .editor-header {
                    position: sticky;
                    top: 0;
                    background: #0a1936;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 16px 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    z-index: 100;
                }

                .back-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #94a3b8;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    border: none;
                    background: none;
                    transition: color 0.2s;
                }
                
                .back-btn:hover {
                    color: #ffffff;
                }

                .header-actions {
                    display: flex;
                    gap: 12px;
                }

                .action-btn {
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                    border: none;
                }

                .btn-secondary {
                    background: rgba(255, 255, 255, 0.05);
                    color: #cbd5e1;
                    border: 1.5px solid rgba(255, 255, 255, 0.05);
                }
                
                .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }

                .btn-primary {
                    background: #002B72;
                    color: white;
                    box-shadow: 0 4px 12px rgba(0, 43, 114, 0.3);
                }
                
                .btn-primary:hover {
                    background: #001f54;
                    transform: translateY(-1px);
                }

                .editor-layout {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    flex: 1;
                    height: calc(100vh - 73px);
                }

                .metadata-sidebar {
                    border-right: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 32px;
                    overflow-y: auto;
                    background: #0a1936;
                    display: flex;
                    flex-direction: column;
                    gap: 28px;
                }

                .doc-editor {
                    padding: 40px;
                    overflow-y: auto;
                    background: #010D2C;
                }

                .doc-container {
                    max-width: 850px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 40px;
                    background: #0a1936;
                    padding: 80px 100px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                    border-radius: 4px;
                    min-height: 1000px;
                    border: 1px solid rgba(255, 255, 255, 0.03);
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .sidebar-label {
                    font-size: 11px;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .sidebar-select,
                .sidebar-input {
                    width: 100%;
                    padding: 12px;
                    border-radius: 10px;
                    border: 1.5px solid rgba(255, 255, 255, 0.05);
                    font-size: 14px;
                    font-weight: 600;
                    background: rgba(255, 255, 255, 0.02);
                    color: white;
                    outline: none;
                    transition: all 0.2s;
                }
                
                .sidebar-select:focus,
                .sidebar-input:focus {
                    border-color: #002B72;
                    background: rgba(255, 255, 255, 0.05);
                }

                .platform-pills {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }

                .platform-pill {
                    padding: 10px;
                    border-radius: 10px;
                    border: 1.5px solid rgba(255, 255, 255, 0.05);
                    font-size: 12px;
                    font-weight: 700;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: rgba(255, 255, 255, 0.02);
                    color: #64748b;
                }

                .platform-pill.active {
                    background: #002B72;
                    color: white;
                    border-color: #002B72;
                    box-shadow: 0 4px 12px rgba(0, 43, 114, 0.2);
                }

                .doc-title-input {
                    font-size: 42px;
                    font-weight: 800;
                    border: none;
                    outline: none;
                    color: #ffffff;
                    width: 100%;
                    padding: 0;
                    background: transparent;
                }
                
                .doc-title-input::placeholder {
                    color: rgba(255, 255, 255, 0.1);
                }

                .doc-textarea {
                    width: 100%;
                    min-height: 40px;
                    border: none;
                    outline: none;
                    font-size: 16px;
                    line-height: 1.6;
                    color: #cbd5e1;
                    resize: none;
                    font-family: inherit;
                    padding: 0;
                    background: transparent;
                }

                .doc-textarea.script {
                    min-height: 500px;
                    background: transparent;
                    padding: 0;
                    border-radius: 0;
                    font-family: 'Inter', sans-serif;
                    font-size: 16px;
                    border: none;
                    line-height: 1.8;
                    color: #cbd5e1;
                }

                .doc-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .doc-section-label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 700;
                    color: #64748b;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                @media (max-width: 1100px) {
                    .editor-layout {
                        grid-template-columns: 1fr;
                    }

                    .metadata-sidebar {
                        display: none;
                    }

                    .doc-editor {
                        padding: 40px;
                    }
                }

                .creator-tag-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: -30px;
                    margin-bottom: 10px;
                    color: #64748b;
                    font-size: 13px;
                    font-weight: 600;
                }
            `}</style>

            <header className="editor-header">
                <button
                    className="back-btn"
                    onClick={() => {
                        if (window.history.length > 1) {
                            navigate(`/org/${orgId}/posts`);
                        } else {
                            window.close();
                        }
                    }}
                >
                    <ChevronLeft size={18} />
                    Back to Posts
                </button>

                {canEdit && (
                    <div className="header-actions">
                        <button
                            className="action-btn btn-secondary"
                            onClick={() =>
                                handleSave('draft')
                            }
                            disabled={saving}
                        >
                            <Save size={18} />
                            {saving
                                ? 'Saving...'
                                : 'Save Draft'}
                        </button>

                        <button
                            className="action-btn btn-primary"
                            onClick={() =>
                                handleSave(
                                    'pending review'
                                )
                            }
                            disabled={saving}
                        >
                            <Send size={18} />
                            {saving
                                ? 'Submitting...'
                                : 'Submit Post'}
                        </button>
                    </div>
                )}
                {!canEdit && (
                    <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
                        View Only Mode
                    </div>
                )}
            </header>

            <div className="editor-layout">
                <aside className="metadata-sidebar">
                    <div className="form-group">
                        <label className="sidebar-label">
                            Social Account
                        </label>

                        <select
                            className="sidebar-select"
                            value={
                                formData.social_account
                            }
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    social_account:
                                        e.target
                                            .value,
                                })
                            }
                        >
                            <option value="KLM">
                                KL Main (KLM)
                            </option>

                            <option value="KLS">
                                KL Select (KLS)
                            </option>

                            <option value="KLC">
                                KL Community (KLC)
                            </option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="sidebar-label">
                            Post Type
                        </label>

                        <select
                            className="sidebar-select"
                            value={
                                formData.post_type
                            }
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    post_type:
                                        e.target
                                            .value,
                                })
                            }
                        >
                            <option value="reel">
                                Reel
                            </option>

                            <option value="story">
                                Story
                            </option>

                            <option value="carousel">
                                Carousel
                            </option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="sidebar-label">
                            Target Platforms
                        </label>

                        <div className="platform-pills">
                            {[
                                'Instagram',
                                'LinkedIn',
                                'YouTube',
                            ].map((p) => (
                                <div
                                    key={p}
                                    className={`platform-pill ${formData.platforms.includes(
                                        p
                                    )
                                        ? 'active'
                                        : ''
                                        }`}
                                    onClick={() =>
                                        togglePlatform(
                                            p
                                        )
                                    }
                                >
                                    {p}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="sidebar-label">
                            Scheduled Date
                        </label>

                        <input
                            type="date"
                            className="sidebar-input"
                            value={
                                formData.scheduled_date
                            }
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    scheduled_date:
                                        e.target
                                            .value,
                                })
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label className="sidebar-label">
                            Hashtags
                        </label>
                        <textarea
                            className="sidebar-input"
                            style={{ height: '80px', resize: 'none', fontStyle: 'italic' }}
                            placeholder="#hashtags"
                            value={formData.hashtags}
                            readOnly={!canEdit}
                            onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="sidebar-label">
                            Reference Links
                        </label>
                        <textarea
                            className="sidebar-input"
                            style={{ height: '120px', resize: 'none' }}
                            placeholder="https://..."
                            value={formData.reference_link}
                            readOnly={!canEdit}
                            onChange={(e) => setFormData({ ...formData, reference_link: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="sidebar-label">
                            Internal Notes
                        </label>
                        <textarea
                            className="sidebar-input"
                            style={{ height: '80px', resize: 'none' }}
                            placeholder="Drafting notes..."
                            value={formData.notes}
                            readOnly={!canEdit}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div
                        className="form-group"
                        style={{
                            marginTop: '20px',
                            padding: '20px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '16px',
                            border: '1px solid rgba(59, 130, 246, 0.1)',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                gap: '8px',
                                color: '#3b82f6',
                                marginBottom: '8px',
                            }}
                        >
                            <Info size={16} />

                            <span
                                style={{
                                    fontSize:
                                        '12px',
                                    fontWeight: 800,
                                }}
                            >
                                PRO TIP
                            </span>
                        </div>

                        <p
                            style={{
                                margin: 0,
                                fontSize: '12px',
                                color: '#94a3b8',
                                lineHeight: 1.5,
                            }}
                        >
                            Drafts stay private
                            until submitted.
                        </p>
                    </div>
                </aside>

                <main className="doc-editor">
                    <div className="doc-container">
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#002B72', fontWeight: 600 }}>Loading post...</div>
                        ) : (
                            <>
                                <input
                                    className="doc-title-input"
                                    placeholder="Untitled Post"
                                    value={formData.title}
                                    readOnly={!canEdit}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title: e.target
                                                .value,
                                        })
                                    }
                                />

                                {creatorName && (
                                    <div className="creator-tag-row">
                                        <Users size={14} />
                                        <span>Created by {creatorName}</span>
                                    </div>
                                )}

                                <div className="doc-section">
                                    <label className="doc-section-label">
                                        <FileText size={16} />
                                        Caption
                                    </label>

                                    <textarea
                                        className="doc-textarea"
                                        placeholder="Start writing your caption here..."
                                        value={
                                            formData.caption
                                        }
                                        readOnly={!canEdit}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                caption:
                                                    e.target
                                                        .value,
                                            })
                                        }
                                        style={{
                                            height: '120px',
                                        }}
                                    />
                                </div>

                                <div className="doc-section">
                                    <label className="doc-section-label">
                                        <StickyNote
                                            size={16}
                                        />
                                        Script / Core
                                        Content
                                    </label>

                                    <textarea
                                        className="doc-textarea script"
                                        placeholder="Write your long-form script or content here..."
                                        value={
                                            formData.script
                                        }
                                        readOnly={!canEdit}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                script:
                                                    e.target
                                                        .value,
                                            })
                                        }
                                    />
                                </div>

                                <ImageUploadSection
                                    initialImages={
                                        formData.uploadedImages?.length > 0
                                            ? formData.uploadedImages
                                            : formData.images || []
                                    }
                                    readOnly={!canEdit}
                                    onImagesChange={(newImages) =>
                                        setFormData({
                                            ...formData,
                                            images: newImages,
                                        })
                                    }
                                />
                            </>
                        )}
                    </div>
                </main>
            </div>
            {notification && (
                <Toast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
};

export default CreatePost;