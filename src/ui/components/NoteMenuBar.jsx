import React, {useState} from "react";
import Modal from "./Modal.jsx"

const NoteMenuBar = ({editor, saveNote}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  if (!editor) return null; // Prevent errors if editor isn't initialized

  function setToggle(element) {
    if (element.classList.contains('toggled')) {
      element.classList.remove('toggled');
    } else {
      element.classList.add('toggled');
    }
  }

  function handleAddImage() {
    if(imageUrl) {
      editor.chain().focus().setImage({src: imageUrl}).run()
    }
    setIsModalOpen(false);
    setImageUrl("");
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
        <button onClick={() => setIsModalOpen(true) } className="note-menu-bar-button">
          Add Image
        </button>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Image"
          footer={<button onClick={handleAddImage} className="btn-save">
            Add Image
          </button>}
        >
          <input
            type="text"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </Modal>
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