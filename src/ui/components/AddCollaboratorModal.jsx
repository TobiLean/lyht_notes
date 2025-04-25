import React, { useState } from "react";
import Modal from "./Modal";
import supabaseClient from "../../utils/supabaseClient.js";
import { useNotification } from "./NotificationProvider.jsx"

// Modal to add collaborator to a note
const AddCollaboratorModal = ({ isOpen, onClose, noteId }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const notify = useNotification(); // Global notifications

  // Handle searching for user
  const handleSearch = async () => {
    if (!email.trim()) {
      notify.warning({ message: "Enter an email", description: "Please provide a valid email address." });
      return;
    }

    // Set loading to true before search begins
    setLoading(true);

    try {
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("user_id, first_name, last_name")
        .eq("email", email)
        .single();

      if (error || !data) {
        notify.error({ message: "User Not Found", description: "No user exists with this email." });
        setLoading(false);
        return;
      }

      const userId = data.user_id;
      await addCollaborator(noteId, userId);
    } catch (err) {
      notify.error({ message: "Error", description: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Function to add collaboraor to a note
  const addCollaborator = async (noteId, userId) => {
    const { data, error } = await supabaseClient
      .from("notes")
      .select("collaborators")
      .eq("id", noteId)
      .single();

    if (error || !data) {
      notify.error({ message: "Error", description: "Failed to retrieve note details." });
      return;
    }

    // Extract existing collaborators, ensuring it's a valid string
    const currentCollaborators = data.collaborators || "";

    // Convert to array, add new user ID, and remove duplicates
    const collaboratorsArray = [...new Set([...currentCollaborators.split(","), userId])];

    // Convert back to comma-separated string
    const updatedCollaborators = collaboratorsArray.join(",");

    const { updateError } = await supabaseClient
      .from("notes")
      .update({ collaborators: updatedCollaborators })
      .eq("id", noteId);

    if (updateError) {
      notify.error({ message: "Error Adding Collaborator", description: "Please try again later." });
    } else {
      notify.success({ message: "Collaborator Added", description: "User successfully added to the note." });
      onClose(); // Close modal after success
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Collaborator">
      <div className="collaborator-form">
        <label htmlFor="email">Search by Email:</label>
        <input
          type="email"
          id="email"
          placeholder="Enter user's email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Adding..." : "Add Collaborator"}
        </button>
      </div>
    </Modal>
  );
};

export default AddCollaboratorModal;