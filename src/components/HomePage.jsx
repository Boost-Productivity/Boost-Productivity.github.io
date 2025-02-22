import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, onSnapshot, addDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { logEvent, EVENT } from '../services/eventLogger';

function HomePage() {
    const { nodeType } = useParams();
    // Convert URL parameter back to proper type name
    const initialType = nodeType ?
        nodeType.slice(0, -1) // Remove 's' from end
            .split('_') // Split by underscore
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
            .join(' ') // Join with spaces
        : 'Goal';

    const [selectedType, setSelectedType] = useState(initialType);
    const [goals, setGoals] = useState([]);
    const [newGoal, setNewGoal] = useState('');
    const [nodeTypes, setNodeTypes] = useState(['Goal']); // Will be populated from Firebase
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (nodeType) {
            const type = nodeType.slice(0, -1) // Remove 's' from end
                .split('_') // Split by underscore
                .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
                .join(' '); // Join with spaces
            setSelectedType(type);
        }
    }, [nodeType]);

    useEffect(() => {
        if (!currentUser) {
            return;
        }

        // Listen for node types
        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubscribeTypes = onSnapshot(userDocRef, (userDoc) => {
            if (!userDoc.exists()) return;
            const types = ['Goal', ...Object.keys(userDoc.data()?.nodeTypes || {}).map(type =>
                type.slice(0, -1) // Remove the 's' from the stored type
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')
            )];
            setNodeTypes(types);
        });

        // Use the correct collection based on nodeType
        const collectionName = nodeType || 'goals'; // default to 'goals' if no nodeType in URL
        const q = query(
            collection(db, `users/${currentUser.uid}/${collectionName}`),
            orderBy('createdAt', 'desc')
        );

        const unsubscribeGoals = onSnapshot(q, (snapshot) => {
            const goalsData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data.data,
                    createdAt: data.createdAt
                };
            });
            setGoals(goalsData);
        });

        return () => {
            unsubscribeTypes();
            unsubscribeGoals();
        };
    }, [currentUser, nodeType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newGoal.trim()) return;

        try {
            const collectionName = nodeType || 'goals'; // default to 'goals' if no nodeType in URL
            const collectionRef = collection(db, `users/${currentUser.uid}/${collectionName}`);
            await addDoc(collectionRef, {
                type: 'field',
                data: {
                    message: newGoal,
                    name: selectedType,
                    isSubmitted: true
                },
                createdAt: new Date()
            });

            logEvent(EVENT.NODE.SUBMIT, currentUser?.uid);
            setNewGoal('');
        } catch (error) {
            console.error('Error saving goal:', error);
        }
    };

    const navigateToNodeType = (type) => {
        const collectionName = type.toLowerCase().replace(/\s+/g, '_') + 's';
        navigate(`/${collectionName}`);
    };

    return (
        <div className="min-h-screen bg-background text-text-primary p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">boost.</h1>
                    <div className="flex gap-4">
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

                {/* Node Type Selection */}
                <div className="flex gap-4 mb-8">
                    {nodeTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => navigateToNodeType(type)}
                            className={`px-4 py-2 rounded-lg border ${selectedType === type
                                ? 'bg-primary text-white'
                                : 'bg-surface border-border text-text-primary'
                                }`}
                        >
                            {type}s
                        </button>
                    ))}
                </div>

                {/* New Goal Form */}
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={newGoal}
                            onChange={(e) => setNewGoal(e.target.value)}
                            placeholder="Enter a new goal..."
                            className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary"
                        />
                        <button
                            type="submit"
                            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors"
                        >
                            Add Goal
                        </button>
                    </div>
                </form>

                {/* Goals List */}
                <div className="space-y-4">
                    {goals.map(goal => (
                        <div
                            key={goal.id}
                            className="bg-surface border border-border rounded-lg p-4"
                        >
                            <p className="text-lg">{goal.message}</p>
                            <p className="text-sm text-text-secondary mt-2">
                                {goal.createdAt?.toDate ?
                                    new Date(goal.createdAt.toDate()).toLocaleString() :
                                    new Date(goal.createdAt).toLocaleString()
                                }
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HomePage; 