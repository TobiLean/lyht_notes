import React from "react"
import PrimarySidebar from "./PrimarySidebar.jsx";
import DynamicSidebar from "./DynamicSidebar.jsx";

export default function Sidebar({
                                  activeView,
                                  onNavigate,
                                  onOpenNoteModal,
                                  onOpenQuizCreationModal,
                                  onOpenGroupCreationModal,
                                  onOpenAddCollaboratorModal,
                                  setCurrentNoteData,
                                }) {
  return (
    <div className="sidebar">
      <PrimarySidebar activeView={activeView}/>
      <DynamicSidebar activeView={activeView} onOpenNoteModal={onOpenNoteModal}
                      onOpenQuizCreationModal={onOpenQuizCreationModal}
                      onOpenGroupCreationModal={onOpenGroupCreationModal}
                      onOpenAddCollaboratorModal={onOpenAddCollaboratorModal}
                      setCurrentNoteData={setCurrentNoteData}
      />
    </div>
  )
}