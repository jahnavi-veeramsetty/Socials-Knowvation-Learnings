import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => { onClose(); }, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const getStyles = () => {
        switch (type) {
            case 'success': return { bg: '#f0fdf4', border: '#bcf0da', color: '#166534', icon: <CheckCircle size={18} /> };
            case 'error': return { bg: '#fef2f2', border: '#fecaca', color: '#991b1b', icon: <AlertCircle size={18} /> };
            default: return { bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af', icon: <Info size={18} /> };
        }
    };

    const styles = getStyles();

    return (
        <div
            className="fixed bottom-8 right-8 py-4 px-6 rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.08)] flex items-center gap-3 z-[9999] min-w-[300px] animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]"
            style={{ background: styles.bg, border: `1px solid ${styles.border}`, color: styles.color }}
        >
            <div className="flex items-center">{styles.icon}</div>
            <div className="text-sm font-bold flex-1">{message}</div>
            <button
                className="bg-none border-none cursor-pointer flex items-center p-1 transition-opacity duration-200 opacity-50 hover:opacity-100"
                style={{ color: 'currentColor' }}
                onClick={onClose}
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
