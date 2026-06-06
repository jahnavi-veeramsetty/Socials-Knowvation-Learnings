import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, BrainCircuit } from 'lucide-react';
import { useParams } from 'react-router-dom';
import QuestionCard from '../components/quiz/QuestionCard';
import AddQuestionModal from '../components/quiz/AddQuestionModal';
import CustomSelect from '../components/common/CustomSelect';
import { supabase } from '../supabase/supabase';

const Quiz = () => {
    const { orgId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (orgId) fetchQuestions();
    }, [orgId]);

    const fetchQuestions = async () => {
        const { data, error } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false });
        if (error) { console.error(error); return; }
        const formattedQuestions = data.map(q => ({
            id: q.id, text: q.question_text, difficulty: q.difficulty,
            options: q.options, correctOption: q.correct_option, isPosted: q.is_posted,
        }));
        setQuestions(formattedQuestions);
    };

    const handleAddQuestion = async (newQuestion) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { alert('User not logged in'); return; }
        const { data, error } = await supabase
            .from('quiz_questions')
            .insert([{
                organization_id: orgId, question_text: newQuestion.text,
                difficulty: newQuestion.difficulty, options: newQuestion.options,
                correct_option: newQuestion.correctOption, created_by: user.id,
            }]).select().single();
        if (error) { console.error(error); alert(error.message); return; }
        const formattedQuestion = {
            id: data.id, text: data.question_text, difficulty: data.difficulty,
            options: data.options, correctOption: data.correct_option, isPosted: data.is_posted,
        };
        setQuestions([formattedQuestion, ...questions]);
    };

    const handleTogglePosted = async (index) => {
        const questionId = filteredQuestions[index].id;
        const qIndex = questions.findIndex(q => q.id === questionId);
        const updatedStatus = !questions[qIndex].isPosted;
        const { error } = await supabase.from('quiz_questions').update({ is_posted: updatedStatus }).eq('id', questionId);
        if (error) { console.error(error); return; }
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].isPosted = updatedStatus;
        setQuestions(updatedQuestions);
    };

    const handleRemoveQuestion = async (index) => {
        const question = questions[index];
        const { error } = await supabase.from('quiz_questions').delete().eq('id', question.id);
        if (error) { console.error(error); return; }
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const filteredQuestions = questions
        .filter(q => {
            const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
            return matchesSearch && matchesDifficulty;
        })
        .sort((a, b) => {
            if (a.isPosted === b.isPosted) return 0;
            return a.isPosted ? 1 : -1;
        });

    return (
        <div className="p-10 font-sans max-w-[1100px] mx-auto bg-light-bg min-h-screen text-slate-900">
            {/* Top Bar */}
            <div className="flex gap-5 mb-10 items-center">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        className="w-full py-3.5 pl-12 pr-3.5 rounded-2xl border border-slate-200 text-[15px] outline-none transition-all duration-200 bg-light-card text-slate-900 box-border focus:border-brand focus:bg-slate-100"
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 bg-light-card py-2.5 px-4 rounded-2xl border border-slate-200">
                    <Filter size={18} color="#666" />
                    <div className="w-[150px]">
                        <CustomSelect
                            className="border-none font-bold text-slate-600 outline-none bg-transparent cursor-pointer text-sm"
                            value={filterDifficulty}
                            onChange={val => setFilterDifficulty(val)}
                            options={[
                                { value: 'all', label: 'All Difficulties' },
                                { value: 'easy', label: 'Easy' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'hard', label: 'Hard' }
                            ]}
                        />
                    </div>
                </div>

                <button
                    className="bg-brand text-white py-3.5 px-6 rounded-2xl flex items-center gap-2.5 font-bold cursor-pointer transition-all duration-200 border-none whitespace-nowrap hover:bg-brand-hover hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)]"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={20} />
                    Add Question
                </button>
            </div>

            {/* Questions List */}
            <div>
                {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((q, i) => (
                        <QuestionCard
                            key={q.id}
                            index={i}
                            question={q}
                            onRemove={() => handleRemoveQuestion(questions.findIndex(orig => orig.id === q.id))}
                            onTogglePosted={handleTogglePosted}
                        />
                    ))
                ) : (
                    <div className="text-center py-20 bg-light-card rounded-3xl border-2 border-dashed border-slate-200 text-slate-500">
                        <BrainCircuit size={48} strokeWidth={1} className="mx-auto mb-4" />
                        <p>
                            {questions.length === 0
                                ? "No questions added yet. Click 'Add Question' to start."
                                : 'No questions match your search/filter.'}
                        </p>
                    </div>
                )}
            </div>

            <AddQuestionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddQuestion}
            />
        </div>
    );
};

export default Quiz;