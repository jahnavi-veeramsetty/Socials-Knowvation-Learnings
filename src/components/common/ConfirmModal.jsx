import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ConfirmModal = ({ title, message, onConfirm, onCancel, onDiscard, confirmText = 'Save & Exit', discardText = 'Discard' }) => {
    return (
        <div className="fixed inset-0 bg-brand/40 backdrop-blur-lg flex items-center justify-center z-[9999] animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white w-[440px] p-10 rounded-[32px] shadow-[0_25px_50px_-12px_rgba(0,43,114,0.25)] text-center relative">
                <div className="w-16 h-16 bg-amber-50 text-amber-400 rounded-[20px] flex items-center justify-center mx-auto mb-6 -rotate-[5deg]">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-2xl font-extrabold text-brand m-0 mb-3 tracking-[-0.5px]">{title}</h2>
                <p className="text-sm text-slate-500 leading-[1.6] mb-8">{message}</p>
                <div className="flex flex-col gap-3">
                    <button
                        className="w-full py-3.5 rounded-2xl font-bold text-[15px] cursor-pointer border-none transition-all duration-200 bg-brand text-white shadow-[0_4px_12px_rgba(0,43,114,0.2)] hover:bg-brand-hover hover:-translate-y-px"
                        onClick={onConfirm}
                    >{confirmText}</button>
                    {onDiscard && (
                        <button
                            className="w-full py-3.5 rounded-2xl font-bold text-[15px] cursor-pointer border-none transition-all duration-200 bg-red-50 text-red-400 hover:bg-red-100"
                            onClick={onDiscard}
                        >{discardText}</button>
                    )}
                    <button
                        className="w-full py-3.5 rounded-2xl font-bold text-[15px] cursor-pointer border-none transition-all duration-200 bg-transparent text-slate-500 hover:text-slate-600"
                        onClick={onCancel}
                    >Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
