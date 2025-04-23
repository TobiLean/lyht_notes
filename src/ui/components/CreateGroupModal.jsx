import Modal from "./Modal.jsx";
import React, {useState} from "react";
import supabaseClient from "../../utils/supabaseClient.js";

const CreateGroupModal = ({isOpen, onClose, userId}) => {
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    console.log("Attempting to save group...");
    if (!groupName.trim()) {
      alert('Please enter a group name.');
      return;
    }

    setLoading(true);

    try {
      // Check if group already exists
      const {data: existingGroup, error: checkError} = await supabaseClient
        .from('groups')
        .select('id')
        .eq('name', groupName)
        .single();

      // Check for errors and ignore no rows found errors
      if(checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Error checking existing groups: ${checkError.message}`);
      }

      if(existingGroup) {
        alert('Group already exists');
        setLoading(false);
        return;
      }

      const {data, error: groupError} = await supabaseClient
        .from('groups')
        .insert({
          name: groupName,
          teacher_id: userId,
        })
        .select()
        .single();

      if (groupError) {
        console.error('Error creating group:', groupError.message);
        alert('Failed to create the group. Please try again.');
        setLoading(false);
        return;
      }

      const groupId = data.id;
      console.log("Group created, ID: ", groupId);

      // Add creator to group
      const { error: memberError } = await supabaseClient
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'creator',
        })

      if (memberError) {
        console.error('Error adding user to group:', memberError.message);
        alert('Failed to add user to group. Please try again.');
      } else {
        alert('Group created and user added successfully.');
        setGroupName(''); // Reset form input
        onClose(); // Close modal
      }

    } catch (err) {
      console.error('Unexpected error creating group:', err.message);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      <button className="btn-cancel" onClick={onClose} disabled={loading}>
        Cancel
      </button>
      <button className="btn-save" onClick={handleSave} disabled={!groupName.trim() || loading}>
        Save
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Group" footer={footer}>
      <div className="create-group-form">
        <label htmlFor="groupName">Group Name:</label>
        <input
          type="text"
          id="groupName"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
        />
      </div>
    </Modal>
  );
}

export default CreateGroupModal;