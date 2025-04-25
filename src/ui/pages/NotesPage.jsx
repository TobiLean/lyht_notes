import React, {useContext, useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import './NotesPage.css'
import EditorComponent from '../components/TipTap2.jsx'
import CreateNoteModal from "../components/CreateNoteModal.jsx";
import AddCollaboratorModal from "../components/AddCollaboratorModal.jsx";
import {useOutletContext} from "react-router-dom";
import LinearProgress from '@mui/material/LinearProgress';
import supabaseClient from "../../utils/supabaseClient.js";
import {AuthContext} from "../../utils/AuthContext.jsx";

const NotesPage = () => {
  // Retrieve the context passed from the layout component
  const {
    activeView,
    saveStatus,
    setSaveStatus,
    isAddCollaboratorModelOpen,
    closeAddCollaboratorModal,
    isNoteModalOpen,
    closeNoteModal,
    setCurrentNoteData
  } = useOutletContext();
  const {authContextProfileNames} = useContext(AuthContext);
  const [currentUser, setCurrentUser] = useState(null);
  const [noteID, setNoteID] = useState(null);
  const [pend, setPend] = useState(true);
  const {id: noteId} = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (noteId !== "00") {
      console.log(noteId);
    } else {
      console.log("NotesPage note id is '00', checking for user's latest note.");

      const fetchLatestNote = async () => {
        try {
          const {data, error} = await supabaseClient
            .from("notes")
            .select("id, updated_at, title")
            .order("updated_at", {ascending: false}); // Sort by latest update

          if (error) {
            console.error("❌ Error fetching notes:", error);
            return;
          }

          if (data.length > 0) {
            // Navigate to the most recently updated note
            navigate(`/notes/${data[0].id}`, {replace: true});
            console.log("Data of note ", data[0])
            setCurrentNoteData(data[0]);
            console.log("NotesPage notes", noteId);
            setPend(false);
          }
        } catch (err) {
          console.error("❌ Unexpected error fetching notes:", err);
        }
      };

      fetchLatestNote();
    }
  }, [activeView]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const {data: {user}, error} = await supabaseClient.auth.getUser();
      if (error) {
        console.log("Error getting user:", error.message);
      } else {
        setCurrentUser(user);
      }
    };

    getCurrentUser();
  }, []);

  return (
    <div className="notes-page">
      {!pend ? <EditorComponent noteId={noteId} user={{
        name: `${authContextProfileNames.first_name} ${authContextProfileNames.last_name}`,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16)
      }}/> : <LinearProgress/>}
      {/* Conditionally render the modal */}
      {isNoteModalOpen && (
        <CreateNoteModal isOpen={isNoteModalOpen} onClose={closeNoteModal} userId={currentUser.id}/>
      )}
      {!pend && isAddCollaboratorModelOpen && (
        <AddCollaboratorModal isOpen={isAddCollaboratorModelOpen} onClose={closeAddCollaboratorModal} noteId={noteId}/>
      )}

    </div>
  )
}

export default NotesPage;