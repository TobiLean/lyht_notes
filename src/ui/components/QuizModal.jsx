import React, {useState} from 'react';
import {X, ArrowRight, ArrowLeft} from 'lucide-react';
import supabaseClient from "../../utils/supabaseClient.js";
import ScoreModal from "./ScoreModal.jsx";

const QuizModal = ({quiz, isOpen, onClose, userId}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [score, setScore] = useState(null);

  const closeScoreModal = () => {
    setScoreModalOpen(false);
  };


  const currentQuestion = quiz?.questions[currentQuestionIndex];

  const handleOptionSelect = (optionIndex) => {
    setSelectedOptions({
      ...selectedOptions,
      [currentQuestionIndex]: optionIndex,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = async () => {
    console.log(`Calculating score for ${userId} and quiz ${quiz.id}`);
    try {
      //   Get user answers
      const {data: userAnswers, error: userError} = await supabaseClient
        .from('answers')
        .select('user_answers')
        .eq('user_id', userId)
        .eq('quiz_id', quiz.id);
      // .single();

      if (userError) {
        console.error('Error fetching user answers: ', userError);
        return null;
      }

      console.log("User answer last", userAnswers[userAnswers.length - 1]);
      const userSubmittedAnswers = userAnswers[userAnswers.length - 1].user_answers;

      //   Fetch correct answers for question

      const {data: quizData, error: quizDataError} = await supabaseClient
        .from('quizzes')
        .select('id, questions')
        .eq('id', quiz.id)
        .single();

      if (quizDataError) {
        console.error('Error fetching quiz data: ', quizDataError);
        return null;
      }
      const questions = quizData.questions;

      let score = 0;

      // Increment score base on each matching question and correct answer
      userSubmittedAnswers.forEach((answer, index) => {
        if (questions[index] && questions[index].correct_index === answer.answer) {
          score += 1;
        }
      });

      return score;
    } catch (err) {
      console.error('Error calculation score: ', err);
      return null;
    }
  }

  const handleSubmit = async () => {
    const userAnswers = Object.keys(selectedOptions).map((questionIndex) => ({
      questionId: quiz.questions[questionIndex].id,
      answer: selectedOptions[questionIndex],
    }));

    const payload = {
      quiz_id: quiz.id,
      user_id: userId,
      user_answers: userAnswers,
    };

    try {
      const {data, error} = await supabaseClient.from('answers').insert([payload]);
      if (error) {
        console.error('Error submitting answers:', error);
      } else {
        console.log('Answers submitted successfully:', data);
        console.log("Setting score to: ", calculateScore())
        setScore(calculateScore());
        console.log("Setting Score Modal to open...")
        setScoreModalOpen(true);
        if (scoreModalOpen) {
          onClose(); // Close the modal after successful submission
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };


  if (!quiz || !isOpen) {
    return null;
  }

  return (
    <>
      <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">{quiz.title}</h2>
            <button className="close-modal" onClick={onClose}>
              <X size={20}/>
            </button>
          </div>
          <div className="modal-body">
            <div className="question">
              <h3 className="question-text">
                Question {currentQuestionIndex + 1}: {currentQuestion.text}
              </h3>
              <div className="options">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`option ${selectedOptions[currentQuestionIndex] === index ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(index)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              className="cool-button"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft size={16}/>
              Previous
            </button>
            <span>{currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <button
              className={`btn ${currentQuestionIndex === quiz.questions.length - 1 ? 'submit-quiz-btn' : ''}`}
              onClick={currentQuestionIndex === quiz.questions.length - 1 ? handleSubmit : handleNextQuestion}
              // disabled={currentQuestionIndex === quiz.questions.length - 1}
              style={{
                backgroundColor: currentQuestionIndex === quiz.questions.length - 1 ?
                  'var(--positive-button-color)' : 'var(--tertiary-color)',
              }}
            >
              {currentQuestionIndex === quiz.questions.length - 1 ? 'Submit' : 'Next'}
              <ArrowRight size={16}/>
            </button>
          </div>
        </div>
      </div>
      <ScoreModal score={score} isOpen={scoreModalOpen} onClose={closeScoreModal}/>
    </>
  );
};

export default QuizModal;