// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import supabaseClient from './supabaseClient.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authContextUser, setUser] = useState(null);
  const [authContextUserId, setUserId] = useState(null);
  const [authContextUserEmail, setUserEmail] = useState(null);
  const [authContextLoading, setLoading] = useState(true);

  // This function uses getAuth() to fetch the current user details directly.
  const getCurrentUser = async () => {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error) {
      console.error('Error fetching auth details:', error);
    }
    console.log("From AuthContext", data);
    setUser(data?.user || null);
    setUserId(data?.user.id || null);
    setUserEmail(data?.user.user_metadata.email || null);
    setLoading(false);
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  return (
    <AuthContext.Provider value={{ authContextUser, authContextUserId, authContextUserEmail, authContextLoading }}>
      {children}
    </AuthContext.Provider>
  );
};