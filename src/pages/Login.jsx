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
        <div className="login-page">
            <style>{`
                .login-page {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    padding: 20px;
                    font-family: 'Inter', sans-serif;
                    background: #f7f9fc;
                }

                .login-card {
                    width: 100%;
                    max-width: 440px;
                    background: white;
                    padding: 50px;
                    border-radius: 32px;
                    box-shadow: 0 20px 50px rgba(0, 43, 114, 0.1);
                    border: 1px solid rgba(0, 43, 114, 0.05);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .login-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 30px 60px rgba(0, 43, 114, 0.15);
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 40px;
                }

                .login-header h1 {
                    color: #002B72;
                    font-size: 32px;
                    font-weight: 800;
                    margin: 0 0 10px;
                    letter-spacing: -0.5px;
                }

                .login-header p {
                    color: #666;
                    font-size: 16px;
                    margin: 0;
                }

                .form-group {
                    margin-bottom: 24px;
                }

                .form-group label {
                    display: block;
                    font-size: 14px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 8px;
                    margin-left: 4px;
                }

                .form-group input {
                    width: 100%;
                    padding: 16px 20px;
                    border-radius: 16px;
                    border: 2px solid #eee;
                    background: #fcfcfc;
                    font-size: 16px;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #002B72;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(0, 43, 114, 0.1);
                }

                .submit-btn {
                    width: 100%;
                    background: #002B72;
                    color: white;
                    padding: 18px;
                    border-radius: 16px;
                    border: none;
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-top: 10px;
                    box-shadow: 0 10px 20px rgba(0, 43, 114, 0.2);
                }

                .submit-btn:hover {
                    background: #001f54;
                    transform: translateY(-2px);
                    box-shadow: 0 15px 25px rgba(0, 43, 114, 0.3);
                }

                .submit-btn:active {
                    transform: translateY(0);
                }

                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
            `}</style>

            <div className="login-card">
                <div className="login-header">
                    <h1>Welcome Back</h1>
                    <p>Please enter your details to sign in</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>

                        <input
                            type="email"
                            id="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>

                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;