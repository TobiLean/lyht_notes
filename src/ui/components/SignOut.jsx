import React from 'react';
import supabaseClient from "../../utils/supabaseClient.js";
import {useNavigate} from "react-router-dom";
import Login from "./LogOutIcon.jsx";
import LogOutIcon from "./LogOutIcon.jsx";

function SignOut() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const {error} = await supabaseClient.auth.signOut();

    if (error) {
      console.error('Error signing out:', error.message);
      return;
    }

    navigate('/login', {replace: true})
  };

  return(
    <button className="signout-button" onClick={handleSignOut}>
      <LogOutIcon />
    </button>
  )
}

export default SignOut;