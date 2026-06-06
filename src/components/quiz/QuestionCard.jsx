import React from 'react';
import { Trash2, CheckCircle2, Circle } from 'lucide-react';

const QuestionCard = ({ question, index, onRemove, onTogglePosted }) => {
    const getDifficultyColor = (diff) => {
        switch (diff) {
            case 'easy': return '#4ade80';
            case 'medium': return '#fbbf24';
            case 'hard': return '#f87171';
            default: return '#ccc';
        }
    };

    return (
        <div className={`bg-light-card rounded-[20px] p-6 mb-5 border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-300 relative hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] ${question.isPosted ? 'bg-[rgba(10,25,54,0.6)] opacity-80' : ''}`}>
            {/* Card Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <span className="font-extrabold text-slate-900 text-sm">Q{index + 1}</span>
                    <span
                        className="text-[11px] font-bold uppercase py-1 px-2.5 rounded-full text-slate-900"
                        style={{ background: getDifficultyColor(question.difficulty) }}
                    >
                        {question.difficulty}
                    </span>
                    <button
                        className={`flex items-center gap-1.5 py-1.5 px-4 rounded-lg text-xs font-bold cursor-pointer transition-all duration-200 border-none ${question.isPosted ? 'bg-green-400 text-white' : 'bg-slate-100 text-slate-500'}`}
                        onClick={() => onTogglePosted(index)}
                    >
                        {question.isPosted && <CheckCircle2 size={14} />}
                        <span>Posted</span>
                    </button>
                </div>
                <div className="flex gap-2">
                    <button
                        className="text-red-400 bg-red-400/10 border-none w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-red-400 hover:text-white"
                        onClick={() => onRemove(index)}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Question Text */}
            <p className="text-[17px] font-semibold text-slate-900 m-0 mb-5 leading-[1.5]">{question.text}</p>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
                {question.options.map((opt, i) => (
                    <div
                        key={i}
                        className={`flex items-center gap-2.5 py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200 ${question.correctOption === i ? 'bg-green-400/10 border-green-400 text-green-400 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                        {question.correctOption === i ? <CheckCircle2 size={16} /> : <Circle size={16} color="#ccc" />}
                        <span>{opt}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionCard;
