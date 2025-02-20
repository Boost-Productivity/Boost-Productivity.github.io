import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateEmail as updateEmailFirebase,
    updatePassword as updatePasswordFirebase,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    deleteUser,
    sendEmailVerification as sendEmailVerificationFirebase
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signup = async (email, password) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerificationFirebase(userCredential.user);
        return userCredential;
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const updateEmail = (newEmail) => {
        return updateEmailFirebase(currentUser, newEmail);
    };

    const updatePassword = (newPassword) => {
        return updatePasswordFirebase(currentUser, newPassword);
    };

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    const updateDisplayName = (newDisplayName) => {
        return updateProfile(currentUser, {
            displayName: newDisplayName
        });
    };

    const deleteAccount = () => {
        return deleteUser(currentUser);
    };

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const sendEmailVerification = () => {
        return sendEmailVerificationFirebase(currentUser);
    };

    const value = {
        currentUser,
        signup,
        login,
        logout,
        updateEmail,
        updatePassword,
        resetPassword,
        signInWithGoogle,
        updateDisplayName,
        deleteAccount,
        sendEmailVerification
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}