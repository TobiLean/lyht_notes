import React, {useEffect, useState} from "react"
import {Outlet, useLocation} from "react-router-dom";
import CustomTitleBar from "./CustomTitleBar.jsx";
import Sidebar from "./Sidebar";
import PrimarySidebar from "./PrimarySidebar.jsx";
import DynamicSidebar from "./DynamicSidebar.jsx";
import BottomBar from "./BottomBar.jsx";
import supabaseClient from "../../utils/supabaseClient.js";

export default function Layout() {

  const location = useLocation();
  const activeView = (location.pathname.split('/')[1] || '');
  const [saveStatus, setSaveStatus] = useState('');
  const [isNoteModalOpen, setNoteModalOpen] = useState(false);
  const [isQuizCreationModalOpen, setQuizCreationModalOpen] = useState(false);
  const [isGroupCreationModalOpen, setGroupCreationModalOpen] = useState(false);

  const openNoteModal = () => setNoteModalOpen(true);
  const onOpenQuizCreationModal = () => setQuizCreationModalOpen(true);
  const onOpenGroupCreationModal = () => setGroupCreationModalOpen(true);
  const closeNoteModal = () => setNoteModalOpen(false);
  const closeQuizCreationModal = () => setQuizCreationModalOpen(false);
  const closeGroupCreationModal = () => setGroupCreationModalOpen(false);


  const handleNewNote = () => {
    console.log('New note action triggered!');
  }

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
      />
      <div className='main-container'>
        <Outlet context={{
          saveStatus, setSaveStatus, isNoteModalOpen, closeNoteModal, isQuizCreationModalOpen,
          closeQuizCreationModal, isGroupCreationModalOpen, closeGroupCreationModal
        }}/>
      </div>
      <BottomBar saveStatus={saveStatus}/>
    </div>
  )
}