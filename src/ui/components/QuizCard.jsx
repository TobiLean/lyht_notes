
import React from 'react';
import { Trash, BookOpen } from 'lucide-react';

const QuizCard = ({ quiz, onDelete, onOpen }) => {
  return (
    <div className="quiz-card">
      <div className="quiz-card-header">
        <h3 className="quiz-title">{quiz.title}</h3>
        <div className="quiz-meta">
          <span>{quiz.questions.length} questions</span>
          <span>By {quiz.author}</span>
        </div>
      </div>
      <div className="quiz-card-body">
        <p>{quiz.description}</p>
      </div>
      <div className="quiz-card-footer">
        <button className="quiz-open-button cool-button" onClick={() => onOpen(quiz)}>
          <BookOpen size={16} />
          Open
        </button>
        {onDelete && (
          <button className="quiz-delete-button cool-button" onClick={() => onDelete(quiz.id)}>
            <Trash size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizCard;
