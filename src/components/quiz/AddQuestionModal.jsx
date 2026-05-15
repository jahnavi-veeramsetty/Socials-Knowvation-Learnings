import React, { useState } from 'react';
import { X, CheckCircle2, Circle } from 'lucide-react';

const AddQuestionModal = ({ isOpen, onClose, onAdd }) => {
    const [question, setQuestion] = useState({
        text: '',
        difficulty: 'easy',
        options: ['', '', '', ''],
        correctOption: 0
    });

    if (!isOpen) return null;

    const handleOptionChange = (idx, val) => {
        const newOptions = [...question.options];
        newOptions[idx] = val;
        setQuestion({ ...question, options: newOptions });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!question.text.trim() || question.options.some(opt => !opt.trim())) {
            alert("Please fill in all fields.");
            return;
        }
        onAdd(question);
        setQuestion({
            text: '',
            difficulty: 'easy',
            options: ['', '', '', ''],
            correctOption: 0
        });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <style>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 43, 114, 0.4);
                    backdrop-filter: blur(6px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 20px;
                }
                .modal-content {
                    background: white;
                    width: 100%;
                    max-width: 500px;
                    border-radius: 24px;
                    padding: 32px;
                    position: relative;
                    box-shadow: 0 25px 50px -12px rgba(0, 43, 114, 0.25);
                    animation: slideUp 0.3s ease-out;
                    color-scheme: light;
                }
                .close-btn {
                    position: absolute;
                    top: 24px;
                    right: 24px;
                    background: #f7f9fc;
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #666;
                }
                .modal-title {
                    color: #002B72;
                    font-size: 20px;
                    font-weight: 800;
                    margin: 0 0 24px;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-label {
                    display: block;
                    font-size: 14px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 8px;
                    padding-left: 4px;
                }
                .modal-input {
                    width: 100%;
                    padding: 12px 16px;
                    border-radius: 12px;
                    border: 1.5px solid #eee;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s;
                    box-sizing: border-box;
                    color: #333;
                    background: white;
                    color-scheme: light;
                }
                .modal-input:focus {
                    border-color: #002B72;
                    background: white;
                }
                .options-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                .opt-input-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #fcfcfc;
                    padding: 10px 14px;
                    border-radius: 12px;
                    border: 1.5px solid #eee;
                }
                .opt-input-wrapper.active {
                    border-color: #4ade80;
                    background: #f0fdf4;
                }
                .radio-btn {
                    cursor: pointer;
                    color: #ccc;
                }
                .radio-btn.active {
                    color: #4ade80;
                }
                .submit-modal-btn {
                    width: 100%;
                    background: #002B72;
                    color: white;
                    border: none;
                    padding: 16px;
                    border-radius: 16px;
                    font-weight: 700;
                    font-size: 16px;
                    cursor: pointer;
                    margin-top: 12px;
                    transition: all 0.2s;
                }
                .submit-modal-btn:hover {
                    background: #001f54;
                    transform: translateY(-2px);
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>

            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}><X size={20} /></button>
                <h2 className="modal-title">Add New Question</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Difficulty</label>
                        <select 
                            className="modal-input"
                            value={question.difficulty}
                            onChange={(e) => setQuestion({ ...question, difficulty: e.target.value })}
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Question Text</label>
                        <input 
                            className="modal-input"
                            placeholder="Type your question..."
                            value={question.text}
                            onChange={(e) => setQuestion({ ...question, text: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Options (Select the correct one)</label>
                        <div className="options-grid">
                            {question.options.map((opt, i) => (
                                <div key={i} className={`opt-input-wrapper ${question.correctOption === i ? 'active' : ''}`}>
                                    <div 
                                        className={`radio-btn ${question.correctOption === i ? 'active' : ''}`}
                                        onClick={() => setQuestion({ ...question, correctOption: i })}
                                    >
                                        {question.correctOption === i ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                    </div>
                                    <input 
                                        className="modal-input" 
                                        style={{ border: 'none', padding: 0, background: 'transparent' }}
                                        placeholder={`Option ${i+1}`}
                                        value={opt}
                                        onChange={(e) => handleOptionChange(i, e.target.value)}
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="submit-modal-btn">Add to Quiz</button>
                </form>
            </div>
        </div>
    );
};

export default AddQuestionModal;
