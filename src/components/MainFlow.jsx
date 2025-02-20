import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ReactFlow,
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '../theme.css';
import FieldNode from './FieldNode';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import Signup from './Signup';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { logEvent, EVENT, initSession } from '../services/eventLogger';

const nodeTypes = {
    field: FieldNode
};

function MainFlow() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false);
    const [showFlash, setShowFlash] = useState(false);
    const focusInputRef = useRef(null);
    const [unsavedGoals, setUnsavedGoals] = useState([]);
    const [modalOpenTime, setModalOpenTime] = useState(0);

    const handleDeleteNode = useCallback(async (nodeId) => {
        logEvent(EVENT.NODE.DELETE, currentUser?.uid, { nodeId });
        if (currentUser) {
            try {
                await deleteDoc(doc(db, `users/${currentUser.uid}/goals`, nodeId));
            } catch (error) {
                console.error('Error deleting goal:', error);
            }
        } else {
            // Only handle local state updates when not signed in
            setNodes((nds) => {
                const deletedNode = nds.find(n => n.id === nodeId);
                if (!deletedNode) {
                    console.error('Node not found:', nodeId);
                    return nds;
                }

                const deletedY = deletedNode.position.y;

                return nds
                    .filter(node => node.id !== nodeId)
                    .map(node => {
                        if (node.position.y > deletedY) {
                            return {
                                ...node,
                                position: {
                                    x: node.position.x,
                                    y: node.position.y - (node.position.y === deletedY + 200 ? 200 : 140)
                                }
                            };
                        }
                        return node;
                    });
            });
        }
    }, [currentUser]);

    const INITIAL_Y = 100;  // Back to original value

    // Add back the spacing constants
    const FIRST_NODE_SPACING = 200;  // Bigger gap after first node
    const NORMAL_SPACING = 140;      // Normal gap between other nodes

    const [nodes, setNodes] = useState([
        {
            id: '1',
            type: 'field',
            position: { x: window.innerWidth / 2 - 100, y: INITIAL_Y },
            data: {
                id: '1',
                name: 'Goal',
                message: "",
                onSubmit: handleGoalSubmit,
                onDelete: handleDeleteNode
            }
        }
    ]);
    const [edges, setEdges] = useState([]);
    const nodesRef = useRef(nodes);

    // Update ref when nodes change
    useEffect(() => {
        nodesRef.current = nodes;
    }, [nodes]);

    // Add effect to load goals when user logs in
    useEffect(() => {
        if (!currentUser) {
            setNodes([{
                id: '1',
                type: 'field',
                position: { x: window.innerWidth / 2 - 100, y: INITIAL_Y },
                data: {
                    id: '1',
                    name: 'Goal',
                    message: "",
                    onSubmit: handleGoalSubmit,
                    onDelete: handleDeleteNode
                }
            }]);
            return;
        }

        // Subscribe to user's goals
        const q = query(
            collection(db, `users/${currentUser.uid}/goals`),
            orderBy('createdAt', 'desc')  // Changed to desc to get newest first
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let yPosition = INITIAL_Y;  // Start at top

            // Add the empty node at the top
            const emptyNode = {
                id: 'empty',
                type: 'field',
                position: { x: window.innerWidth / 2 - 100, y: yPosition },
                data: {
                    id: 'empty',
                    name: 'Goal',
                    message: "",
                    onSubmit: handleGoalSubmit,
                    onDelete: handleDeleteNode,
                    key: Date.now(),
                    registerFocus: (focusFn) => {
                        focusInputRef.current = focusFn;
                    }
                }
            };

            yPosition += FIRST_NODE_SPACING;  // First spacing is larger

            // Map goals with calculated positions
            const goals = snapshot.docs.map(doc => {
                const goal = {
                    ...doc.data(),
                    id: doc.id,
                    type: 'field',
                    position: {
                        x: window.innerWidth / 2 - 100,
                        y: yPosition
                    },
                    data: {
                        id: doc.id,
                        name: 'Goal',
                        message: doc.data().data.message,
                        isSubmitted: true,
                        onSubmit: handleGoalSubmit,
                        onDelete: handleDeleteNode
                    }
                };
                yPosition += NORMAL_SPACING;
                return goal;
            });

            setNodes([emptyNode, ...goals]);
        });

        return () => unsubscribe();
    }, [currentUser]);

    async function handleGoalSubmit(goalText, nodeId) {
        // Log the goal submission with the actual text for analytics
        logEvent(EVENT.NODE.SUBMIT, currentUser?.uid || 'anonymous', {
            nodeId,
            textLength: goalText.length,
            goalText: goalText,  // Add this to track the actual text
            isAnonymous: !currentUser  // Flag to easily filter anonymous submissions
        });

        const newId = crypto.randomUUID();
        const sourceNode = nodesRef.current.find(n => n.id === nodeId);

        const newNode = {
            id: newId,
            type: 'field',
            position: {
                x: sourceNode.position.x,
                y: 100
            },
            data: {
                id: newId,
                name: 'Goal',
                message: "",
                onSubmit: handleGoalSubmit,
                onDelete: handleDeleteNode,
                key: Date.now(),
                focusOnMount: true
            }
        };

        // Update nodes locally first
        setNodes(nds => {
            const updatedNodes = nds.map(node => ({
                ...node,
                position: {
                    x: node.position.x,
                    y: node.position.y + (node.position.y === 100 ? FIRST_NODE_SPACING : NORMAL_SPACING)
                },
                data: node.id === nodeId ? {
                    ...node.data,
                    id: node.id,
                    message: goalText,
                    isSubmitted: true
                } : node.data
            }));
            return [newNode, ...updatedNodes];
        });

        if (!currentUser) {
            // Store unsaved goals
            setUnsavedGoals(prev => [...prev, { message: goalText }]);
            setShowFlash(true);
            setTimeout(() => setShowFlash(false), 2000);
        } else {
            // Save to Firestore if user is logged in
            try {
                const goalsRef = collection(db, `users/${currentUser.uid}/goals`);
                await addDoc(goalsRef, {
                    type: 'field',
                    data: {
                        message: goalText,
                        name: 'Goal',
                        isSubmitted: true
                    },
                    createdAt: new Date()  // This is important for ordering
                });
            } catch (error) {
                console.error('Error saving goal:', error);
            }
        }

        // After setNodes or after Firestore save:
        setTimeout(() => {
            if (focusInputRef.current) {
                focusInputRef.current();
            }
        }, 0);
    }

    // Add effect to save unsaved goals when user logs in
    useEffect(() => {
        const saveUnsavedGoals = async () => {
            if (currentUser && unsavedGoals.length > 0) {
                const goalsRef = collection(db, `users/${currentUser.uid}/goals`);

                // Save each unsaved goal
                for (const goal of unsavedGoals) {
                    try {
                        await addDoc(goalsRef, {
                            type: 'field',
                            data: {
                                message: goal.message,
                                name: 'Goal',
                                isSubmitted: true
                            },
                            createdAt: new Date()
                        });
                    } catch (error) {
                        console.error('Error saving goal:', error);
                    }
                }

                // Clear unsaved goals
                setUnsavedGoals([]);
            }
        };

        saveUnsavedGoals();
    }, [currentUser, unsavedGoals]);

    const onNodesChange = useCallback((changes) => {
        changes.forEach(change => {
            if (change.type === 'position' && change.dragging === false) {
                logEvent(EVENT.NODE.MOVE, currentUser?.uid, {
                    nodeId: change.id,
                    from: change.position,
                    to: change.position
                });
            }
        });
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, [currentUser]);

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    // Close modals when user logs in
    useEffect(() => {
        if (currentUser) {
            setShowLogin(false);
            setShowSignup(false);
        }
    }, [currentUser]);

    // Track session
    useEffect(() => {
        initSession(currentUser?.uid);
        logEvent(EVENT.PAGE.HOME, currentUser?.uid);

        return () => {
            logEvent(EVENT.SESSION.END, currentUser?.uid);
        };
    }, [currentUser]);

    // Track modal views
    const handleLoginClick = () => {
        logEvent(EVENT.MODAL.LOGIN_VIEW, currentUser?.uid);
        setShowLogin(true);
    };

    const handleSignupClick = () => {
        logEvent(EVENT.MODAL.SIGNUP_VIEW, currentUser?.uid);
        setShowSignup(true);
    };

    const handleAccountNav = () => {
        navigate('/account');
    };

    const handleModalBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setShowLogin(false);
            setShowSignup(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-text-primary">
            <div className="w-full h-screen">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    minZoom={0.5}
                    maxZoom={1.5}
                    fitViewOptions={{ padding: 0.5 }}
                    className="bg-background"
                >
                    <Background className="bg-background" />
                    <Controls className="bg-surface border border-border rounded-lg" />
                    <Panel position="top-left" className="p-4">
                        <h1 className="text-2xl font-bold text-text-primary">boost.</h1>
                    </Panel>
                    <Panel position="top-right" className="p-4">
                        {currentUser ? (
                            <button
                                onClick={handleAccountNav}
                                className="nav-link px-4 py-2 bg-surface text-text-primary border border-border rounded-md hover:bg-border transition-colors"
                            >
                                Account
                            </button>
                        ) : (
                            <div className="relative">
                                <div className={`flex gap-2 ${showFlash ? 'animate-pulse' : ''}`}>
                                    <button
                                        onClick={handleLoginClick}
                                        className="px-4 py-2 bg-surface text-text-primary border border-border rounded-md hover:bg-border transition-colors"
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={handleSignupClick}
                                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                                    >
                                        Sign Up
                                    </button>
                                </div>
                                {showFlash && (
                                    <div className="absolute top-full right-0 mt-2 bg-surface-secondary text-text-primary px-4 py-2 rounded-md shadow-lg whitespace-nowrap border border-border">
                                        Log in to save your goals
                                    </div>
                                )}
                            </div>
                        )}
                    </Panel>
                </ReactFlow>
            </div>

            {/* Login Modal */}
            {showLogin && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={handleModalBackdropClick}
                >
                    <Login
                        onClose={() => setShowLogin(false)}
                        onSwitchToSignup={() => {
                            setShowLogin(false);
                            setShowSignup(true);
                        }}
                    />
                </div>
            )}

            {/* Signup Modal */}
            {showSignup && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={handleModalBackdropClick}
                >
                    <Signup
                        onClose={() => setShowSignup(false)}
                        onSwitchToLogin={() => {
                            setShowSignup(false);
                            setShowLogin(true);
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default MainFlow; 