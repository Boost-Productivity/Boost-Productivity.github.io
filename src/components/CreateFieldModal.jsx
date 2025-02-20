import React, { useState } from 'react';

const CreateFieldModal = ({ onSubmit, onClose }) => {
    const [fieldName, setFieldName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(fieldName);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-surface p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl mb-4">Create New Field</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={fieldName}
                        onChange={(e) => setFieldName(e.target.value)}
                        placeholder="Enter field name"
                        className="field-input mb-4"
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm rounded-md hover:bg-surface"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="create-field-button"
                            disabled={!fieldName.trim()}
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateFieldModal; 