import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabase';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            alert(error.message);
            return;
        }

        console.log('Logged in user:', data.user);

        // Redirect after login
        navigate('/organizations');
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-5 bg-light-bg text-slate-900 font-sans">
            <div className="w-full max-w-[440px] bg-light-card p-[50px] rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-slate-200 transition-transform duration-300 ease-in-out hover:-translate-y-[5px] hover:shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
                <div className="text-center mb-10">
                    <h1 className="text-slate-900 text-[32px] font-extrabold mt-0 mb-2.5 tracking-[-0.5px]">Welcome Back</h1>
                    <p className="text-slate-500 text-base m-0">Please enter your details to sign in</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Email Address</label>

                        <input
                            type="email"
                            id="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50 text-base transition-all duration-200 ease-in-out box-border text-slate-900 outline-none focus:border-brand focus:bg-slate-100 focus:shadow-[0_0_0_4px_rgba(0,43,114,0.2)]"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Password</label>

                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50 text-base transition-all duration-200 ease-in-out box-border text-slate-900 outline-none focus:border-brand focus:bg-slate-100 focus:shadow-[0_0_0_4px_rgba(0,43,114,0.2)]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand text-white py-[18px] rounded-2xl border-none text-lg font-bold cursor-pointer transition-all duration-300 ease-in-out mt-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:bg-brand-hover hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;