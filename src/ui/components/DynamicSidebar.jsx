import React, {useEffect, useState} from "react"
import {NavLink} from 'react-router-dom'
import supabaseClient from "../../utils/supabaseClient.js";
import TagList from "./TagList"
import GroupList from "./GroupList"

// Component to render dynamic sidebar, with content changing depending on page navigation
export default function DynamicSidebar({
                                         activeView,
                                         onOpenNoteModal,
                                         onOpenQuizCreationModal,
                                         onOpenGroupCreationModal,
                                         onOpenAddCollaboratorModal,
                                         setCurrentNoteData
                                       }) {
  console.log('DynamicSidebar rendering, activeView:', activeView);
  const [notesList, setNotesList] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  const [userId, setUserId] = useState('');

  // Get user Id on render
  useEffect(() => {
    const getUserId = async () => {
      const {data: {user}, error} = await supabaseClient.auth.getUser();
      if (error || !user) {
        console.log('Failed to get user', error?.message || 'No user found.');
        return;
      }
      setUserId(user.id);
      console.log('User id set in dynamic sidebar: ', user.id);
    }

    getUserId();
  }, [])

  // Check if dynamic sidebar is mounted and rendered for testing
  useEffect(() => {
    console.log('DynamicSidebar mounted');

    return () => {
      console.log('DynamicSidebar unmounted');
    };
  }, []);

  // Log notes list when it is ready
  useEffect(() => {
    console.log('notesList state updated:', notesList);
  }, [notesList]);

  // Log tags list when it is ready
  useEffect(() => {
    console.log('tagsList state updated:', tagsList);
  }, [tagsList]);

  // Effect to fetch notes and tags when active view and userId change
  useEffect(() => {
    console.log('useEffect triggered, activeView:', activeView);

    // Only fetch if current page is notes
    if (activeView === 'notes' && userId) {
      try {
        fetchNotes();
        console.log('After fetchNotes call');
        fetchTags();
      } catch (error) {
        console.error('Error calling fetch functions:', error);
      }
    }
  }, [activeView, userId]);

  // Get all notes for user
  const fetchNotes = async () => {
    console.log('fetchNotes is executing...');
    if (!userId) {
      return;
    }

    // Get all notes user created and notes they are shared
    const {data: notes, error: noteError} = await supabaseClient
      .from("notes")
      .select("id, tag_id, title, updated_at, collaborators")
      .or(`user_id.eq.${userId}, collaborators.ilike.%${userId}%`) // Checks if userId exists in text field
      .order("updated_at", {ascending: false});

    console.log("Fetched notes from Supabase:", notes);

    if (noteError) {
      console.error("Failed to fetch notes for user:", userId, "Error:", noteError.message);
    } else {
      setNotesList(notes || []);
      console.log("Accessible Notes:", notesList);
    }
  }

  // Function to get all user tags
  const fetchTags = async () => {
    console.log('fetchTags is executing...');
    if (!userId) return;

    const {data: tags, error: tagError} = await supabaseClient
      .from('tags')
      .select('tag_id, user_id, name, color')
      .eq('user_id', userId)

    console.log('Fetched tags from Supabase:', tags);

    if (tagError) {
      console.error('Failed to fetch tags for user:', userId, 'Error:', tagError.message);
    } else {
      setTagsList(tags)
      console.log('These are the tags: ', tagsList)
    }
  }

  if (activeView === 'notes') {
    return (
      <div className="dynamic-sidebar">
        <button
          className="dynamic-sidebar-button-style-1"
          onClick={onOpenNoteModal}
        >
          Create New Note
        </button>
        <button
          className="dynamic-sidebar-button-style-1"
          onClick={onOpenAddCollaboratorModal}
        >
          Add Collaborator
        </button>
        <TagList tags={tagsList} notes={notesList} setCurrentNoteData={setCurrentNoteData} />
      </div>
    )
  } else if (activeView === 'groups') {
    return (
      <div className="dynamic-sidebar">
        <div className="dynamic-sidebar-list">
          <div className="groups-sidebar-list-item dynamic-sidebar-li">
            <button
              className="dynamic-sidebar-button-style-1"
              onClick={onOpenGroupCreationModal}
            >
              Create Group
            </button>
          </div>
          <GroupList userId={userId}/>
        </div>
      </div>
    )
  } else if (activeView === 'quizzes') {
    return (
      <div className="dynamic-sidebar">
        <ul className="dynamic-sidebar-list">
          <li className="quiz-sidebar-list-item dynamic-sidebar-li">
            <button
              className="dynamic-sidebar-button-style-1"
              onClick={onOpenQuizCreationModal}
            >
              Create Quiz
            </button>
          </li>

          <li className="quiz-sidebar-list-item dynamic-sidebar-li">
            <NavLink
              to='/quizzes'
            >
              <button>
                Dashboard
              </button>
            </NavLink>
          </li>
        </ul>
      </div>
    )
  }
}