import React, {useContext} from "react";
import {AuthContext} from "../../utils/AuthContext.jsx";
import SignOut from "./SignOut.jsx";

// Bottom bar component
export default function BottomBar({ saveStatus }) {
  console.log(saveStatus)
  // Get logged-in user email from Auth Context
  const { authContextUserEmail } = useContext(AuthContext);

  return (
    <div className="bottombar">
      <div className="bottom-bar-save-status">{saveStatus}</div>
      <div className="email-bottombar-btn">
        {authContextUserEmail}
      </div>
      {/*Sign out component*/}
      <SignOut/>
    </div>
  )
}