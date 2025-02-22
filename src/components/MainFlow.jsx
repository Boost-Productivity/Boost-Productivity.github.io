import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ReactFlow,
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    Panel,
    useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '../theme.css';
import FieldNode from './FieldNode';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import Signup from './Signup';
import { db, storage } from '../firebase';
import { collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot, setDoc, deleteField, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { logEvent, EVENT, initSession } from '../services/eventLogger';

const nodeTypes = {
    field: FieldNode
};

// Add this near the top with other constants
const proOptions = { hideAttribution: true };

// Add this constant at the top with other constants
const NODE_WIDTH = 400;  // Actual width of the node including padding

function MainFlow() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false);
    const [showFlash, setShowFlash] = useState(false);
    const focusInputRef = useRef(null);
    const [unsavedNodes, setUnsavedNodes] = useState([]);
    const [modalOpenTime, setModalOpenTime] = useState(0);
    const [showNodeTypeModal, setShowNodeTypeModal] = useState(false);
    const [newNodeType, setNewNodeType] = useState('');
    const [flashMessage, setFlashMessage] = useState('');
    const [nodeTypeFilter, setNodeTypeFilter] = useState('all');

    const reactFlowInstance = useReactFlow();

    const handleFileSubmit = useCallback(async (file, nodeId) => {
        const sourceNode = nodesRef.current.find(n => n.id === nodeId);
        if (!sourceNode || !currentUser) return;

        try {
            // Upload file to Firebase Storage
            const timestamp = Date.now();
            const filename = `${currentUser.uid}/${nodeId}/${timestamp}_${file.name}`;
            const storageRef = ref(storage, filename);

            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            // Then save the node with the file URL
            const nodeType = sourceNode.data.name;
            const collectionName = nodeType.toLowerCase().replace(/\s+/g, '_') + 's';
            const collectionRef = collection(db, `users/${currentUser.uid}/${collectionName}`);

            const docData = {
                type: 'field',
                data: {
                    message: downloadURL,
                    name: nodeType,
                    isSubmitted: true,
                    isFile: true,
                    fileName: file.name
                },
                position: sourceNode.position,
                createdAt: new Date()
            };

            await addDoc(collectionRef, docData);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    }, [currentUser]);

    const handleNodeSubmit = useCallback(async (text, nodeId) => {
        const sourceNode = nodesRef.current.find(n => n.id === nodeId);
        if (!sourceNode) {
            console.error('Source node not found:', nodeId);
            return;
        }

        const nodeType = sourceNode.data.name;
        const collectionName = nodeType.toLowerCase().replace(/\s+/g, '_') + 's';

        if (!currentUser) {
            setUnsavedNodes(prev => [...prev, { message: text, nodeType }]);
            setFlashMessage('Log in to save your goals');
            setShowFlash(true);
            setTimeout(() => setShowFlash(false), 2000);
            return;
        }

        try {
            // Save to the proper collection based on node type
            const collectionRef = collection(db, `users/${currentUser.uid}/${collectionName}`);
            const docData = {
                type: 'field',
                data: {
                    message: text,
                    name: nodeType,
                    isSubmitted: true
                },
                position: sourceNode.position,
                createdAt: new Date()
            };

            await addDoc(collectionRef, docData);

            // No need to register node type here since it's already registered
        } catch (error) {
            console.error('Error saving node:', error);
        }
    }, [currentUser]);

    const handleDeleteNode = useCallback(async (nodeId) => {
        const nodeToDelete = nodesRef.current.find(n => n.id === nodeId);
        if (!nodeToDelete) return;

        const collectionName = nodeToDelete.data.name.toLowerCase().replace(/\s+/g, '_') + 's';

        if (currentUser) {
            try {
                await deleteDoc(doc(db, `users/${currentUser.uid}/${collectionName}`, nodeId));
            } catch (error) {
                console.error('Error deleting node:', error);
            }
        } else {
            // Handle local deletion
            setNodes(nds => nds.filter(n => n.id !== nodeId));
        }
    }, [currentUser]);

    // Update the constants
    const INITIAL_Y = 100;  // Consistent starting point
    const FIRST_NODE_SPACING = 120;  // Slightly reduced spacing
    const NODE_HEIGHT = 140;
    const VERTICAL_GAP = 30;  // Reduced gap
    const NODE_SPACING = NODE_HEIGHT + VERTICAL_GAP;

    const [nodes, setNodes] = useState([]);
    const [customNodeTypes, setCustomNodeTypes] = useState(new Set());
    const [edges, setEdges] = useState([]);
    const nodesRef = useRef(nodes);

    // Update ref when nodes change
    useEffect(() => {
        nodesRef.current = nodes;
    }, [nodes]);

    // Add this function inside MainFlow component
    const calculateCenterX = () => (window.innerWidth - NODE_WIDTH) / 2;

    // First, update the useEffect that loads nodes to handle multiple collections
    useEffect(() => {
        if (!currentUser) {
            setNodes([{
                id: '1',
                type: 'field',
                position: { x: calculateCenterX(), y: INITIAL_Y },
                data: {
                    id: '1',
                    name: 'Goal',
                    message: "",
                    onSubmit: handleNodeSubmit,
                    onFileSubmit: handleFileSubmit,
                    onDelete: handleDeleteNode
                }
            }]);
            return;
        }

        const unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (userDoc) => {
            if (!userDoc.exists()) return;

            const types = ['goals', ...Object.keys(userDoc.data()?.nodeTypes || {})];
            setCustomNodeTypes(new Set(types));

            const centerX = calculateCenterX();

            const emptyNodes = [{
                id: `empty_${nodeTypeFilter === 'all' ? 'goals' : nodeTypeFilter.toLowerCase().replace(/\s+/g, '_') + 's'}`,
                type: 'field',
                position: { x: centerX, y: INITIAL_Y },
                data: {
                    id: `empty_${nodeTypeFilter === 'all' ? 'goals' : nodeTypeFilter.toLowerCase().replace(/\s+/g, '_') + 's'}`,
                    name: nodeTypeFilter === 'all' ? 'Goal' : nodeTypeFilter,
                    message: "",
                    onSubmit: handleNodeSubmit,
                    onFileSubmit: handleFileSubmit,
                    onDelete: handleDeleteNode,
                    onDeleteType: nodeTypeFilter !== 'all' && nodeTypeFilter.toLowerCase() !== 'goal' ? handleDeleteNodeType : undefined,
                    key: Date.now()
                }
            }];

            setNodes(emptyNodes);

            // Subscribe only to the currently selected type's collection
            const currentType = nodeTypeFilter === 'all' ? 'goals' : nodeTypeFilter.toLowerCase().replace(/\s+/g, '_') + 's';

            if (!types.includes(currentType)) {
                return;
            }

            const q = query(
                collection(db, `users/${currentUser.uid}/${currentType}`),
                orderBy('createdAt', 'desc')
            );

            const unsubscribeNodes = onSnapshot(q, (snapshot) => {
                const items = snapshot.docs.map((doc, itemIndex) => ({
                    id: doc.id,
                    type: 'field',
                    position: {
                        x: centerX,
                        y: INITIAL_Y + FIRST_NODE_SPACING + (itemIndex * NODE_SPACING)
                    },
                    data: {
                        id: doc.id,
                        name: nodeTypeFilter === 'all' ? 'Goal' : nodeTypeFilter,
                        message: doc.data().data?.message || "",
                        isSubmitted: true,
                        onSubmit: handleNodeSubmit,
                        onFileSubmit: handleFileSubmit,
                        onDelete: handleDeleteNode,
                        isFile: doc.data().data?.isFile,
                        fileName: doc.data().data?.fileName
                    }
                }));

                setNodes(currentNodes => {
                    const emptyNode = currentNodes.find(n => n.id.startsWith('empty_'));
                    return [emptyNode, ...items];
                });
            });

            return () => {
                unsubscribeNodes();
            };
        });

        return () => {
            unsubscribe();
        };
    }, [currentUser, handleNodeSubmit, handleFileSubmit, handleDeleteNode, nodeTypeFilter]);

    // Add effect to save unsaved goals when user logs in
    useEffect(() => {
        const saveUnsavedGoals = async () => {
            if (currentUser && unsavedNodes.length > 0) {
                const goalsRef = collection(db, `users/${currentUser.uid}/goals`);

                // Save each unsaved goal
                for (const goal of unsavedNodes) {
                    try {
                        await addDoc(goalsRef, {
                            type: 'field',
                            data: {
                                message: goal.message,
                                name: goal.nodeType,
                                isSubmitted: true
                            },
                            createdAt: new Date()
                        });
                    } catch (error) {
                        console.error('Error saving goal:', error);
                    }
                }

                // Clear unsaved goals
                setUnsavedNodes([]);
            }
        };

        saveUnsavedGoals();
    }, [currentUser, unsavedNodes]);

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

    const handleCreateNodeType = async (e) => {
        e.preventDefault();
        if (!newNodeType.trim()) return;

        try {
            if (currentUser) {
                // 1. First register the node type in user's settings
                const collectionName = newNodeType.toLowerCase().replace(/\s+/g, '_') + 's';
                const userRef = doc(db, 'users', currentUser.uid);
                await setDoc(userRef, {
                    nodeTypes: {
                        [collectionName]: true
                    }
                }, { merge: true });

                // 2. The useEffect will handle creating the empty node and setting up the collection
                // when it detects the new node type
            } else {
                // For non-logged in users, just create the node locally
                const newId = crypto.randomUUID();
                const newNode = {
                    id: newId,
                    type: 'field',
                    position: {
                        x: window.innerWidth / 2 - 100,
                        y: INITIAL_Y
                    },
                    data: {
                        id: newId,
                        name: newNodeType,
                        message: "",
                        onSubmit: handleNodeSubmit,
                        onFileSubmit: handleFileSubmit,
                        onDelete: handleDeleteNode,
                        key: Date.now(),
                        registerFocus: (focusFn) => {
                            focusInputRef.current = focusFn;
                        }
                    }
                };

                setNodes(nds => {
                    const updatedNodes = [newNode, ...nds];
                    nodesRef.current = updatedNodes;
                    return updatedNodes;
                });
            }

            setNewNodeType('');
            setShowNodeTypeModal(false);
        } catch (error) {
            console.error('Error creating node type:', error);
        }
    };

    const handleDeleteNodeType = async (nodeType) => {
        if (!currentUser) return;

        try {
            // Don't allow deleting the default 'goals' type
            if (nodeType.toLowerCase() === 'goal') {
                return;
            }

            const collectionName = nodeType.toLowerCase().replace(/\s+/g, '_') + 's';

            // Check if collection has any documents
            const snapshot = await getDocs(collection(db, `users/${currentUser.uid}/${collectionName}`));
            if (!snapshot.empty) {
                console.error('Cannot delete node type with existing nodes');
                return;
            }

            const userRef = doc(db, 'users', currentUser.uid);

            // Remove the node type from user's settings
            await setDoc(userRef, {
                nodeTypes: {
                    [collectionName]: deleteField()
                }
            }, { merge: true });

        } catch (error) {
            console.error('Error deleting node type:', error);
        }
    };

    // Add a new useEffect to handle window resizing
    useEffect(() => {
        const handleResize = () => {
            const centerX = calculateCenterX();
            setNodes(nodes => nodes.map(node => ({
                ...node,
                position: {
                    x: centerX,
                    y: node.position.y
                }
            })));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-background text-text-primary">
            <div className="w-full h-screen">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    minZoom={0.2}
                    maxZoom={1.5}
                    defaultViewport={{
                        x: 0,
                        y: 0,
                        zoom: 0.7
                    }}
                    fitViewOptions={{
                        padding: 0.1,
                        minZoom: 0.7,
                        maxZoom: 0.7,
                        duration: 200
                    }}
                    className="bg-background"
                    proOptions={proOptions}
                >
                    <Background className="bg-background" />
                    <Controls className="bg-surface border border-border rounded-lg" />
                    <Panel position="top-left" className="p-4 flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-text-primary">boost.</h1>
                        <select
                            value={nodeTypeFilter}
                            onChange={(e) => {
                                setNodeTypeFilter(e.target.value);
                                // Don't automatically fit view on filter change
                            }}
                            className="nav-link px-4 py-2 bg-surface text-text-primary border border-border rounded-md hover:bg-border transition-colors"
                        >
                            <option value="all">All Types</option>
                            {Array.from(customNodeTypes)
                                .map(type => ({
                                    value: type === 'goals' ? 'Goal' : type.slice(0, -1).split('_').map(word =>
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' '),
                                    type
                                }))
                                .sort((a, b) => a.value.localeCompare(b.value))
                                .map(({ value, type }) => (
                                    <option key={type} value={value}>
                                        {value}
                                    </option>
                                ))}
                        </select>
                        <button
                            onClick={() => {
                                if (!currentUser) {
                                    setFlashMessage('Log in to create more node types');
                                    setShowFlash(true);
                                    setTimeout(() => setShowFlash(false), 2000);
                                    return;
                                }
                                setShowNodeTypeModal(true);
                            }}
                            className="nav-link px-4 py-2 bg-surface text-text-primary border border-border rounded-md hover:bg-border transition-colors"
                        >
                            + New Node Type
                        </button>
                    </Panel>
                    <Panel position="top-right" className="p-4">
                        {currentUser ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAccountNav}
                                    className="nav-link px-4 py-2 bg-surface text-text-primary border border-border rounded-md hover:bg-border transition-colors"
                                >
                                    Account
                                </button>
                                {currentUser.email === 'jacob.beauchamp75@gmail.com' && (
                                    <button
                                        onClick={() => navigate('/admin')}
                                        className="nav-link px-4 py-2 bg-surface text-text-primary border border-border rounded-md hover:bg-border transition-colors"
                                    >
                                        Admin
                                    </button>
                                )}
                            </div>
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
                                        {flashMessage || 'Log in to save your goals'}
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

            {/* Add Node Type Modal */}
            {showNodeTypeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-surface p-6 rounded-lg border border-border w-[400px]">
                        <h2 className="text-xl font-bold mb-4">Create New Node Type</h2>
                        <form onSubmit={handleCreateNodeType}>
                            <input
                                type="text"
                                value={newNodeType}
                                onChange={(e) => setNewNodeType(e.target.value)}
                                placeholder="Enter node type name..."
                                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary mb-4"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowNodeTypeModal(false)}
                                    className="px-4 py-2 bg-background text-text-primary border border-border rounded-md hover:bg-border transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MainFlow; 