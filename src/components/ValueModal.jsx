import React, { useState } from 'react';

export default function ValueModal({ node, onClose, onSubmit }) {
    const [value, setValue] = useState('');
    const [datetime, setDatetime] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(value, datetime ? new Date(datetime) : null);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-surface p-6 rounded-lg border border-border max-w-md w-full mx-4">
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                    Set Value for {node.data.name || 'Untitled Field'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">
                            Value
                        </label>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-full p-2 bg-background border border-border rounded-md"
                            placeholder="Enter value"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-1">
                            DateTime (optional)
                        </label>
                        <input
                            type="datetime-local"
                            value={datetime}
                            onChange={(e) => setDatetime(e.target.value)}
                            className="w-full p-2 bg-background border border-border rounded-md"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 px-4 bg-surface text-text-primary border border-border rounded-md hover:bg-border transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2 px-4 bg-primary text-white rounded-md hover:opacity-90 transition-opacity"
                        >
                            Set Value
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 