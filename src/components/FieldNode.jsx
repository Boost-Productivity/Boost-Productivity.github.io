import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { createPortal } from 'react-dom';

const FullscreenEditor = ({ value, onChange, onSubmit, onClose, nodeName }) => {
    return createPortal(
        <div className="absolute inset-0 w-screen h-screen bg-background p-8" style={{ zIndex: 1000 }}>
            <div className="max-w-4xl mx-auto h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{nodeName}</h2>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-surface text-text-primary border border-border rounded-md hover:bg-border transition-colors"
                    >
                        Exit Fullscreen
                    </button>
                </div>
                <form onSubmit={onSubmit} className="flex-1 flex flex-col">
                    <textarea
                        value={value}
                        onChange={onChange}
                        className="flex-1 bg-surface border border-border rounded-lg p-4 text-text-primary focus:outline-none focus:border-primary resize-none text-lg mb-4"
                        placeholder={`Type your ${nodeName.toLowerCase()} here...`}
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors self-end"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
};

const FieldNode = ({ data }) => {
    const [inputValue, setInputValue] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
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
        data.onSubmit(inputValue, data.id);
        setInputValue('');
        setIsFullscreen(false);
    };

    const truncateText = (text, maxLength = 100) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    };

    return (
        <div className="field-node relative bg-surface border border-border rounded-lg w-[400px]">
            {data.onDeleteType && (
                <button
                    onClick={() => data.onDeleteType(data.name)}
                    className="absolute top-3 left-4 text-text-secondary hover:text-error cursor-pointer opacity-60 hover:opacity-100"
                    title="Delete this node type"
                >
                    ×
                </button>
            )}
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
                    <div className={`text-center py-2 ${!isExpanded ? 'h-[100px]' : ''}`}>
                        <div className={`text-success ${!isExpanded ? 'h-[60px] overflow-hidden' : ''}`}>
                            {isExpanded ? (
                                <div className="whitespace-pre-wrap break-words">{data.message}</div>
                            ) : (
                                <div className="line-clamp-2">{data.message}</div>
                            )}
                        </div>
                        {data.message.length > 100 && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-xs text-text-secondary hover:text-text-primary mt-1"
                            >
                                {isExpanded ? 'Show less' : 'Show more'}
                            </button>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="field-form">
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary"
                                placeholder={`Type your ${data.name.toLowerCase()} here...`}
                            />
                            <button
                                type="button"
                                onClick={() => setIsFullscreen(true)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-text-secondary hover:text-text-primary"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                                </svg>
                            </button>
                        </div>
                        <button
                            type="submit"
                            className="mt-2 w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 rounded-lg transition-colors"
                        >
                            Submit
                        </button>
                    </form>
                )}
            </div>

            {isFullscreen && (
                <FullscreenEditor
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onSubmit={handleSubmit}
                    onClose={() => setIsFullscreen(false)}
                    nodeName={data.name}
                />
            )}
        </div>
    );
};

export default FieldNode; 