import React, {useState, useRef, useEffect} from "react";
import CreateGroupModal from "../components/CreateGroupModal.jsx";
import {useOutletContext} from "react-router-dom";
import supabaseClient from "../../utils/supabaseClient.js";

const GroupsPage = () => {
  const [error, setError] = useState(null); // Tracking errors
  const [currentUser, setCurrentUser] = useState(null);
  // Retrieve the context passed from the layout component
  const { isGroupCreationModalOpen, closeGroupCreationModal } = useOutletContext(); // Get modal open/close state

  useEffect(() => {

    // Get the current signed-in user
    const fetchCurrentUser = async () => {
      try {
        const {data: {user}, userError} = await supabaseClient.auth.getUser();
        if (userError) {
          console.log("Error getting user:", userError.message);
          setError('Failed to get user, please try again');
          return;
        }
        setCurrentUser(user);
        console.log("Current user:", user.id);
      } catch (err) {
        console.error("Error fetching current user", err.message);
        setError("An unexpected error occurred. Please try again");
      }
    }

    fetchCurrentUser();
  }, []);

  return (
    <>
      <div>
        <h1>Groups</h1>
      </div>
      {/* Conditionally render the modal */}
      {isGroupCreationModalOpen && (
        <CreateGroupModal isOpen={isGroupCreationModalOpen} onClose={closeGroupCreationModal} userId={currentUser.id}/>
      )}
    </>
  )
}

export default GroupsPage;