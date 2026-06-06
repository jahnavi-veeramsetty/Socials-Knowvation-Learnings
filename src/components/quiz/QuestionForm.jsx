import React from 'react';
import { Trash2, CheckCircle2, Circle } from 'lucide-react';
import CustomSelect from '../common/CustomSelect';

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
        <div className="bg-white rounded-3xl p-8 mb-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,43,114,0.05)] transition-all duration-300 [color-scheme:light] hover:shadow-[0_8px_30px_rgba(0,43,114,0.1)]">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <span className="bg-brand/[0.08] text-brand py-1 px-3 rounded-full text-[13px] font-bold">Question {index + 1}</span>
                    <div className="w-[120px]">
                        <CustomSelect
                            className="py-2 px-3 rounded-xl border-[1.5px] border-slate-200 text-sm text-gray-600 outline-none cursor-pointer bg-white [color-scheme:light] focus:border-brand"
                            value={question.difficulty}
                            onChange={val => updateQuestion(index, { difficulty: val })}
                            options={[
                                { value: 'easy', label: 'Easy' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'hard', label: 'Hard' }
                            ]}
                        />
                    </div>
                </div>
                <button
                    className="text-red-400 cursor-pointer p-2 rounded-lg transition-all duration-200 flex items-center justify-center bg-transparent border-none hover:bg-red-50"
                    onClick={() => removeQuestion(index)}
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Input */}
            <input
                type="text"
                className="w-full py-4 px-4 rounded-xl border-[1.5px] border-slate-200 text-base mb-6 outline-none transition-all duration-200 box-border text-gray-700 bg-white [color-scheme:light] focus:border-brand focus:shadow-[0_0_0_4px_rgba(0,43,114,0.05)]"
                placeholder="Enter your question here..."
                value={question.text}
                onChange={e => updateQuestion(index, { text: e.target.value })}
            />

            {/* Options */}
            <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                {question.options.map((option, optIndex) => (
                    <div
                        key={optIndex}
                        className={`flex items-center gap-3 bg-slate-50 py-3 px-4 rounded-xl border-[1.5px] transition-all duration-200 ${question.correctOption === optIndex ? 'border-green-400 bg-green-50' : 'border-slate-200'}`}
                    >
                        <div
                            className={`cursor-pointer flex items-center justify-center transition-all duration-200 ${question.correctOption === optIndex ? 'text-green-400' : 'text-slate-600'}`}
                            onClick={() => handleCorrectOption(optIndex)}
                        >
                            {question.correctOption === optIndex ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </div>
                        <input
                            type="text"
                            className="flex-1 border-none bg-transparent text-[15px] outline-none text-gray-700"
                            placeholder={`Option ${optIndex + 1}`}
                            value={option}
                            onChange={e => handleOptionChange(optIndex, e.target.value)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionForm;
