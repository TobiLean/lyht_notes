// src/contexts/AuthContext.jsx
import React, {createContext, useState, useEffect} from 'react';
import supabaseClient from './supabaseClient.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
  const [authContextUser, setUser] = useState(null);
  const [authContextUserId, setUserId] = useState(null);
  const [authContextUserEmail, setUserEmail] = useState(null);
  const [authContextLoading, setLoading] = useState(true);
  const [authContextProfileNames, setAuthContextProfileNames] = useState({});

  // This function uses getAuth() to fetch the current user details directly.
  const getCurrentUser = async () => {
    const {data, error} = await supabaseClient.auth.getUser();
    if (error) {
      console.error('Error fetching auth details:', error);
    }

    const {data: profileData, profileError} = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', data?.user.id)
      .limit(1)
      .single();

    console.log("Auth Context profile: ", profileData);

    if(profileError) {
      console.error('Error fetching profile details:', profileError);
    }

    const profileNames = {
      first_name: profileData.first_name,
      last_name: profileData.last_name,
    }
    console.log("From AuthContext", data);
    setUser(data?.user || null);
    setUserId(data?.user.id || null);
    setUserEmail(data?.user.user_metadata.email || null);
    setLoading(false);
    setAuthContextProfileNames(profileNames);
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{authContextUser, authContextUserId, authContextUserEmail, authContextLoading, authContextProfileNames}}>
      {children}
    </AuthContext.Provider>
  );
};