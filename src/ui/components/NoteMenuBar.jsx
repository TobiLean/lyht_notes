import React, {useState} from "react";
import Modal from "./Modal.jsx"

const NoteMenuBar = ({editor, saveNote}) => {
  [isModalOpen, setIsModalOpen] = useState(false);
  [imageUrl, setImageUrl] = useState("");

  if (!editor) return null; // Prevent errors if editor isn't initialized

  function setToggle(element) {
    if (element.classList.contains('toggled')) {
      element.classList.remove('toggled');
    } else {
      element.classList.add('toggled');
    }
  }

  return (
    <div className="note-menu-bar">
      <div className="note-menu-bar-left">
        <button
          onClick={() => {
            editor.chain().focus().toggleBold().run()
            const e = document.querySelector('.note-menu-bar-button-bold')
            setToggle(e);
          }}
          className="note-menu-bar-button-bold"
        >
          Bold
        </button>
        <button
          onClick={() => {
            editor.chain().focus().toggleItalic().run()
            const e = document.querySelector('.note-menu-bar-buttonItalic')
            setToggle(e);
          }}
          className="note-menu-bar-button-italic"
        >
          Italic
        </button>
        <button
          onClick={() => {
            editor.chain().focus().toggleHeading({level: 2}).run()
            const e = document.querySelector('.note-menu-bar-buttonHeading')
            setToggle(e);
          }}
          className="note-menu-bar-buttonHeading"
        >
          H2 Heading
        </button>
        <button onClick={() => {
          const imageUrl = prompt("Enter image URL:");
          if (imageUrl) editor.chain().focus().setImage({src: imageUrl}).run();
        }} className="note-menu-bar-button">
          Add Image
        </button>
      </div>
      <div className="note-menu-bar-right">
        <button
          className="save-button"
          onClick={saveNote}
        >
          Save Note
        </button>
      </div>
    </div>
  );
};

export default NoteMenuBar;