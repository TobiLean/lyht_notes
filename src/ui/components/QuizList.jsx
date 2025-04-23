import React from 'react';
import QuizCard from './QuizCard';

const QuizList = ({ quizzes, onDelete, onOpen, isUserOwned }) => {
  if (quizzes.length === 0) {
    return (
      <div className="empty-state">
        <p>No quizzes found.</p>
      </div>
    );
  }

  return (
    <div className="quiz-list">
      {quizzes.map((quiz) => (
        <QuizCard
          key={quiz.id}
          quiz={quiz}
          onDelete={isUserOwned ? onDelete : undefined}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
};

export default QuizList;