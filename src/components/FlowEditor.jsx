import React, { useState, useCallback, useEffect } from 'react';
import {
    ReactFlow,
    addEdge,
    MiniMap,
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    Panel,
    useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAuth } from '../contexts/AuthContext';
import { Field } from '../FieldModel';
import FieldNode from './FieldNode';

const nodeTypes = {
    field: FieldNode
};

function CreateFieldButton({ onCreate }) {
    const { screenToFlowPosition } = useReactFlow();

    const handleClick = () => {
        const position = screenToFlowPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        });
        onCreate(position);
    };

    return (
        <button onClick={handleClick} className="create-field-button">
            + New Field
        </button>
    );
}

function FlowEditor({ userId }) {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const { currentUser } = useAuth();

    useEffect(() => {
        // Here you would typically load the user's fields from Firebase
    }, [userId]);

    useEffect(() => {
        if (currentUser) {
            // Here you would typically save the fields to Firebase
        }
    }, [nodes, edges, currentUser]);

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        []
    );

    const updateField = useCallback((fieldId, updates) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === fieldId
                    ? { ...node, data: { ...node.data, ...updates } }
                    : node
            )
        );
    }, []);

    const createField = useCallback((position) => {
        const newField = new Field({
            id: crypto.randomUUID(),
            name: ''
        });

        setNodes((nds) => [...nds, {
            id: newField.id,
            type: 'field',
            position,
            data: {
                ...newField,
                onUpdate: updateField
            }
        }]);
    }, []);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background />
                <Controls />
                <MiniMap />
                <Panel position="top-left">
                    <div className="flex gap-2">
                        <CreateFieldButton onCreate={createField} />
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
}

export default FlowEditor; 