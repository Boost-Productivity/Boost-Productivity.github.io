import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function GoogleButton() {
    const { signInWithGoogle } = useAuth();

    return (
        <button
            onClick={signInWithGoogle}
            className="w-full h-10 relative bg-white hover:shadow-md border border-[#747775] rounded-md px-3 transition-shadow duration-200 flex items-center justify-between group"
        >
            <div className="absolute inset-0 bg-[#303030] opacity-0 group-hover:opacity-[0.08] group-active:opacity-[0.12] transition-opacity duration-200 rounded-md" />
            <div className="flex items-center justify-center w-full gap-3">
                <div className="w-5 h-5 flex-shrink-0">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: '100%', height: '100%' }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                </div>
                <span className="font-['Roboto'] text-sm font-medium tracking-[0.25px] text-[#1f1f1f]">
                    Continue with Google
                </span>
            </div>
        </button>
    );
} 