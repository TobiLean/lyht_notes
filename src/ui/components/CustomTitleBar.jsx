import React from 'react';

const CustomTitleBar = () => {
  const handleMinimize = () => {
    window.lyhtAPI.minimizeWindow();
  };

  const handleMaximize = () => {
    window.lyhtAPI.maximizeWindow();
  };

  const handleClose = () => {
    window.lyhtAPI.closeWindow();
  };

  return (
    <div className="title-bar">
      <button className="window-action-button window-minimize" onClick={handleMinimize}>Minimize</button>
      <button className="window-action-button window-maximize" onClick={handleMaximize}>Maximize</button>
      <button className="window-action-button window-close" onClick={handleClose}>Close</button>
    </div>
  );
};

export default CustomTitleBar;