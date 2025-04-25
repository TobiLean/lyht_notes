import Modal from "./Modal.jsx";
import React, {useState} from "react";
import { useNotification } from "./NotificationProvider.jsx";
import supabaseClient from "../../utils/supabaseClient.js";

// Component to handle creating a group (Displays a modal)
const CreateGroupModal = ({isOpen, onClose, userId}) => {
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);

  // Use global notifications
  const notify = useNotification();

  // Save new group and add creator
  const handleSave = async () => {
    console.log("Attempting to save group...");
    if (!groupName.trim()) {
      notify.warning({
        message: 'Incomplete Information',
        description: 'Please enter a group name.',
        placement: 'bottomRight',
      })
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
        notify.warning({
          message: 'Group already exists',
          description: 'Group already exists, please try again.',
          placement: 'bottomRight',
        })
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
        notify.error({
          message: 'Error creating group:',
          description: 'Failed to create the group. Please try again.',
          placement: 'bottomRight',
        })
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
        notify.error({
          message: 'Error adding user to group',
          description: 'Failed to add user to group. Please try again.',
          placement: 'bottomRight',
        })
      } else {
        notify.success({
          message: 'Group created successfully',
          description: 'Group created and user added successfully.',
          placement: 'bottomRight',
        })
        setGroupName(''); // Reset form input
        onClose(); // Close modal
      }

    } catch (err) {
      console.error('Unexpected error creating group:', err.message);
      notify.error({
        message: 'Unexpected error creating group',
        description: 'An unexpected error occurred. Please try again.',
        placement: 'bottomRight',
      })
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