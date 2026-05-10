import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ConfirmModal = ({ title, message, onConfirm, onCancel, onDiscard, confirmText = 'Save & Exit', discardText = 'Discard' }) => {
    return (
        <div className="modal-overlay">
            <style>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 43, 114, 0.4);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    animation: fadeIn 0.2s ease-out;
                }
                .confirm-modal {
                    background: white;
                    width: 440px;
                    padding: 40px;
                    border-radius: 32px;
                    box-shadow: 0 25px 50px -12px rgba(0, 43, 114, 0.25);
                    text-align: center;
                    position: relative;
                }
                .modal-icon {
                    width: 64px;
                    height: 64px;
                    background: #fffbeb;
                    color: #f59e0b;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px;
                    transform: rotate(-5deg);
                }
                .confirm-modal h2 {
                    font-size: 24px;
                    font-weight: 800;
                    color: #002B72;
                    margin: 0 0 12px;
                    letter-spacing: -0.5px;
                }
                .confirm-modal p {
                    font-size: 15px;
                    color: #64748b;
                    line-height: 1.6;
                    margin-bottom: 32px;
                }
                .modal-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .modal-btn {
                    width: 100%;
                    padding: 14px;
                    border-radius: 14px;
                    font-weight: 700;
                    font-size: 15px;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s;
                }
                .btn-primary {
                    background: #002B72;
                    color: white;
                    box-shadow: 0 4px 12px rgba(0, 43, 114, 0.2);
                }
                .btn-primary:hover {
                    background: #001f54;
                    transform: translateY(-1px);
                }
                .btn-danger {
                    background: #fff1f0;
                    color: #ff4d4f;
                }
                .btn-danger:hover {
                    background: #ffccc7;
                }
                .btn-ghost {
                    background: transparent;
                    color: #94a3b8;
                }
                .btn-ghost:hover {
                    color: #64748b;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>

            <div className="confirm-modal">
                <div className="modal-icon">
                    <AlertCircle size={32} />
                </div>
                <h2>{title}</h2>
                <p>{message}</p>
                <div className="modal-actions">
                    <button className="modal-btn btn-primary" onClick={onConfirm}>
                        {confirmText}
                    </button>
                    {onDiscard && (
                        <button className="modal-btn btn-danger" onClick={onDiscard}>
                            {discardText}
                        </button>
                    )}
                    <button className="modal-btn btn-ghost" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
