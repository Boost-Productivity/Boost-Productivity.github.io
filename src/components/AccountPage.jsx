import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { logEvent, EVENT } from '../services/eventLogger';

export default function AccountPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const { currentUser, updateEmail, updatePassword, resetPassword, updateDisplayName, deleteAccount, logout, sendEmailVerification } = useAuth();
    const navigate = useNavigate();

    const handleEmailUpdate = async (e) => {
        e.preventDefault();
        logEvent(EVENT.ACCOUNT.EMAIL_UPDATE_CLICK, currentUser?.uid);
        if (email === currentUser?.email) {
            setError('New email must be different from current email');
            return;
        }
        try {
            setMessage('');
            setError('');
            await updateEmail(email);
            logEvent(EVENT.ACCOUNT.EMAIL_UPDATE_SUCCESS, currentUser?.uid);
            setMessage('Email updated successfully');
            setEmail('');
        } catch (err) {
            handleError(err, 'email update');
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        logEvent(EVENT.ACCOUNT.PASSWORD_UPDATE_CLICK, currentUser?.uid);
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }
        try {
            setMessage('');
            setError('');
            await updatePassword(newPassword);
            logEvent(EVENT.ACCOUNT.PASSWORD_UPDATE_SUCCESS, currentUser?.uid);
            setMessage('Password updated successfully');
            setNewPassword('');
        } catch (err) {
            handleError(err, 'password update');
        }
    };

    const handleDisplayNameUpdate = async (e) => {
        e.preventDefault();
        logEvent(EVENT.ACCOUNT.NAME_UPDATE_CLICK, currentUser?.uid);
        if (!displayName.trim()) {
            setError('Display name cannot be empty');
            return;
        }
        try {
            setMessage('');
            setError('');
            await updateDisplayName(displayName);
            logEvent(EVENT.ACCOUNT.NAME_UPDATE_SUCCESS, currentUser?.uid);
            setMessage('Display name updated successfully');
            setDisplayName('');
        } catch (err) {
            handleError(err, 'display name update');
        }
    };

    const handlePasswordReset = async () => {
        logEvent(EVENT.ACCOUNT.RESET_EMAIL_CLICK, currentUser?.uid);
        try {
            setMessage('');
            setError('');
            await resetPassword(currentUser.email);
            logEvent(EVENT.ACCOUNT.RESET_EMAIL_SUCCESS, currentUser?.uid);
            setMessage('Password reset email sent. Please check your inbox.');
        } catch (err) {
            handleError(err, 'password reset');
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE') {
            setError('Please type DELETE to confirm account deletion');
            return;
        }
        try {
            setMessage('');
            setError('');
            await deleteAccount();
            setShowDeleteModal(false);
            navigate('/');
        } catch (err) {
            handleError(err, 'account deletion');
        }
    };

    const handleSendVerification = async () => {
        try {
            setMessage('');
            setError('');
            await sendEmailVerification();
            setMessage('Verification email sent. Please check your inbox.');
        } catch (err) {
            setError('Failed to send verification email');
            console.error('Verification error:', err);
        }
    };

    const handleError = (err, action) => {
        switch (err.code) {
            case 'auth/requires-recent-login':
                setError(`Please log out and log back in to change your ${action}`);
                break;
            case 'auth/invalid-email':
                setError('Invalid email format');
                break;
            case 'auth/email-already-in-use':
                setError('This email is already registered to another account');
                break;
            case 'auth/weak-password':
                setError('Password is too weak. Please choose a stronger password');
                break;
            default:
                setError(`Failed to update ${action}`);
                console.error(`${action} error:`, err);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (err) {
            console.error('Logout error:', err);
            setError('Failed to log out');
        }
    };

    const DeleteConfirmationModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface p-6 rounded-lg border border-border max-w-md w-full mx-4">
                <h3 className="text-xl font-semibold text-error mb-4">Delete Account</h3>
                <p className="text-text-primary mb-4">
                    This action cannot be undone. All your data will be permanently deleted.
                </p>
                <p className="text-text-secondary mb-6">
                    Please type <span className="font-mono text-error">DELETE</span> to confirm.
                </p>
                <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="w-full p-2 bg-background border border-border rounded-md focus:border-error focus:outline-none mb-4"
                />
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setShowDeleteModal(false);
                            setDeleteConfirmation('');
                            setError('');
                        }}
                        className="flex-1 py-2 px-4 bg-surface text-text-primary border border-border rounded-md hover:bg-border transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDeleteAccount}
                        className="flex-1 py-2 px-4 bg-error text-white rounded-md hover:opacity-90 transition-opacity"
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-text-primary p-8">
            <div className="max-w-2xl mx-auto">
                <Link
                    to="/"
                    className="inline-flex items-center text-text-primary hover:text-text-secondary mb-6"
                >
                    <IoArrowBack className="mr-2" />
                    Back
                </Link>
                <h2 className="text-2xl font-bold mb-8">Account Settings</h2>

                <div className="bg-surface rounded-lg border border-border p-6">
                    <div className="p-4 bg-background rounded-lg border border-border mb-6">
                        <h3 className="text-text-secondary text-sm mb-2">Current Email</h3>
                        <div className="flex items-center justify-between">
                            <p>{currentUser?.email}</p>
                            {currentUser?.emailVerified ? (
                                <span className="text-sm text-success">Verified</span>
                            ) : (
                                <button
                                    onClick={handleSendVerification}
                                    className="text-sm text-primary hover:text-primary/80 underline"
                                >
                                    Verify Email
                                </button>
                            )}
                        </div>
                        <h3 className="text-text-secondary text-sm mb-2 mt-4">Display Name</h3>
                        <p>{currentUser?.displayName || 'Not Set'}</p>
                    </div>

                    {message && (
                        <div className="p-3 bg-success/10 border border-success rounded-md text-success text-center text-sm mb-4">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-error/10 border border-error rounded-md text-error text-center text-sm mb-4">
                            {error}
                        </div>
                    )}

                    {!currentUser?.emailVerified && (
                        <div className="p-3 bg-primary/10 border border-primary/20 rounded-md text-text-primary text-center text-sm mb-4">
                            Please verify your email address to ensure account security.
                        </div>
                    )}

                    <form onSubmit={handleEmailUpdate} className="mb-6 space-y-4">
                        <h3 className="text-text-secondary text-sm">Update Email</h3>
                        <input
                            type="email"
                            placeholder="New Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 bg-background border border-border rounded-md focus:border-primary focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-surface text-text-primary border border-border rounded-md hover:bg-border transition-colors"
                        >
                            Update Email
                        </button>
                    </form>

                    <form onSubmit={handlePasswordUpdate} className="mb-6 space-y-4">
                        <h3 className="text-text-secondary text-sm">Update Password</h3>
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-2 bg-background border border-border rounded-md focus:border-primary focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-surface text-text-primary border border-border rounded-md hover:bg-border transition-colors"
                        >
                            Update Password
                        </button>
                    </form>

                    <form onSubmit={handleDisplayNameUpdate} className="mb-6 space-y-4">
                        <h3 className="text-text-secondary text-sm">Update Display Name</h3>
                        <input
                            type="text"
                            placeholder="New Display Name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full p-2 bg-background border border-border rounded-md focus:border-primary focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-surface text-text-primary border border-border rounded-md hover:bg-border transition-colors"
                        >
                            Update Display Name
                        </button>
                    </form>

                    <div className="space-y-4">
                        <button
                            onClick={handlePasswordReset}
                            className="w-full py-2 px-4 bg-surface text-text-primary border border-border rounded-md hover:bg-border transition-colors"
                        >
                            Send Password Reset Email
                        </button>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Link
                        to="/settings/advanced"
                        className="text-xs text-text-secondary opacity-50 hover:opacity-100 transition-opacity"
                    >
                        Advanced Settings
                    </Link>
                </div>
            </div>
            {showDeleteModal && <DeleteConfirmationModal />}
        </div>
    );
} 