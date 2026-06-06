import React, { useState } from 'react';
import { X, CheckCircle2, Circle } from 'lucide-react';
import CustomSelect from '../common/CustomSelect';

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
        setQuestion({ text: '', difficulty: 'easy', options: ['', '', '', ''], correctOption: 0 });
        onClose();
    };

    const inputClass = "w-full py-3 px-4 rounded-xl border-[1.5px] border-slate-200 text-sm outline-none transition-all duration-200 text-gray-700 bg-white [color-scheme:light] box-border focus:border-brand focus:bg-white";

    return (
        <div className="fixed inset-0 bg-brand/40 backdrop-blur-md flex items-center justify-center z-[2000] p-5"
            onClick={onClose}>
            <div className="bg-white w-full max-w-[500px] rounded-3xl p-8 relative shadow-[0_25px_50px_-12px_rgba(0,43,114,0.25)] animate-[slideUp_0.3s_ease-out] [color-scheme:light]"
                onClick={e => e.stopPropagation()}>
                <button className="absolute top-6 right-6 bg-slate-100 border-none w-9 h-9 rounded-full flex items-center justify-center cursor-pointer text-slate-500 hover:bg-slate-200"
                    onClick={onClose}>
                    <X size={20} />
                </button>
                <h2 className="text-brand text-xl font-extrabold m-0 mb-6">Add New Question</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-600 mb-2 pl-1">Difficulty</label>
                        <CustomSelect
                            className={inputClass}
                            value={question.difficulty}
                            onChange={val => setQuestion({ ...question, difficulty: val })}
                            options={[
                                { value: 'easy', label: 'Easy' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'hard', label: 'Hard' }
                            ]}
                        />
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-600 mb-2 pl-1">Question Text</label>
                        <input
                            className={inputClass}
                            placeholder="Type your question..."
                            value={question.text}
                            onChange={e => setQuestion({ ...question, text: e.target.value })}
                            required
                        />
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-600 mb-2 pl-1">Options (Select the correct one)</label>
                        <div className="grid grid-cols-2 gap-3">
                            {question.options.map((opt, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl border-[1.5px] transition-all duration-200 ${question.correctOption === i ? 'border-green-400 bg-green-50' : 'bg-slate-50 border-slate-200'}`}
                                >
                                    <div
                                        className={`cursor-pointer transition-colors duration-200 ${question.correctOption === i ? 'text-green-400' : 'text-slate-600'}`}
                                        onClick={() => setQuestion({ ...question, correctOption: i })}
                                    >
                                        {question.correctOption === i ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                    </div>
                                    <input
                                        className="border-none p-0 bg-transparent outline-none text-sm text-gray-700 flex-1"
                                        placeholder={`Option ${i + 1}`}
                                        value={opt}
                                        onChange={e => handleOptionChange(i, e.target.value)}
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-brand text-white border-none py-4 rounded-2xl font-bold text-base cursor-pointer mt-3 transition-all duration-200 hover:bg-brand-hover hover:-translate-y-0.5"
                    >Add to Quiz</button>
                </form>
            </div>
        </div>
    );
};

export default AddQuestionModal;
