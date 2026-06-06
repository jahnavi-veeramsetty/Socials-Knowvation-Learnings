import React from 'react';
import { Trash2 } from 'lucide-react';

const DeletePostModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-brand/40 backdrop-blur-lg flex items-center justify-center z-[9999] animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white w-[440px] p-10 rounded-[32px] shadow-[0_25px_50px_-12px_rgba(0,43,114,0.25)] text-center relative">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-[20px] flex items-center justify-center mx-auto mb-6 -rotate-[5deg]">
                    <Trash2 size={32} />
                </div>
                
                <h2 className="text-2xl font-extrabold text-slate-900 m-0 mb-3 tracking-[-0.5px]">Delete Post?</h2>
                <p className="text-sm text-slate-500 leading-[1.6] mb-8">
                    Are you sure you want to delete this post? This action cannot be undone and will permanently remove all associated data.
                </p>
                
                <div className="flex flex-col gap-3">
                    <button
                        className="w-full py-3.5 rounded-2xl font-bold text-[15px] cursor-pointer border-none transition-all duration-200 bg-red-500 text-white shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:bg-red-600 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Yes, Delete Post'}
                    </button>
                    <button
                        className="w-full py-3.5 rounded-2xl font-bold text-[15px] cursor-pointer border-none transition-all duration-200 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeletePostModal;
