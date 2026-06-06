import React, { useState } from 'react';
import { X, Save, Send, Calendar as CalendarIcon, Type, FileText, Hash, Link as LinkIcon, StickyNote, Plus } from 'lucide-react';
import CustomSelect from '../common/CustomSelect';

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

    const inputClass = "w-full py-3 px-4 rounded-xl border border-slate-200 text-sm outline-none transition-all duration-200 text-gray-700 bg-white [color-scheme:light] focus:border-brand focus:shadow-[0_0_0_3px_rgba(0,43,114,0.1)]";
    const labelClass = "text-[13px] font-bold text-slate-600 flex items-center gap-1.5";

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-5"
            onClick={onClose}>
            <div className="bg-white w-full max-w-[800px] max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] [color-scheme:light]"
                onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="py-6 px-8 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="m-0 text-xl font-extrabold text-brand">Create New Post</h2>
                    <button className="bg-slate-100 border-none w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-slate-500 hover:bg-slate-200"
                        onClick={onClose}><X size={18} /></button>
                </div>

                {/* Body */}
                <div className="py-8 px-8 overflow-y-auto grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Social Account</label>
                        <CustomSelect 
                            className={inputClass} 
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
                        <label className={labelClass}>Post Type</label>
                        <CustomSelect 
                            className={inputClass} 
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
                        <label className={labelClass}>Platforms</label>
                        <div className="flex gap-2">
                            {['Instagram', 'LinkedIn', 'YouTube'].map(p => (
                                <div
                                    key={p}
                                    className={`py-2 px-4 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-200 ${formData.platforms.includes(p) ? 'bg-brand text-white border-brand' : 'border-slate-200 text-slate-500 hover:border-brand hover:text-brand'}`}
                                    onClick={() => togglePlatform(p)}
                                >{p}</div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}><CalendarIcon size={14} /> Scheduled Date</label>
                        <input type="date" className={inputClass} value={formData.scheduled_date} onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })} />
                    </div>

                    <div className="col-span-2 flex flex-col gap-2">
                        <label className={labelClass}><Type size={14} /> Post Title</label>
                        <input className={inputClass} placeholder="Enter a catchy title..." value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}><FileText size={14} /> Caption</label>
                        <textarea className={`${inputClass} h-[100px] resize-none`} placeholder="Write the post caption..." value={formData.caption} onChange={e => setFormData({ ...formData, caption: e.target.value })} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}><StickyNote size={14} /> Script</label>
                        <textarea className={`${inputClass} h-[100px] resize-none`} placeholder="Write the script (for reels/videos)..." value={formData.script} onChange={e => setFormData({ ...formData, script: e.target.value })} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}><Hash size={14} /> Hashtags</label>
                        <textarea className={`${inputClass} h-[100px] resize-none`} placeholder="#hashtags #go #here" value={formData.hashtags} onChange={e => setFormData({ ...formData, hashtags: e.target.value })} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}><LinkIcon size={14} /> Reference Link</label>
                        <input className={inputClass} placeholder="https://..." value={formData.reference_link} onChange={e => setFormData({ ...formData, reference_link: e.target.value })} />
                    </div>

                    <div className="col-span-2 flex flex-col gap-2">
                        <label className={labelClass}>Notes</label>
                        <textarea className={`${inputClass} h-[100px] resize-none`} placeholder="Any additional notes for the team..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                    </div>
                </div>

                {/* Footer */}
                <div className="py-6 px-8 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
                    <button className="py-3 px-6 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 border-none transition-all duration-200 bg-white text-slate-500 border-[1.5px] border-slate-200 hover:-translate-y-0.5"
                        style={{ border: '1.5px solid #e2e8f0' }}
                        onClick={() => onSubmit(formData, 'draft')}>
                        <Save size={18} />Save as Draft
                    </button>
                    <button className="py-3 px-6 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 border-none transition-all duration-200 bg-brand text-white hover:bg-brand-hover hover:-translate-y-0.5"
                        onClick={() => onSubmit(formData, 'pending review')}>
                        <Send size={18} />Submit Post
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;
