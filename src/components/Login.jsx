import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import GoogleButton from './GoogleButton';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';

export default function Login({ onClose, onSwitchToSignup }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login, resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            setIsLoading(true);
            await login(email, password);
        } catch (err) {
            switch (err.code) {
                case 'auth/invalid-email':
                    setError('Invalid email address format');
                    break;
                case 'auth/user-disabled':
                    setError('This account has been disabled');
                    break;
                case 'auth/user-not-found':
                    setError('No account found with this email');
                    break;
                case 'auth/wrong-password':
                    setError('Incorrect password');
                    break;
                case 'auth/too-many-requests':
                    setError('Too many failed attempts. Please try again later');
                    break;
                default:
                    setError('Failed to log in. Please check your credentials');
                    console.error('Login error:', err);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        try {
            await resetPassword(email);
            setError('Password reset email sent. Check your inbox.');
        } catch (err) {
            setError('Failed to send password reset email');
            console.error('Reset password error:', err);
        }
    };

    const handleGoogleError = (error) => {
        setError('Failed to sign in with Google. Please try again.');
        console.error('Google sign in error:', error);
    };

    return (
        <div className="bg-surface p-8 rounded-lg border border-border w-[480px] max-w-[90vw]">
            <h2 className="text-2xl font-bold mb-6 text-center">Log In</h2>

            {error && (
                <div className="error mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary"
                    />
                </div>

                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    >
                        {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Logging in...
                        </>
                    ) : (
                        'Log In'
                    )}
                </button>
            </form>

            <div className="flex items-center my-6">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink-0 mx-4 text-sm text-text-secondary">or</span>
                <div className="flex-grow border-t border-border"></div>
            </div>

            <GoogleButton />

            <div className="mt-6 text-center text-sm text-text-secondary">
                Don't have an account?{' '}
                <button
                    onClick={onSwitchToSignup}
                    className="text-primary hover:text-primary/80 font-medium underline"
                >
                    Sign Up
                </button>
            </div>
        </div>
    );
} 