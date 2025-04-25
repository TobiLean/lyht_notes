import React from 'react';
import LyhtIcon from "./LyhtIcon.jsx";
import {X, Maximize, Minus} from 'lucide-react'

const CustomTitleBar = () => {

  // Function to minimize the application
  const handleMinimize = () => {
    window.lyhtAPI.minimizeWindow();
  };

  // Function to maximize the application
  const handleMaximize = () => {
    window.lyhtAPI.maximizeWindow();
  };

  // Function to close the application
  const handleClose = () => {
    window.lyhtAPI.closeWindow();
  };

  return (
    <div className="title-bar">
      <div className="title-bar-left">
        <div className="title-bar-lyht-icon">
          <LyhtIcon />
        </div>
        Lyht Notes
      </div>
      <div className="title-bar-right">
        <button className="window-action-button window-minimize" onClick={handleMinimize}><Minus /></button>
        <button className="window-action-button window-maximize" onClick={handleMaximize}><Maximize /></button>
        <button className="window-action-button window-close" onClick={handleClose}><X /></button>
      </div>
    </div>
  );
};

export default CustomTitleBar;