// Styled in NotesPage.css
import React from 'react';

const NoteMenuBar = ({ onToggleBold, onToggleItalic, onChangeFontFamily, onAddImage }) => {

  return (
    <div
      className="note-menu-bar"
    >
      <button onClick={onToggleBold} className="note-menu-bar-button-bold">
        Bold
      </button>
      <button onClick={onToggleItalic} className="note-menu-bar-button-italic">
        Italic
      </button>
      <button onClick={onAddImage} className="note-menu-bar-button">
        Add an Image from a URL
      </button>
      <select
        onChange={onChangeFontFamily}
        defaultValue=""
      >
        <option value="" disabled>
          Font Family
        </option>
        <option value="Arial, sans-serif">Arial</option>
        <option value="'Times New Roman', serif">Times New Roman</option>
        <option value="Georgia, serif">Georgia</option>
        <option value="'Courier New', monospace">Courier New</option>
      </select>
    </div>
  );
};

export default NoteMenuBar;
