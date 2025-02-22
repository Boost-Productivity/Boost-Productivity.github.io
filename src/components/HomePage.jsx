import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, onSnapshot, addDoc, doc, getDocs, deleteDoc, updateDoc, limit, where } from 'firebase/firestore';
import { db } from '../firebase';
import { logEvent, EVENT } from '../services/eventLogger';

const createTransformFunction = (functionString) => {
    if (!functionString?.trim()) {
        return async input => input;
    }

    try {
        return new Function('input', `
            return (async () => {
                try {
                    const fn = ${functionString};
                    return await fn(input);
                } catch (error) {
                    console.error('Error in transform function:', error);
                    return input;
                }
            })();
        `);
    } catch (error) {
        console.error('Error creating transform function:', error);
        return async input => input;
    }
};

// Example lambda for LLM processing
const llmLambda = `input => {
    // WARNING: This runs in the browser, so API keys would be exposed
    // This is just an example structure - don't put actual API keys here
    const API_KEY = 'YOUR_API_KEY'; // DON'T DO THIS IN PRODUCTION!
    
    return fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + API_KEY
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'user', content: input }
            ]
        })
    })
    .then(res => res.json())
    .then(data => data.choices[0].message.content)
    .catch(err => {
        console.error('Error:', err);
        return input;
    });
}`;

