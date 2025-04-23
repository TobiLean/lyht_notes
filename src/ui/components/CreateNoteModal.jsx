import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import supabaseClient from "../../utils/supabaseClient.js";

const CreateNoteModal = ({ isOpen, onClose, userId }) => {
  const [noteTitle, setNoteTitle] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [newTagName, setNewTagName] = useState('');
  const [isCustomTag, setIsCustomTag] = useState(false); // Tracks if "Custom" is selected

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data, error } = await supabaseClient
          .from('tags')
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching tags:', error.message);
        } else {
          setTags(data);
          console.log(data);
        }
      } catch (err) {
        console.error('Unexpected error fetching tags:', err);
      }
    };

    if (userId) {
      fetchTags();
    }
  }, [userId]);

  const handleSave = async () => {
    if (!noteTitle || (!selectedTagId && !isCustomTag)) {
      alert('Please provide a note title and select a tag.');
      return;
    }

    if (isCustomTag && newTagName.trim() === '') {
      alert('Please provide a name for your custom tag.');
      return;
    }

    let tagId = selectedTagId;

    // If creating a custom tag, save it first
    if (isCustomTag) {
      try {
        const { data, error } = await supabaseClient
          .from('tags')
          .insert({ name: newTagName, user_id: userId })
          .select()
          .single();

        if (error) {
          console.error('Error creating custom tag:', error.message);
          alert('Failed to create custom tag. Please try again.');
          return;
        }

        tagId = data.id; // Use the new tag ID
        setTags([...tags, data]); // Add the new tag to the list
        setNewTagName(''); // Clear the input
        setIsCustomTag(false); // Reset custom tag state
      } catch (err) {
        console.error('Unexpected error creating custom tag:', err);
        alert('An error occurred while creating the tag. Please try again.');
        return;
      }
    }

    // Save the note with the resolved tag ID
    try {
      const { error } = await supabaseClient.from('notes').insert({
        title: noteTitle,
        user_id: userId,
        content: [0,0],
        tag_id: tagId,
      });

      if (error) {
        console.error('Error saving note:', error.message);
        alert('Failed to save the note. Please try again.');
      } else {
        setNoteTitle('');
        setSelectedTagId(null);
        onClose();
        alert('Note saved successfully!');
      }
    } catch (err) {
      console.error('Unexpected error saving note:', err);
      alert('An error occurred while saving the note. Please try again.');
    }
  };

  const handleTagChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setIsCustomTag(true);
      setSelectedTagId(null); // Clear selected tag ID
    } else {
      setIsCustomTag(false);
      setSelectedTagId(value);
    }
  };

  const footer = (
    <>
      <button className="btn-cancel" onClick={onClose}>
        Cancel
      </button>
      <button
        className="btn-save"
        onClick={handleSave}
        disabled={!noteTitle || (!selectedTagId && !isCustomTag)}
      >
        Save
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Note" footer={footer}>
      <div className="create-note-form">
        <label htmlFor="noteTitle">Title:</label>
        <input
          type="text"
          id="noteTitle"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          placeholder="Enter note title"
        />

        <label htmlFor="tags">Tag:</label>
        <select
          id="tags"
          value={isCustomTag ? 'custom' : selectedTagId || ''}
          onChange={handleTagChange}
        >
          <option value="" disabled>
            Select a tag
          </option>
          {tags.map((tag) => (
            <option key={tag.tag_id} value={tag.tag_id}>
              {tag.name}
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>

        {isCustomTag && (
          <div className="create-new-tag">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Enter new tag name"
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CreateNoteModal;