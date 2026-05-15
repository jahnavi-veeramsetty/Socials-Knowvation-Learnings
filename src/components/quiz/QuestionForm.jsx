import React from 'react';
import { Trash2, CheckCircle2, Circle } from 'lucide-react';

const QuestionForm = ({ question, index, updateQuestion, removeQuestion }) => {
    const handleOptionChange = (optIndex, value) => {
        const newOptions = [...question.options];
        newOptions[optIndex] = value;
        updateQuestion(index, { options: newOptions });
    };

    const handleCorrectOption = (optIndex) => {
        updateQuestion(index, { correctOption: optIndex });
    };

    return (
        <div className="question-card">
            <style>{`
                .question-card {
                    background: white;
                    border-radius: 24px;
                    padding: 32px;
                    margin-bottom: 24px;
                    border: 1px solid #eee;
                    box-shadow: 0 4px 20px rgba(0, 43, 114, 0.05);
                    transition: all 0.3s ease;
                    color-scheme: light;
                }
                .question-card:hover {
                    box-shadow: 0 8px 30px rgba(0, 43, 114, 0.1);
                }
                .question-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .question-number {
                    background: rgba(0, 43, 114, 0.08);
                    color: #002B72;
                    padding: 4px 12px;
                    border-radius: 999px;
                    font-size: 13px;
                    font-weight: 700;
                }
                .difficulty-select {
                    padding: 8px 12px;
                    border-radius: 10px;
                    border: 1.5px solid #eee;
                    font-size: 14px;
                    color: #555;
                    outline: none;
                    cursor: pointer;
                    background: white;
                    color-scheme: light;
                }
                .difficulty-select:focus {
                    border-color: #002B72;
                }
                .question-input {
                    width: 100%;
                    padding: 16px;
                    border-radius: 12px;
                    border: 1.5px solid #eee;
                    font-size: 16px;
                    margin-bottom: 24px;
                    outline: none;
                    transition: all 0.2s;
                    box-sizing: border-box;
                    color: #333;
                    background: white;
                    color-scheme: light;
                }
                .question-input:focus {
                    border-color: #002B72;
                    box-shadow: 0 0 0 4px rgba(0, 43, 114, 0.05);
                }
                .options-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                .option-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #fcfcfc;
                    padding: 12px 16px;
                    border-radius: 12px;
                    border: 1.5px solid #eee;
                    transition: all 0.2s;
                }
                .option-item.correct {
                    border-color: #4ade80;
                    background: #f0fdf4;
                }
                .option-input {
                    flex: 1;
                    border: none;
                    background: transparent;
                    font-size: 15px;
                    outline: none;
                    color: #333;
                }
                .correct-toggle {
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #ccc;
                    transition: all 0.2s;
                }
                .correct-toggle.active {
                    color: #4ade80;
                }
                .remove-btn {
                    color: #ff4d4f;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .remove-btn:hover {
                    background: #fff1f0;
                }
                @media (max-width: 600px) {
                    .options-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <div className="question-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="question-number">Question {index + 1}</span>
                    <select 
                        className="difficulty-select"
                        value={question.difficulty}
                        onChange={(e) => updateQuestion(index, { difficulty: e.target.value })}
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
                <button className="remove-btn" onClick={() => removeQuestion(index)}>
                    <Trash2 size={18} />
                </button>
            </div>

            <input 
                type="text" 
                className="question-input" 
                placeholder="Enter your question here..."
                value={question.text}
                onChange={(e) => updateQuestion(index, { text: e.target.value })}
            />

            <div className="options-grid">
                {question.options.map((option, optIndex) => (
                    <div key={optIndex} className={`option-item ${question.correctOption === optIndex ? 'correct' : ''}`}>
                        <div 
                            className={`correct-toggle ${question.correctOption === optIndex ? 'active' : ''}`}
                            onClick={() => handleCorrectOption(optIndex)}
                        >
                            {question.correctOption === optIndex ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </div>
                        <input 
                            type="text" 
                            className="option-input" 
                            placeholder={`Option ${optIndex + 1}`}
                            value={option}
                            onChange={(e) => handleOptionChange(optIndex, e.target.value)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionForm;
