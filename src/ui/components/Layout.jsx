import React, {useEffect, useState} from "react"
import {Outlet, useLocation} from "react-router-dom";
import CustomTitleBar from "./CustomTitleBar.jsx";
import Sidebar from "./Sidebar";
import BottomBar from "./BottomBar.jsx";

// Function to determine main app component layout
export default function Layout() {

  const location = useLocation();

  // Get current page from location
  const activeView = (location.pathname.split('/')[1] || '');
  const [saveStatus, setSaveStatus] = useState('');
  const [isNoteModalOpen, setNoteModalOpen] = useState(false);
  const [isQuizCreationModalOpen, setQuizCreationModalOpen] = useState(false);
  const [isGroupCreationModalOpen, setGroupCreationModalOpen] = useState(false);
  const [isAddCollaboratorModelOpen, setAddCollaboratorModelOpen] = useState(false);

  // Functions for opening and closing some modals
  const openNoteModal = () => setNoteModalOpen(true);
  const onOpenQuizCreationModal = () => setQuizCreationModalOpen(true);
  const onOpenGroupCreationModal = () => setGroupCreationModalOpen(true);
  const closeNoteModal = () => setNoteModalOpen(false);
  const closeQuizCreationModal = () => setQuizCreationModalOpen(false);
  const closeGroupCreationModal = () => setGroupCreationModalOpen(false);
  const onOpenAddCollaboratorModal = () => setAddCollaboratorModelOpen(true);
  const closeAddCollaboratorModal = () => setAddCollaboratorModelOpen(false);


  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}
    >
      <CustomTitleBar/>
      <Sidebar activeView={activeView} onOpenNoteModal={openNoteModal}
               onOpenQuizCreationModal={onOpenQuizCreationModal}
               onOpenGroupCreationModal={onOpenGroupCreationModal}
               onOpenAddCollaboratorModal={onOpenAddCollaboratorModal}
      />
      <div className='main-container'>
        <Outlet context={{
          activeView, saveStatus, setSaveStatus, isNoteModalOpen, closeNoteModal, isQuizCreationModalOpen,
          closeQuizCreationModal, isGroupCreationModalOpen, closeGroupCreationModal, isAddCollaboratorModelOpen, closeAddCollaboratorModal
        }}/>
      </div>
      <BottomBar saveStatus={saveStatus}/>
    </div>
  )
}