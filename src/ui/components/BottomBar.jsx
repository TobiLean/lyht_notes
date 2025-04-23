import React from "react";
import SignOut from "./SignOut.jsx";

export default function BottomBar({ saveStatus }) {
  console.log(saveStatus)

  return (
    <div className="bottombar">
      <div className="bottom-bar-save-status">{saveStatus}</div>
      <SignOut/>
    </div>
  )
}