function HomePage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [fields, setFields] = useState([]);
    const [selectedField, setSelectedField] = useState(null);
    const [outputs, setOutputs] = useState([]);
    const [newFieldName, setNewFieldName] = useState('');
    const [newOutput, setNewOutput] = useState('');
    const [showCreateField, setShowCreateField] = useState(false);
    const [fieldFilter, setFieldFilter] = useState('');
    const [anthropicKey, setAnthropicKey] = useState('');

    // Load fields
    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, `users/${currentUser.uid}/fields`),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fieldsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setFields(fieldsData);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Load outputs for selected field
    useEffect(() => {
        if (!currentUser || !selectedField) return;

        const q = query(
            collection(db, `users/${currentUser.uid}/fields/${selectedField.id}/values`),
            orderBy('datetime_iso_8601', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const outputsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOutputs(outputsData);
        });

        return () => unsubscribe();
    }, [currentUser, selectedField]);

    const handleCreateField = async (e) => {
        e.preventDefault();
        if (!newFieldName.trim() || !currentUser) return;

        try {
            const fieldsRef = collection(db, `users/${currentUser.uid}/fields`);

            // Check if identity function field exists
            const identityFieldQuery = query(
                fieldsRef,
                where('name', '==', 'identity')
            );
            const identityFieldDocs = await getDocs(identityFieldQuery);

            let identityFieldId = null;

            if (identityFieldDocs.empty) {
                // Create the identity function field
                const identityDoc = await addDoc(fieldsRef, {
                    name: 'identity',
                    createdAt: new Date()
                });
                identityFieldId = identityDoc.id;

                // Add the identity function value
                const valuesRef = collection(db, `users/${currentUser.uid}/fields/${identityFieldId}/values`);
                await addDoc(valuesRef, {
                    value: 'input => input',
                    datetime_iso_8601: new Date().toISOString()
                });
            } else {
                identityFieldId = identityFieldDocs.docs[0].id;
            }

            // Create the new field with a reference to the identity function
            await addDoc(fieldsRef, {
                name: newFieldName,
                createdAt: new Date(),
                functionFieldId: identityFieldId // Default to identity function
            });

            setNewFieldName('');
            setShowCreateField(false);
        } catch (error) {
            console.error('Error creating field:', error);
        }
    };

    const handleAddOutput = async (e) => {
        e.preventDefault();
        if (!newOutput.trim() || !selectedField || !currentUser) return;

        try {
            let transformedValue = newOutput.trim();

            if (selectedField.functionFieldId) {
                const functionFieldRef = doc(db, `users/${currentUser.uid}/fields/${selectedField.functionFieldId}`);
                const functionFieldValues = await getDocs(
                    query(
                        collection(functionFieldRef, 'values'),
                        orderBy('datetime_iso_8601', 'desc'),
                        limit(1)
                    )
                );

                if (!functionFieldValues.empty) {
                    const functionValue = functionFieldValues.docs[0].data().value;
                    const transformFn = createTransformFunction(functionValue);
                    transformedValue = await transformFn(transformedValue);
                }
            }

            const valuesRef = collection(db, `users/${currentUser.uid}/fields/${selectedField.id}/values`);
            await addDoc(valuesRef, {
                value: transformedValue,
                originalValue: newOutput.trim(),
                datetime_iso_8601: new Date().toISOString()
            });
            setNewOutput('');
        } catch (error) {
            console.error('Error adding output:', error);
        }
    };

    const handleDeleteOutput = async (outputId) => {
        if (!currentUser || !selectedField) return;

        try {
            const valueRef = doc(db, `users/${currentUser.uid}/fields/${selectedField.id}/values/${outputId}`);
            await deleteDoc(valueRef);
        } catch (error) {
            console.error('Error deleting output:', error);
        }
    };

    const handleFunctionFieldChange = async (fieldId, functionFieldId) => {
        if (!currentUser) return;
        try {
            const fieldRef = doc(db, `users/${currentUser.uid}/fields/${fieldId}`);
            await updateDoc(fieldRef, { functionFieldId });
        } catch (error) {
            console.error('Error updating field function:', error);
        }
    };

    const handleDeleteField = async (fieldId) => {
        if (!currentUser) return;

        try {
            // Check if field has any outputs
            const outputsRef = collection(db, `users/${currentUser.uid}/fields/${fieldId}/values`);
            const outputsSnapshot = await getDocs(outputsRef);

            if (!outputsSnapshot.empty) {
                console.error('Cannot delete field with outputs');
                return;
            }

            // Clear selected field if we're deleting it
            if (selectedField?.id === fieldId) {
                setSelectedField(null);
            }

            // Delete the field
            const fieldRef = doc(db, `users/${currentUser.uid}/fields/${fieldId}`);
            await deleteDoc(fieldRef);
        } catch (error) {
            console.error('Error deleting field:', error);
        }
    };

    const filteredFields = fields.filter(field =>
        field.name.toLowerCase().includes(fieldFilter.toLowerCase())
    );

    const handleFilterKeyDown = async (e) => {
        if (e.key === 'Enter' && fieldFilter.trim() && filteredFields.length === 0) {
            try {
                const fieldsRef = collection(db, `users/${currentUser.uid}/fields`);
                await addDoc(fieldsRef, {
                    name: fieldFilter.trim(),
                    createdAt: new Date()
                });
                setFieldFilter('');
            } catch (error) {
                console.error('Error creating field:', error);
            }
        }
    };

    const handleModalBackdropClick = (e, closeModal) => {
        if (e.target === e.currentTarget) {  // Only close if clicking the backdrop
            closeModal();
        }
    };

    return (
        <div className="min-h-screen bg-background text-text-primary p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">boost.</h1>
                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <input
                                type="password"
                                value={anthropicKey}
                                onChange={(e) => setAnthropicKey(e.target.value)}
                                placeholder="Anthropic API Key"
                                className="bg-surface border border-border rounded-lg px-4 py-2 w-64"
                            />
                        </div>
                        {currentUser ? (
                            <button
                                onClick={() => navigate('/account')}
                                className="nav-link px-4 py-2"
                            >
                                Account
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="nav-link px-4 py-2"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="bg-primary text-white px-4 py-2 rounded-lg"
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fields Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl">Method</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowCreateField(true)}
                                className="bg-primary text-white px-4 py-2 rounded-lg"
                            >
                                Create Method
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <input
                            type="text"
                            value={fieldFilter}
                            onChange={(e) => setFieldFilter(e.target.value)}
                            onKeyDown={handleFilterKeyDown}
                            placeholder="Search methods or press Enter to create new..."
                            className="w-full bg-surface border border-border rounded-lg px-4 py-2"
                        />
                        {fieldFilter.trim() && filteredFields.length === 0 && (
                            <div className="mt-2 text-text-secondary text-sm">
                                Press Enter to create method "{fieldFilter}"
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredFields.map(field => (
                            <div
                                key={field.id}
                                className={`p-4 rounded-lg cursor-pointer transition-colors relative group ${selectedField?.id === field.id
                                    ? 'bg-primary text-white'
                                    : 'bg-surface hover:bg-surface-secondary'
                                    }`}
                            >
                                <div onClick={() => setSelectedField(field)}>
                                    <p className="font-medium">{field.name}</p>
                                    {field.name !== 'identity' && ( // Don't show function selector for identity field
                                        <>
                                            <select
                                                value={field.functionFieldId || ''}
                                                onChange={(e) => handleFunctionFieldChange(field.id, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="mt-2 w-full bg-background border border-border rounded px-2 py-1 text-sm"
                                            >
                                                <option value="">Select a method</option>
                                                {fields.map(fnField => (
                                                    <option
                                                        key={fnField.id}
                                                        value={fnField.id}
                                                        disabled={field.id === fnField.id} // Prevent self-reference
                                                    >
                                                        {fnField.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteField(field.id);
                                                }}
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-text-secondary hover:text-error transition-opacity"
                                            >
                                                ×
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Outputs Section */}
                {selectedField && (
                    <div>
                        <h2 className="text-xl mb-4">{selectedField.name}</h2>
                        <form onSubmit={handleAddOutput} className="mb-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newOutput}
                                    onChange={(e) => setNewOutput(e.target.value)}
                                    placeholder="Enter new output..."
                                    className="flex-1 bg-surface border border-border rounded-lg px-4 py-2"
                                />
                                <button
                                    type="submit"
                                    className="bg-primary text-white px-4 py-2 rounded-lg"
                                >
                                    Add Output
                                </button>
                            </div>
                        </form>
                        <h3 className="text-lg mb-2">Outputs</h3>
                        <div className="space-y-2">
                            {outputs.map(output => (
                                <div key={output.id} className="bg-surface p-4 rounded-lg relative group">
                                    <button
                                        onClick={() => handleDeleteOutput(output.id)}
                                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-text-secondary hover:text-error transition-opacity w-6 h-6 flex items-center justify-center text-xl"
                                    >
                                        ×
                                    </button>
                                    <p className="text-lg pr-8">{output.value}</p>
                                    <p className="text-sm text-text-secondary">
                                        {new Date(output.datetime_iso_8601).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Create Field Modal */}
                {showCreateField && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center"
                        onClick={(e) => handleModalBackdropClick(e, () => setShowCreateField(false))}
                    >
                        <div className="bg-surface p-6 rounded-lg w-96">
                            <h2 className="text-xl mb-4">Create New Method</h2>
                            <form onSubmit={handleCreateField}>
                                <input
                                    type="text"
                                    value={newFieldName}
                                    onChange={(e) => setNewFieldName(e.target.value)}
                                    placeholder="Enter method name"
                                    className="w-full bg-surface border border-border rounded-lg px-4 py-2 mb-4"
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={(e) => handleModalBackdropClick(e, () => setShowCreateField(false))}
                                        className="px-4 py-2 bg-surface-secondary rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary text-white rounded-lg"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HomePage; 