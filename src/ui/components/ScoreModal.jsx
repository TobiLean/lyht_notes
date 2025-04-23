import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import supabaseClient from "../../utils/supabaseClient.js";

const ScoreModal = ({ isOpen, onClose, score }) => {
  if(isOpen) {
    console.log("Trying to open score modal...")
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Score">
      <div className="score-modal">
        {score}
      </div>
    </Modal>
  );
};

export default ScoreModal;