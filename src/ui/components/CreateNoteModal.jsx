import React, {useState, useEffect} from 'react';
import Modal from './Modal';
import {useNotification} from "./NotificationProvider.jsx";
import supabaseClient from "../../utils/supabaseClient.js";

// Component to render modal for creating a new not and tag
const CreateNoteModal = ({isOpen, onClose, userId}) => {
  const [noteTitle, setNoteTitle] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [newTagName, setNewTagName] = useState('');
  const [isCustomTag, setIsCustomTag] = useState(false); // Tracks if "Custom" is selected

  const notify = useNotification();

  // Effect to get user's tags for tag selection list
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const {data, error} = await supabaseClient
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
      notify.warning({
        message: 'Incomplete Information',
        description: 'Please provide a note title and select a tag.',
        placement: 'bottomRight',
      })
      return;
    }

    if (isCustomTag && newTagName.trim() === '') {
      notify.warning({
        message: 'Incomplete Information',
        description: 'Please provide a name for your custom tag.',
        placement: 'bottomRight',
      })
      return;
    }

    let tagId = selectedTagId;

    // If creating a custom tag, save it first
    if (isCustomTag) {
      try {
        // Create new tag ids based on lenghth of tag array. Default tagId = 0 ('General')
        const newTagId = tags.length
        const newTagColour = '#' + Math.floor(Math.random() * 16777215).toString(16)

        const {data, error} = await supabaseClient
          .from('tags')
          .insert({name: newTagName.toLowerCase(), user_id: userId, tag_id: newTagId, color: newTagColour})
          .select("*")
          .single();

        if (error) {
          console.error('Error creating custom tag:', error.message);
          notify.error({
            message: 'Failed to create custom tag:',
            description: 'Failed to create custom tag. Please try again.',
            placement: 'bottomRight',
          })
          return;
        }

        tagId = data.tag_id; // Use the new tag ID
        console.log("Checking new tag id", tagId)
        setTags([...tags, data]); // Add the new tag to the list
        setNewTagName(''); // Clear the input
        setIsCustomTag(false); // Reset custom tag state
      } catch (err) {
        console.error('Unexpected error creating custom tag:', err);
        notify.error({
          message: 'Unexpected error creating custom tag',
          description: 'An error occurred while creating the tag. Please try again.',
          placement: 'bottomRight',
        })
        return;
      }
    }

    // Save the note with the resolved tag ID
    try {
      const {error} = await supabaseClient.from('notes').insert({
        title: noteTitle,
        user_id: userId,
        content: [0, 0],
        tag_id: tagId,
      });

      if (error) {
        console.error('Error saving note:', error.message);
        notify.error({
          message: 'Error saving note',
          description: 'Failed to save the note. Please try again.',
          placement: 'bottomRight',
        })
      } else {
        setNoteTitle('');
        setSelectedTagId(null);
        onClose();
        notify.success({
          message: 'Success!',
          description: 'Note saved successfully!',
          placement: 'bottomRight',
        })
      }
    } catch (err) {
      console.error('Unexpected error saving note:', err);
      notify.error({
        message: 'Unexpected error saving note',
        description: 'An error occurred while saving the note. Please try again.',
        placement: 'bottomRight',
      })
    }
  };

  // Handle selected tag changes
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