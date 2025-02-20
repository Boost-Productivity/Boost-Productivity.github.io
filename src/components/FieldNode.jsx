import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';

const FieldNode = ({ data }) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    const focusInput = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Add this to data so parent can call it
    useEffect(() => {
        if (data.registerFocus) {
            data.registerFocus(focusInput);
        }
    }, [data.registerFocus]);

    useEffect(() => {
        setInputValue('');
    }, [data.key]);

    useEffect(() => {
        // Focus if this is the new empty node
        if (data.focusOnMount && inputRef.current) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                inputRef.current.focus();
            }, 0);
        }
    }, [data.focusOnMount]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        console.log('FieldNode submitting with:', {
            goalText: inputValue,
            nodeId: data.id,
            fullData: data
        });

        data.onSubmit(inputValue, data.id);
    };

    return (
        <div className="field-node relative bg-surface border border-border rounded-lg">
            {data.isSubmitted && (
                <span
                    onClick={() => data.onDelete(data.id)}
                    className="absolute top-3 left-4 text-text-secondary hover:text-error cursor-pointer opacity-60 hover:opacity-100"
                >
                    ×
                </span>
            )}
            <div className="field-content">
                <div className="field-name">{data.name}</div>
                {data.isSubmitted ? (
                    <div className="text-center text-success animate-fade-in py-2">
                        {data.message}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="field-form">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value.slice(0, 160))}
                            maxLength={160}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary"
                            placeholder="Type your goal here..."
                        />
                        <button
                            type="submit"
                            className="mt-2 w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 rounded-lg transition-colors"
                        >
                            Submit
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FieldNode; 