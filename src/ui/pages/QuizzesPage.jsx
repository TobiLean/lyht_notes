import React, {useState, useEffect} from 'react';
import QuizList from '../components/QuizList';
import QuizModal from '../components/QuizModal';
import {Search} from 'lucide-react';
import './QuizzesPage.css'
import supabaseClient from '../../utils/supabaseClient.js'
import {useOutletContext} from "react-router-dom";
import LinearProgress from "@mui/material/LinearProgress";
import CreateQuizModal from "../components/CreateQuizModal.jsx";

const QuizzesPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quizzes, setQuizzes] = useState([]); // Hold quizzes fetched from Supabase
  const [loading, setLoading] = useState(true); // Tracking data loading
  const [error, setError] = useState(null); // Tracking errors
  const [currentUser, setCurrentUser] = useState(null);

  // Retrieve the context passed from the layout component
  const { isQuizCreationModalOpen, closeQuizCreationModal } = useOutletContext(); // Get modal open/close state

  useEffect(() => {

    // Get the current signed-in user
    const fetchCurrentUser = async () => {
      try {
        const {data: {user}, userError} = await supabaseClient.auth.getUser();
        if (userError) {
          console.log("Error getting user:", userError.message);
          setError('Failed to get user, please try again');
          return;
        }
        setCurrentUser(user);
        console.log("Current user:", user.id);
      } catch (err) {
        console.error("Error fetching current user", err.message);
        setError("An unexpected error occurred. Please try again");
      }
    }

    fetchCurrentUser();
  }, []);

  useEffect(() => {

    // Get all quizzes from database
    const fetchAllQuizzes = async () => {
      try {
        const {data: quizzesData, quizzesError} = await supabaseClient
          .from('quizzes')
          .select('*')

        if (quizzesError) throw new Error(quizzesError.message);

        setLoading(false)
        setQuizzes(quizzesData || []);
        console.log("Fetched Quizzes:", quizzesData);
      } catch (err) {
        console.error("Error fetching quizzes:", err.message);
        setError("Failed to fetch quizzes. Please try again.");
      }
    }

    fetchAllQuizzes();
  }, [])

  // Filter quizzes based on active tab and search query
  const filterQuizzes = () => {
    let filtered = [...quizzes];

    // Filter by tab
    if (activeTab === 'my' && currentUser) {
      filtered = filtered.filter(quiz => quiz.creator_id === currentUser.id);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(quiz =>
          quiz.title.toLowerCase().includes(query)
        // quiz.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  // Delete quiz
  const handleDeleteQuiz = async (quizId) => {
    try {
      console.log("Deleting Quiz with id:", quizId);

      const { error } = await supabaseClient
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) {
        console.error('Error deleting quiz: ', error);
        alert('Failed to delete Quiz, please try again');
      } else {
        alert(`Quiz with ID ${quizId} has been deleted.`);
      }
    } catch (err) {
      console.error('Error deleting Quiz: ', err.message);
      alert('Failed to delete Quiz, please try again');
    }

    console.log(`Deleting quiz with ID: ${quizId}`);
    alert(`Quiz with ID: ${quizId} would be deleted in a real app`);
  };

  // Open the quiz modal
  const handleOpenQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setIsModalOpen(true);
  };

  // Set modalOpen to false to close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const displayedQuizzes = filterQuizzes();

  return (
    <div className="quiz-dashboard">
      <h1>Quiz Dashboard</h1>
      <div className="tabs">
        <div
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Quizzes
        </div>
        <div
          className={`tab ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          My Quizzes
        </div>
      </div>

      <div className="search-container">
        <span className="search-icon"><Search size={18}/></span>
        <input
          type="text"
          placeholder="Search quizzes..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Conditionally render the modal */}
      {isQuizCreationModalOpen && (
        <CreateQuizModal isOpen={isQuizCreationModalOpen} onClose={closeQuizCreationModal} userId={currentUser.id}/>
      )}

      {loading ? (
        <div className="loading">
          <LinearProgress />
        </div>
      ) : (
        <>
          <QuizList
            quizzes={displayedQuizzes}
            onDelete={handleDeleteQuiz}
            onOpen={handleOpenQuiz}
            isUserOwned={activeTab === 'my'}
          />

          <QuizModal
            quiz={selectedQuiz}
            isOpen={isModalOpen}
            onClose={closeModal}
            userId={currentUser.id}
          />
        </>
      )
      }
    </div>
  );
}

export default QuizzesPage;