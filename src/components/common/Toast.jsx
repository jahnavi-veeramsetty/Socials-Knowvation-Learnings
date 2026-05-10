import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);
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
        <div className="toast-notification">
            <style>{`
                .toast-notification {
                    position: fixed;
                    bottom: 32px;
                    right: 32px;
                    background: ${styles.bg};
                    border: 1px solid ${styles.border};
                    color: ${styles.color};
                    padding: 16px 24px;
                    border-radius: 16px;
                    box-shadow: 0 12px 24px rgba(0,0,0,0.08);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 9999;
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    min-width: 300px;
                }
                .toast-icon {
                    display: flex;
                    align-items: center;
                }
                .toast-message {
                    font-size: 14px;
                    font-weight: 700;
                    flex: 1;
                }
                .toast-close {
                    background: none;
                    border: none;
                    color: currentColor;
                    opacity: 0.5;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    padding: 4px;
                    transition: opacity 0.2s;
                }
                .toast-close:hover {
                    opacity: 1;
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
            
            <div className="toast-icon">{styles.icon}</div>
            <div className="toast-message">{message}</div>
            <button className="toast-close" onClick={onClose}>
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
