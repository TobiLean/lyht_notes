import React, {useContext} from "react";
import {AuthContext} from "../../utils/AuthContext.jsx";
import SignOut from "./SignOut.jsx";

export default function BottomBar({ saveStatus }) {
  console.log(saveStatus)
  const { authContextUserEmail } = useContext(AuthContext);

  return (
    <div className="bottombar">
      <div className="bottom-bar-save-status">{saveStatus}</div>
      <div className="email-bottombar-btn">
        {authContextUserEmail}
      </div>
      <SignOut/>
    </div>
  )
}