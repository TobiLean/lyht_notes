import React, { useState } from "react";
import { Popconfirm, Button } from "antd";

// Wrapper using antd's Popconfirm component for confirming button actions
const ConfirmWrapper = ({ title, description, okText = "Yes", cancelText = "No", placement = "topRight", children, onConfirm }) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => setOpen(true);
  const handleCancel = () => setOpen(false);
  const handleConfirm = async () => {
    await onConfirm(); // Execute action inside wrapper
    setOpen(false);
  };

  return (
    <Popconfirm
      title={title}
      description={description}
      open={open}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      okText={okText}
      cancelText={cancelText}
      placement={placement}
    >
      <span onClick={handleClick}>{children}</span> {/* Wraps any button passed inside */}
    </Popconfirm>
  );
};

export default ConfirmWrapper;