import React, {useState, useEffect} from 'react';
import Modal from './Modal';
import supabaseClient from "../../utils/supabaseClient.js";

const CreateQuizModal = ({isOpen, onClose, userId}) => {
  console.log('Create QuizModal');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizAuthor, setQuizAuthor] = useState('');
  const [questions, setQuestions] = useState([
    {text: '', correct_index: 0, options: ['', '', '', '']}
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentUserDetails = async () => {
      console.log('getCurrentUserDetails user id: ', userId);

      const {data, error} = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .single();

      const profile = `${data.first_name} ${data.last_name}`

      if (error) {
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        throw new Error('No profile details found for the user.');
      }

      console.log("Not from set, the user's first and last names are: ", profile);
      setQuizAuthor(profile);
    }

    if (isOpen) {
      getCurrentUserDetails();
    }
  }, [isOpen])

  const handleSave = async () => {
    console.log("Trying to save quiz...");
    if (!quizTitle.trim() || !quizDescription.trim() || questions.length === 0) {
      alert('Please provide a title, description and at least one question.');
      return;
    }

    if (questions.some((q) => !q.text.trim() || q.options.some((o) => !o.trim()))) {
      alert('Please fill in all question and option fields.');
      return;
    }

    setLoading(true);

    try {

      console.log(quizAuthor);
      //Save quizzes to Supabase
      const {error} = await supabaseClient
        .from('quizzes')
        .insert({
          title: quizTitle,
          description: quizDescription,
          author: quizAuthor,
          creator_id: userId,
          questions,
        });

      if (error) {
        console.error('Error saving notes:', error.message);
        alert('Failed to save the quiz, please try again later');
      } else {
        alert('Quiz created successfully.');
        setQuizTitle('');
        setQuizDescription('');
        setQuestions([
          {text: '', correct_index: 0, options: ['', '', '', '']}
        ])
        onClose();
      }
    } catch (err) {
      console.error('Unexpected error saving notes:', err);
      alert('An unexpected error occurred, please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    if (field === 'text') {
      updatedQuestions[index].text = value;
    } else if (field === 'correct_index') {
      updatedQuestions[index].correct_index = parseInt(value, 10);
    } else if (field.startsWith('option')) {
      const optionIndex = parseInt(field.split('-')[1], 10);
      updatedQuestions[index].options[optionIndex] = value;
    }
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, {text: '', correct_index: 0, options: ['', '', '', '']}]);
  }

  const removeQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  }

  const footer = (
    <>
      <button className="btn-cancel" onClick={onClose} disabled={!loading}>
        Cancel
      </button>
      <button
        className="btn-save"
        onClick={handleSave}
        disabled={!quizTitle.trim() || !quizDescription.trim()}
      >
        Save
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Quiz" footer={footer}>
      <div className="create-quiz-form">
        <label htmlFor="quizTitle">Title:</label>
        <input
          type="text"
          id="quizTitle"
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          placeholder="Enter quiz title"
        />

        <label htmlFor="quizDescription">Description:</label>
        <textarea
          id="quizDescription"
          value={quizDescription}
          onChange={(e) => setQuizDescription(e.target.value)}
          placeholder="Enter quiz description"
        />

        <h4>Questions:</h4>
        {questions.map((question, index) => (
          <div key={index} className="question-item">
            <label>Question {index + 1}:</label>
            <input
              type="text"
              value={question.text}
              onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
              placeholder="Enter question text"
            />

            <label>Options:</label>
            {question.options.map((option, i) => (
              <input
                key={i}
                type="text"
                value={option}
                onChange={(e) => handleQuestionChange(index, `option-${i}`, e.target.value)}
                placeholder={`Option ${i + 1}`}
              />
            ))}

            <label>Correct Answer:</label>
            <select
              value={question.correct_index}
              onChange={(e) => handleQuestionChange(index, 'correct_index', e.target.value)}
            >
              {question.options.map((_, i) => (
                <option key={i} value={i}>
                  Option {i + 1}
                </option>
              ))}
            </select>

            <button onClick={() => removeQuestion(index)} className="btn-remove">
              Remove Question
            </button>
          </div>
        ))}

        <button onClick={addQuestion} className="btn-add">
          Add Question
        </button>
      </div>
    </Modal>
  );
};

export default CreateQuizModal;