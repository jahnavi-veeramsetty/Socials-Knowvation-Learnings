import React, { useState } from 'react';
import { X, Save, Send, Calendar as CalendarIcon, Type, FileText, Hash, Link as LinkIcon, StickyNote, Plus } from 'lucide-react';

const CreatePostModal = ({ isOpen, onClose, onSubmit, orgId }) => {
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
        notes: ''
    });

    const togglePlatform = (p) => {
        setFormData(prev => ({
            ...prev,
            platforms: prev.platforms.includes(p) 
                ? prev.platforms.filter(plat => plat !== p) 
                : [...prev.platforms, p]
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <style>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }
                .modal-content {
                    background: white;
                    width: 100%;
                    max-width: 800px;
                    max-height: 90vh;
                    border-radius: 24px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    color-scheme: light;
                }
                .modal-header {
                    padding: 24px 32px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-header h2 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 800;
                    color: #002B72;
                }
                .close-btn {
                    background: #f1f5f9;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #64748b;
                }
                .modal-body {
                    padding: 32px;
                    overflow-y: auto;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .form-group.full {
                    grid-column: span 2;
                }
                .form-label {
                    font-size: 13px;
                    font-weight: 700;
                    color: #334155;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .form-input, .form-select, .form-textarea {
                    width: 100%;
                    padding: 12px 16px;
                    border-radius: 12px;
                    border: 1.5px solid #e2e8f0;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s;
                    color: #333;
                    background: white;
                    color-scheme: light;
                }
                .form-input:focus, .form-select:focus, .form-textarea:focus {
                    border-color: #002B72;
                    box-shadow: 0 0 0 3px rgba(0, 43, 114, 0.1);
                }
                .form-textarea {
                    height: 100px;
                    resize: none;
                }
                .platform-pills {
                    display: flex;
                    gap: 8px;
                }
                .platform-pill {
                    padding: 8px 16px;
                    border-radius: 10px;
                    border: 1.5px solid #e2e8f0;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #64748b;
                }
                .platform-pill.active {
                    background: #002B72;
                    color: white;
                    border-color: #002B72;
                }
                .modal-footer {
                    padding: 24px 32px;
                    border-top: 1px solid #eee;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    background: #f8fafc;
                }
                .footer-btn {
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border: none;
                    transition: all 0.2s;
                }
                .btn-draft {
                    background: white;
                    color: #64748b;
                    border: 1.5px solid #e2e8f0;
                }
                .btn-submit {
                    background: #002B72;
                    color: white;
                }
                .footer-btn:hover {
                    transform: translateY(-2px);
                }
            `}</style>

            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Post</h2>
                    <button className="close-btn" onClick={onClose}><X size={18} /></button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Social Account</label>
                        <select 
                            className="form-select"
                            value={formData.social_account}
                            onChange={e => setFormData({...formData, social_account: e.target.value})}
                        >
                            <option value="KLM">KL Main (KLM)</option>
                            <option value="KLS">KL Select (KLS)</option>
                            <option value="KLC">KL Community (KLC)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Post Type</label>
                        <select 
                            className="form-select"
                            value={formData.post_type}
                            onChange={e => setFormData({...formData, post_type: e.target.value})}
                        >
                            <option value="reel">Reel</option>
                            <option value="story">Story</option>
                            <option value="carousel">Carousel</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Platforms</label>
                        <div className="platform-pills">
                            {['Instagram', 'LinkedIn', 'YouTube'].map(p => (
                                <div 
                                    key={p}
                                    className={`platform-pill ${formData.platforms.includes(p) ? 'active' : ''}`}
                                    onClick={() => togglePlatform(p)}
                                >
                                    {p}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label"><CalendarIcon size={14} /> Scheduled Date</label>
                        <input 
                            type="date"
                            className="form-input"
                            value={formData.scheduled_date}
                            onChange={e => setFormData({...formData, scheduled_date: e.target.value})}
                        />
                    </div>

                    <div className="form-group full">
                        <label className="form-label"><Type size={14} /> Post Title</label>
                        <input 
                            className="form-input"
                            placeholder="Enter a catchy title..."
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label"><FileText size={14} /> Caption</label>
                        <textarea 
                            className="form-textarea"
                            placeholder="Write the post caption..."
                            value={formData.caption}
                            onChange={e => setFormData({...formData, caption: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label"><StickyNote size={14} /> Script</label>
                        <textarea 
                            className="form-textarea"
                            placeholder="Write the script (for reels/videos)..."
                            value={formData.script}
                            onChange={e => setFormData({...formData, script: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label"><Hash size={14} /> Hashtags</label>
                        <textarea 
                            className="form-textarea"
                            placeholder="#hashtags #go #here"
                            value={formData.hashtags}
                            onChange={e => setFormData({...formData, hashtags: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label"><LinkIcon size={14} /> Reference Link</label>
                        <input 
                            className="form-input"
                            placeholder="https://..."
                            value={formData.reference_link}
                            onChange={e => setFormData({...formData, reference_link: e.target.value})}
                        />
                    </div>

                    <div className="form-group full">
                        <label className="form-label">Notes</label>
                        <textarea 
                            className="form-textarea"
                            placeholder="Any additional notes for the team..."
                            value={formData.notes}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="footer-btn btn-draft" onClick={() => onSubmit(formData, 'draft')}>
                        <Save size={18} />
                        Save as Draft
                    </button>
                    <button className="footer-btn btn-submit" onClick={() => onSubmit(formData, 'pending review')}>
                        <Send size={18} />
                        Submit Post
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;
