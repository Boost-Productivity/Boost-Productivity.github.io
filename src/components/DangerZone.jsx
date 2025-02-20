import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { logEvent, EVENT } from '../services/eventLogger';

export default function DangerZone() {
    const navigate = useNavigate();
    const { deleteAccount, logout, currentUser } = useAuth();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showReauth, setShowReauth] = useState(false);

    // Log page view
    useEffect(() => {
        logEvent(EVENT.ACCOUNT.DANGER_ZONE_VIEW, currentUser?.uid);
    }, [currentUser]);

    const handleLogout = async () => {
        logEvent(EVENT.ACCOUNT.LOGOUT_CLICK, currentUser?.uid);
        try {
            await logout();
            logEvent(EVENT.ACCOUNT.LOGOUT_SUCCESS, currentUser?.uid);
            navigate('/');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const handleReauthenticate = async () => {
        logEvent(EVENT.ACCOUNT.DELETE_ACCOUNT_CONFIRM, currentUser?.uid);
        try {
            const credential = EmailAuthProvider.credential(
                currentUser.email,
                password
            );
            await reauthenticateWithCredential(currentUser, credential);
            await deleteAccount();
            logEvent(EVENT.ACCOUNT.DELETE_ACCOUNT_SUCCESS, currentUser?.uid);
            navigate('/');
        } catch (error) {
            setError('Invalid password. Please try again.');
            console.error('Reauthentication error:', error);
        }
    };

    const handleDeleteAccount = async () => {
        logEvent(EVENT.ACCOUNT.DELETE_ACCOUNT_CLICK, currentUser?.uid);
        if (window.confirm('This action cannot be undone. Are you absolutely sure?')) {
            setShowReauth(true);
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-md mx-auto">
                <h2 className="text-xl text-text-secondary mb-8">Advanced Settings</h2>

                <div className="space-y-8">
                    <div className="border border-error/10 rounded-lg p-6 bg-error/5">
                        <h3 className="text-error mb-4">Danger Zone</h3>
                        <p className="text-sm text-text-secondary mb-6">
                            These actions are irreversible and can result in permanent data loss.
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={handleLogout}
                                className="w-full py-2 px-4 bg-error/10 text-error hover:bg-error/20 rounded-md transition-colors"
                            >
                                Log Out
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="w-full py-2 px-4 bg-error/10 text-error hover:bg-error/20 rounded-md transition-colors"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>

                {showReauth && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-surface p-6 rounded-lg border border-border max-w-md w-full mx-4">
                            <h3 className="text-xl font-semibold text-error mb-4">Confirm Account Deletion</h3>
                            <p className="text-text-primary mb-4">
                                Please enter your password to confirm account deletion.
                            </p>
                            {error && (
                                <p className="text-error text-sm mb-4">{error}</p>
                            )}
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full p-2 bg-background border border-border rounded-md focus:border-error focus:outline-none mb-4"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowReauth(false);
                                        setPassword('');
                                        setError('');
                                    }}
                                    className="flex-1 py-2 px-4 bg-surface text-text-primary border border-border rounded-md hover:bg-border transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReauthenticate}
                                    className="flex-1 py-2 px-4 bg-error text-white rounded-md hover:opacity-90 transition-opacity"
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => navigate('/account')}
                    className="mt-8 text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                    ← Back to Account
                </button>
            </div>
        </div>
    );
} 