import React from 'react';
import { Trash2, CheckCircle2, Circle } from 'lucide-react';

const QuestionCard = ({ question, index, onRemove, onTogglePosted }) => {
    const getDifficultyColor = (diff) => {
        switch(diff) {
            case 'easy': return '#4ade80';
            case 'medium': return '#fbbf24';
            case 'hard': return '#f87171';
            default: return '#ccc';
        }
    };

    return (
        <div className={`question-display-card ${question.isPosted ? 'is-posted' : ''}`}>
            <style>{`
                .question-display-card {
                    background: white;
                    border-radius: 20px;
                    padding: 24px;
                    margin-bottom: 20px;
                    border: 1px solid #f0f0f0;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
                    transition: all 0.3s ease;
                    position: relative;
                }
                .question-display-card.is-posted {
                    background: #f8fafc;
                    opacity: 0.7;
                    border-color: #e2e8f0;
                }
                .question-display-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0, 43, 114, 0.08);
                }
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 16px;
                }
                .q-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .q-num {
                    font-weight: 800;
                    color: #002B72;
                    font-size: 14px;
                }
                .diff-badge {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    padding: 4px 10px;
                    border-radius: 999px;
                    color: white;
                }
                .q-text {
                    font-size: 17px;
                    font-weight: 600;
                    color: #111;
                    margin: 0 0 20px;
                    line-height: 1.5;
                }
                .options-grid-display {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                .opt-item-display {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 16px;
                    border-radius: 12px;
                    background: #f9fafb;
                    border: 1px solid #eee;
                    font-size: 14px;
                }
                .opt-item-display.is-correct {
                    background: #f0fdf4;
                    border-color: #4ade80;
                    color: #166534;
                    font-weight: 600;
                }
                .card-actions {
                    display: flex;
                    gap: 8px;
                }
                .remove-card-btn {
                    color: #ff4d4f;
                    background: #fff1f0;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .remove-card-btn:hover {
                    background: #ff4d4f;
                    color: white;
                }
                .posted-toggle {
                    background: #f1f5f9;
                    color: #64748b;
                    border: none;
                    padding: 6px 16px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .posted-toggle.active {
                    background: #4ade80;
                    color: white;
                }
            `}</style>

            <div className="card-header">
                <div className="q-info">
                    <span className="q-num">Q{index + 1}</span>
                    <span 
                        className="diff-badge" 
                        style={{ background: getDifficultyColor(question.difficulty) }}
                    >
                        {question.difficulty}
                    </span>
                    
                    <button 
                        className={`posted-toggle ${question.isPosted ? 'active' : ''}`}
                        onClick={() => onTogglePosted(index)}
                    >
                        {question.isPosted && <CheckCircle2 size={14} />}
                        <span>Posted</span>
                    </button>
                </div>
                <div className="card-actions">
                    <button className="remove-card-btn" onClick={() => onRemove(index)}>
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <p className="q-text">{question.text}</p>

            <div className="options-grid-display">
                {question.options.map((opt, i) => (
                    <div key={i} className={`opt-item-display ${question.correctOption === i ? 'is-correct' : ''}`}>
                        {question.correctOption === i ? <CheckCircle2 size={16} /> : <Circle size={16} color="#ccc" />}
                        <span>{opt}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionCard;
