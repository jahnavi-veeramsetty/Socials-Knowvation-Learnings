import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, BrainCircuit } from 'lucide-react';
import { useParams } from 'react-router-dom';

import QuestionCard from '../components/quiz/QuestionCard';
import AddQuestionModal from '../components/quiz/AddQuestionModal';

import { supabase } from '../supabase/supabase';

const Quiz = () => {
    const { orgId } = useParams();

    const [questions, setQuestions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (orgId) {
            fetchQuestions();
        }
    }, [orgId]);

    const fetchQuestions = async () => {
        const { data, error } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            return;
        }

        const formattedQuestions = data.map((q) => ({
            id: q.id,
            text: q.question_text,
            difficulty: q.difficulty,
            options: q.options,
            correctOption: q.correct_option,
            isPosted: q.is_posted,
        }));

        setQuestions(formattedQuestions);
    };

    const handleAddQuestion = async (newQuestion) => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            alert('User not logged in');
            return;
        }

        const { data, error } = await supabase
            .from('quiz_questions')
            .insert([
                {
                    organization_id: orgId,
                    question_text: newQuestion.text,
                    difficulty: newQuestion.difficulty,
                    options: newQuestion.options,
                    correct_option: newQuestion.correctOption,
                    created_by: user.id,
                },
            ])
            .select()
            .single();

        if (error) {
            console.error(error);
            alert(error.message);
            return;
        }

        const formattedQuestion = {
            id: data.id,
            text: data.question_text,
            difficulty: data.difficulty,
            options: data.options,
            correctOption: data.correct_option,
            isPosted: data.is_posted,
        };

        setQuestions([formattedQuestion, ...questions]);
    };

    const handleTogglePosted = async (index) => {
        const questionId = filteredQuestions[index].id;

        const qIndex = questions.findIndex((q) => q.id === questionId);

        const updatedStatus = !questions[qIndex].isPosted;

        const { error } = await supabase
            .from('quiz_questions')
            .update({
                is_posted: updatedStatus,
            })
            .eq('id', questionId);

        if (error) {
            console.error(error);
            return;
        }

        const updatedQuestions = [...questions];

        updatedQuestions[qIndex].isPosted = updatedStatus;

        setQuestions(updatedQuestions);
    };

    const handleRemoveQuestion = async (index) => {
        const question = questions[index];

        const { error } = await supabase
            .from('quiz_questions')
            .delete()
            .eq('id', question.id);

        if (error) {
            console.error(error);
            return;
        }

        setQuestions(questions.filter((_, i) => i !== index));
    };

    const filteredQuestions = questions
        .filter((q) => {
            const matchesSearch = q.text
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            const matchesDifficulty =
                filterDifficulty === 'all' ||
                q.difficulty === filterDifficulty;

            return matchesSearch && matchesDifficulty;
        })
        .sort((a, b) => {
            if (a.isPosted === b.isPosted) return 0;
            return a.isPosted ? 1 : -1;
        });

    return (
        <div className="quiz-bank-container">
            <style>{`
                .quiz-bank-container {
                    padding: 40px;
                    font-family: 'Inter', sans-serif;
                    max-width: 1100px;
                    margin: 0 auto;
                }

                .top-bar {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 40px;
                    align-items: center;
                }

                .search-wrapper {
                    flex: 1;
                    position: relative;
                }

                .search-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #999;
                }

                .search-input {
                    width: 100%;
                    padding: 14px 14px 14px 48px;
                    border-radius: 14px;
                    border: 1.5px solid #eee;
                    font-size: 15px;
                    outline: none;
                    transition: all 0.2s;
                    background: white;
                    box-sizing: border-box;
                }

                .search-input:focus {
                    border-color: #002B72;
                    box-shadow: 0 4px 12px rgba(0, 43, 114, 0.05);
                }

                .filter-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: white;
                    padding: 10px 16px;
                    border-radius: 14px;
                    border: 1.5px solid #eee;
                }

                .filter-select {
                    border: none;
                    font-weight: 600;
                    color: #444;
                    outline: none;
                    background: transparent;
                    cursor: pointer;
                    font-size: 14px;
                }

                .add-box {
                    background: #002B72;
                    color: white;
                    padding: 14px 24px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                    white-space: nowrap;
                }

                .add-box:hover {
                    background: #001f54;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0, 43, 114, 0.2);
                }

                .empty-list {
                    text-align: center;
                    padding: 80px 20px;
                    background: white;
                    border-radius: 24px;
                    border: 2px dashed #eee;
                    color: #888;
                }

                .submit-quiz-footer {
                    position: fixed;
                    bottom: 32px;
                    right: 40px;
                    z-index: 100;
                }

                .final-submit-btn {
                    background: #002B72;
                    color: white;
                    padding: 16px 32px;
                    border-radius: 16px;
                    font-weight: 800;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 10px 30px rgba(0, 43, 114, 0.3);
                    transition: all 0.3s;
                }

                .final-submit-btn:hover {
                    transform: scale(1.05);
                    background: #001f54;
                }
            `}</style>

            <div className="top-bar">
                <div className="search-wrapper">
                    <Search className="search-icon" size={20} />

                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-wrapper">
                    <Filter size={18} color="#666" />

                    <select
                        className="filter-select"
                        value={filterDifficulty}
                        onChange={(e) =>
                            setFilterDifficulty(e.target.value)
                        }
                    >
                        <option value="all">All Difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>

                <button
                    className="add-box"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={20} />
                    Add Question
                </button>
            </div>

            <div className="questions-list">
                {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((q, i) => (
                        <QuestionCard
                            key={q.id}
                            index={i}
                            question={q}
                            onRemove={() =>
                                handleRemoveQuestion(
                                    questions.findIndex(
                                        (orig) => orig.id === q.id
                                    )
                                )
                            }
                            onTogglePosted={handleTogglePosted}
                        />
                    ))
                ) : (
                    <div className="empty-list">
                        <BrainCircuit
                            size={48}
                            strokeWidth={1}
                            style={{ marginBottom: '16px' }}
                        />

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