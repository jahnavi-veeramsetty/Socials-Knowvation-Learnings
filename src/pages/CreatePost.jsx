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
} from 'lucide-react';

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
    });

    useEffect(() => {
        fetchInitialData();
    }, [postId]);

    const fetchInitialData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUserId(user.id);

        if (postId) {
            setLoading(true);
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('id', postId)
                .single();

            if (data) {
                setFormData(data);
                setCanEdit(data.created_by === user.id);
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

            // =========================
            // UPDATE EXISTING POST
            // =========================

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

            // =========================
            // CREATE NEW POST
            // =========================

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

            // =========================
            // ACTIVITY LOG
            // =========================

            if (status === 'pending review') {

                await supabase
                    .from('activity_log')
                    .insert([
                        {
                            organization_id: orgId,
                            user_id: currentUserId,
                            post_id: savedPostId,
                            action_type: 'submit',
                            action_text: `submitted "${formData.title || 'Untitled'}"`
                        }
                    ]);
            }

            // =========================
            // SUCCESS
            // =========================

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
                    background: #fff;
                    min-height: 100vh;
                    font-family: 'Inter', sans-serif;
                    display: flex;
                    flex-direction: column;
                }

                .editor-header {
                    position: sticky;
                    top: 0;
                    background: white;
                    border-bottom: 1px solid #eee;
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
                    color: #64748b;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    border: none;
                    background: none;
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
                    background: #f8fafc;
                    color: #64748b;
                    border: 1.5px solid #e2e8f0;
                }

                .btn-primary {
                    background: #002B72;
                    color: white;
                }

                .editor-layout {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    flex: 1;
                    height: calc(100vh - 73px);
                }

                .metadata-sidebar {
                    border-right: 1px solid #eee;
                    padding: 32px;
                    overflow-y: auto;
                    background: #fbfcfd;
                    display: flex;
                    flex-direction: column;
                    gap: 28px;
                }

                .doc-editor {
                    padding: 60px 100px;
                    overflow-y: auto;
                    background: white;
                }

                .doc-container {
                    max-width: 800px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 40px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .sidebar-label {
                    font-size: 12px;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .sidebar-select,
                .sidebar-input {
                    width: 100%;
                    padding: 12px;
                    border-radius: 10px;
                    border: 1.5px solid #e2e8f0;
                    font-size: 14px;
                    font-weight: 600;
                    background: white;
                    outline: none;
                }

                .platform-pills {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }

                .platform-pill {
                    padding: 10px;
                    border-radius: 10px;
                    border: 1.5px solid #e2e8f0;
                    font-size: 12px;
                    font-weight: 700;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: white;
                }

                .platform-pill.active {
                    background: #002B72;
                    color: white;
                    border-color: #002B72;
                }

                .doc-title-input {
                    font-size: 42px;
                    font-weight: 800;
                    border: none;
                    outline: none;
                    color: #002B72;
                    width: 100%;
                    padding: 0;
                }

                .doc-textarea {
                    width: 100%;
                    min-height: 100px;
                    border: none;
                    outline: none;
                    font-size: 16px;
                    line-height: 1.6;
                    color: #334155;
                    resize: none;
                    font-family: inherit;
                    padding: 0;
                }

                .doc-textarea.script {
                    min-height: 300px;
                    background: #fafafa;
                    padding: 20px;
                    border-radius: 12px;
                    font-family: 'Courier New', monospace;
                    font-size: 15px;
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
                    border-bottom: 1px solid #f1f5f9;
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

                    <div
                        className="form-group"
                        style={{
                            marginTop: '20px',
                            padding: '20px',
                            background: '#eef2ff',
                            borderRadius: '16px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                gap: '8px',
                                color: '#002B72',
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
                                color: '#4338ca',
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

                                <div className="doc-section">
                                    <label className="doc-section-label">
                                        <Hash size={16} />
                                        Hashtags
                                    </label>

                                    <textarea
                                        className="doc-textarea"
                                        placeholder="#hashtags"
                                        value={
                                            formData.hashtags
                                        }
                                        readOnly={!canEdit}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                hashtags:
                                                    e.target
                                                        .value,
                                            })
                                        }
                                        style={{
                                            height: '60px',
                                        }}
                                    />
                                </div>

                                <div className="doc-section">
                                    <label className="doc-section-label">
                                        <LinkIcon
                                            size={16}
                                        />
                                        Reference Links
                                    </label>

                                    <input
                                        className="sidebar-input"
                                        placeholder="https://..."
                                        value={
                                            formData.reference_link
                                        }
                                        readOnly={!canEdit}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                reference_link:
                                                    e.target
                                                        .value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="doc-section">
                                    <label className="doc-section-label">
                                        <Info size={16} />
                                        Internal Notes
                                    </label>

                                    <textarea
                                        className="doc-textarea"
                                        placeholder="Add internal notes..."
                                        value={
                                            formData.notes
                                        }
                                        readOnly={!canEdit}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                notes:
                                                    e.target
                                                        .value,
                                            })
                                        }
                                        style={{
                                            height: '80px',
                                        }}
                                    />
                                </div>
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