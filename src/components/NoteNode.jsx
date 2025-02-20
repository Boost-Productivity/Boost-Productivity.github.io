import React from 'react';

function NoteNode({ data }) {
  return (
    <div className="react-flow__node-custom">
      <h3>{data.name}</h3>
      <p><strong>Prompt:</strong> {data.prompt}</p>
      <p><strong>Content:</strong> {data.content}</p>
    </div>
  );
}

export default NoteNode;