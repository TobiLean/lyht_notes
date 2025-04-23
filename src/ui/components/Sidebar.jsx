import React from "react"
import PrimarySidebar from "./PrimarySidebar.jsx";
import DynamicSidebar from "./DynamicSidebar.jsx";
import {NavLink} from 'react-router-dom'

export default function Sidebar({activeView, onNavigate, onOpenNoteModal, onOpenQuizCreationModal, onOpenGroupCreationModal}) {
  return (
    <div className="sidebar">
      <PrimarySidebar activeView={activeView}/>
      <DynamicSidebar activeView={activeView} onOpenNoteModal={onOpenNoteModal}
                      onOpenQuizCreationModal={onOpenQuizCreationModal}
                      onOpenGroupCreationModal={onOpenGroupCreationModal}
      />
    </div>
  )
}