import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Lock, Globe, Plus, Trash2, CheckSquare, Square, AlignLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../supabase/supabase';

const AddEventModal = ({ isOpen, onClose, orgId, userId, onEventAdded, editEvent = null }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [todos, setTodos] = useState([]);
    const [todoInput, setTodoInput] = useState('');
    const [color, setColor] = useState('#0ea5e9');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const PRESET_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];

    const isCreator = editEvent ? editEvent.created_by === userId : true;

    useEffect(() => {
        if (isOpen) {
            if (editEvent) {
                setTitle(editEvent.title || '');
                setDescription(editEvent.description || '');
                setEventDate(editEvent.event_date || '');
                setIsPublic(editEvent.is_public || false);
                setTodos(editEvent.todos || []);
                setColor(editEvent.color || '#0ea5e9');
            } else {
                setTitle('');
                setDescription('');
                setEventDate('');
                setIsPublic(false);
                setTodos([]);
                setColor('#0ea5e9');
            }
            setTodoInput('');
            setError('');
        }
    }, [isOpen, editEvent]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleAddTodo = (e) => {
        e.preventDefault();
        if (!todoInput.trim() || !isCreator) return;
        setTodos([...todos, { id: crypto.randomUUID(), text: todoInput.trim(), completed: false }]);
        setTodoInput('');
    };

    const toggleTodo = (id) => {
        if (!isCreator) return;
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTodo = (id) => {
        if (!isCreator) return;
        setTodos(todos.filter(t => t.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isCreator) return;
        setError('');

        if (!title.trim() || !eventDate) {
            setError('Title and date are required.');
            return;
        }

        setLoading(true);
        try {
            const eventData = {
                organization_id: orgId,
                created_by: userId,
                title: title.trim(),
                description: description.trim(),
                event_date: eventDate,
                is_public: isPublic,
                todos: todos,
                color: color
            };

            if (editEvent) {
                const { error: updateError } = await supabase
                    .from('calendar_events')
                    .update(eventData)
                    .eq('id', editEvent.id);
                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('calendar_events')
                    .insert([eventData]);
                if (insertError) throw insertError;
            }

            onEventAdded();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to save event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center animate-[fadeIn_0.2s_ease-out]"
            onClick={onClose}
        >
            <div 
                className="bg-white w-[860px] max-w-[95vw] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] animate-[slideUp_0.3s_ease-out] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
                    <h2 className="text-lg font-black text-slate-900 m-0">
                        {!isCreator ? 'View Event' : editEvent ? 'Edit Event' : 'Add New Event'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors border-none cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-70px)]">
                    <div className="p-5 flex flex-col md:flex-row gap-6 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                        {/* Left Column: Core Event Info */}
                        <div className="flex-1 flex flex-col gap-5">
                            {error && (
                                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold border border-red-100">
                                    {error}
                                </div>
                            )}
                            {!isCreator && (
                                <div className="bg-slate-100 text-slate-600 px-4 py-3 rounded-xl text-sm font-semibold border border-slate-200 flex items-center gap-2">
                                    <Lock size={16} /> You are viewing an event created by someone else. You cannot edit it.
                                </div>
                            )}

                            <div className="flex gap-4">
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <label className="text-xs font-bold text-slate-700">Event Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Team Meeting, Campaign Launch..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        disabled={!isCreator}
                                        className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand focus:bg-brand/5 bg-slate-50 outline-none text-slate-900 text-sm font-medium transition-all duration-200 disabled:opacity-60 disabled:bg-slate-100"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5 w-48">
                                    <label className="text-xs font-bold text-slate-700">Date</label>
                                    <div className="relative">
                                        <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="date"
                                            value={eventDate}
                                            onChange={(e) => setEventDate(e.target.value)}
                                            disabled={!isCreator}
                                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand focus:bg-brand/5 bg-slate-50 outline-none text-slate-900 text-sm font-medium transition-all duration-200 disabled:opacity-60 disabled:bg-slate-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700">Event Color</label>
                                <div className="flex items-center gap-2">
                                    {PRESET_COLORS.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => isCreator && setColor(c)}
                                            className={`w-7 h-7 rounded-full transition-all duration-200 ${color === c ? 'scale-125 shadow-[0_4px_12px_rgba(0,0,0,0.2)] ring-2 ring-offset-2 ring-slate-800' : 'hover:scale-110 opacity-80 hover:opacity-100'} ${!isCreator ? 'cursor-default' : 'cursor-pointer'}`}
                                            style={{ backgroundColor: c }}
                                            disabled={!isCreator}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 flex-1">
                                <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                    <AlignLeft size={14} className="text-slate-400" /> Description
                                </label>
                                <textarea
                                    placeholder="Add notes, agenda, or details here..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={!isCreator}
                                    className="w-full px-3 py-2.5 min-h-[100px] h-full rounded-xl border-2 border-slate-200 focus:border-brand focus:bg-brand/5 bg-slate-50 outline-none text-slate-900 text-sm font-medium transition-all duration-200 resize-none disabled:opacity-60 disabled:bg-slate-100"
                                />
                            </div>
                        </div>

                        {/* Right Column: To-Do List & Visibility */}
                        <div className="w-full md:w-[280px] shrink-0 flex flex-col gap-5 md:border-l md:border-slate-100 md:pl-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-slate-400" /> To-Do List
                                </label>

                                <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-1 [scrollbar-width:thin]">
                                    {todos.map(todo => (
                                        <div key={todo.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${todo.completed ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                            <button
                                                type="button"
                                                onClick={() => toggleTodo(todo.id)}
                                                disabled={!isCreator}
                                                className={`flex shrink-0 items-center justify-center border-none bg-transparent cursor-pointer p-0 disabled:cursor-default ${todo.completed ? 'text-brand' : 'text-slate-300 hover:text-slate-400'}`}
                                            >
                                                {todo.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                                            </button>
                                            <span className={`flex-1 font-medium text-[15px] ${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                                {todo.text}
                                            </span>
                                            {isCreator && (
                                                <button
                                                    type="button"
                                                    onClick={() => deleteTodo(todo.id)}
                                                    className="shrink-0 bg-transparent border-none p-1.5 rounded-lg cursor-pointer text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {isCreator && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <input
                                            type="text"
                                            placeholder="Add a new task..."
                                            value={todoInput}
                                            onChange={(e) => setTodoInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddTodo(e);
                                                }
                                            }}
                                            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:border-brand bg-slate-50 outline-none text-slate-900 text-[13px] font-medium transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddTodo}
                                            disabled={!todoInput.trim()}
                                            className="px-3 py-2 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors border-none cursor-pointer disabled:opacity-50 flex items-center gap-1.5 text-[13px]"
                                        >
                                            <Plus size={14} /> Add
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5 mt-auto pt-4">
                                <label className="text-xs font-bold text-slate-700">Visibility</label>
                                <div className="flex gap-2">
                                    <div
                                        className={`flex-1 flex flex-col gap-1 p-3 rounded-xl border-2 transition-all duration-200 ${!isPublic ? 'border-brand bg-brand/5' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'} ${!isCreator ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
                                        onClick={() => isCreator && setIsPublic(false)}
                                    >
                                        <div className={`flex items-center gap-2 font-bold text-sm ${!isPublic ? 'text-brand' : 'text-slate-600'}`}>
                                            <Lock size={14} /> Private
                                        </div>
                                        <span className="text-[10px] font-semibold text-slate-500 leading-tight">Only you can see this event.</span>
                                    </div>

                                    <div
                                        className={`flex-1 flex flex-col gap-1 p-3 rounded-xl border-2 transition-all duration-200 ${isPublic ? 'border-brand bg-brand/5' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'} ${!isCreator ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
                                        onClick={() => isCreator && setIsPublic(true)}
                                    >
                                        <div className={`flex items-center gap-2 font-bold text-sm ${isPublic ? 'text-brand' : 'text-slate-600'}`}>
                                            <Globe size={14} /> Public
                                        </div>
                                        <span className="text-[10px] font-semibold text-slate-500 leading-tight">Everyone can see this.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
                        <div className="text-[11px] font-bold text-slate-400">
                            {editEvent && editEvent.profiles ? `Created by ${editEvent.profiles.full_name || editEvent.profiles.email}` : ''}
                        </div>
                        <div className="flex justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2 rounded-xl font-bold text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
                            >
                                {isCreator ? 'Cancel' : 'Close'}
                            </button>
                            {isCreator && (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-2 rounded-xl font-bold text-white bg-brand hover:bg-brand-hover hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(0,43,114,0.3)] transition-all duration-200 border-none cursor-pointer disabled:opacity-50 disabled:hover:translate-y-0 text-sm"
                                >
                                    {loading ? 'Saving...' : editEvent ? 'Save Changes' : 'Add Event'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEventModal;
