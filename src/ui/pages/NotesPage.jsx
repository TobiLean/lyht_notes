import React, {useEffect, useState} from 'react';
import './NotesPage.css'
import TipTap from '../components/TipTap.jsx'
import TestComponent from "../components/TestComponent.jsx";
import CreateNoteModal from "../components/CreateNoteModal.jsx";
import {useOutletContext} from "react-router-dom";
import supabaseClient from "../../utils/supabaseClient.js";

const NotesPage = () => {
  // Retrieve the context passed from the layout component
  const { saveStatus, setSaveStatus, isNoteModalOpen, closeNoteModal } = useOutletContext();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const {data: {user}, error} = await supabaseClient.auth.getUser();
      if (error) {
        console.log("Error getting user:", error.message);
      }
      else {
        setCurrentUser(user);
      }
    };

    getCurrentUser();
  }, []);

  return (
    <div className="notes-page">
      <TipTap saveStatus={saveStatus} setSaveStatus={setSaveStatus} />
      {/* Conditionally render the modal */}
      {isNoteModalOpen && (
        <CreateNoteModal isOpen={isNoteModalOpen} onClose={closeNoteModal} userId={currentUser.id}/>
      )}

    </div>
  )
}

export default NotesPage;