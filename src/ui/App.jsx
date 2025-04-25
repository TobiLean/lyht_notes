import {useEffect, useState} from 'react'
import Layout from "./components/Layout.jsx";
import NotesPage from "./pages/NotesPage.jsx"
import GroupsPage from "./pages/GroupsPage.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import SignUpPage from "./pages/SignUpPage.jsx";
import AiPage from "./pages/AiPage.jsx";
import QuizzesPage from "./pages/QuizzesPage.jsx";
import {HashRouter, Navigate, Route, Routes} from "react-router-dom";
import { NotificationProvider } from "./components/NotificationProvider.jsx";
import './App.css'

import supabaseClient from "../utils/supabaseClient.js";
import {AuthProvider} from "../utils/AuthContext.jsx";

function ProtectedRoute({isLoggedIn, children}) {
  return isLoggedIn ? children : <Navigate to="/login" replace/>
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for an existing session on mount
  useEffect(() => {
    const getSession = async () => {
      const {data: {session}, error} = await supabaseClient.auth.getSession();
      if (error) {
        console.error("Error getting session: ", error);
      }
      if (session) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    getSession();

    const {data: authListener} = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <NotificationProvider>
      <HashRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn}/>}/>
          <Route path="/signup" element={<SignUpPage/>}/>
          {/* Protected routes */}
          <Route path="/*" element=
            {
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <AuthProvider>
                  <Layout/>
                </AuthProvider>
              </ProtectedRoute>
            }
          >

            {/* Notes routes */}
            <Route path="notes">
              {/* When the user is at "/notes", show a default fallback or redirect */}
              <Route index element={<Navigate to="/notes/00" replace/>}/>
              {/* The note editor receives the note id via the dynamic route parameter */}
              <Route path=":id" element={<NotesPage/>}/>
            </Route>


            {/*<Route index element={<Navigate to="/notes/00" replace/>}/>*/}
            {/*<Route path="notes/:id" element={<NotesPage/>}/>*/}
            <Route path="groups" element={<GroupsPage/>}/>
            <Route path="quizzes" element={<QuizzesPage/>}/>
            <Route path="login" element={<LoginPage/>}/>
          </Route>
        </Routes>
      </HashRouter>
    </NotificationProvider>
  )
}

export default App
