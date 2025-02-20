import React, { useState } from 'react';

function AddNoteForm({ onSubmit }) {
  const [noteData, setNoteData] = useState({
    name: '',
    prompt: '',
    content: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(noteData);
    setNoteData({ name: '', prompt: '', content: '' });
  };

  const handleChange = (e) => {
    setNoteData({
      ...noteData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="note-form">
      <div>
        <input
          type="text"
          name="name"
          value={noteData.name}
          onChange={handleChange}
          placeholder="Note Name"
          required
        />
      </div>
      <div>
        <input
          type="text"
          name="prompt"
          value={noteData.prompt}
          onChange={handleChange}
          placeholder="Prompt"
          required
        />
      </div>
      <div>
        <textarea
          name="content"
          value={noteData.content}
          onChange={handleChange}
          placeholder="Content"
          required
        />
      </div>
      <button type="submit">Add Note</button>
    </form>
  );
}

export default AddNoteForm;