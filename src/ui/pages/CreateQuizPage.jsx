// import React from 'react';
// import supabaseClient from "../../utils/supabaseClient.js";
//
// function CreateQuizPage() {
//   const [title, setTitle] = React.useState('');
//   const [questions, setQuestions] = React.useState(
//     [
//       {
//         text: '',
//         options: ['', ''],
//         correct_option: 0
//       },
//     ]
//   );
//
//   // Add a new (empty) question
//   const addQuestion = () => {
//     setQuestions([
//       ...questions,
//       { text: '', options: ['', ''], correct_option: 0 },
//     ]);
//   };
//
//   // Update a specific question field
//   const updateQuestions = (index, field, value) => {
//     const updated = [...questions];
//     updated[index][field] = value;
//     setQuestions(updated);
//   };
//
//   // Handle quiz creation and insertion into supabase
//   const handleSubmit = () => {
//     if (!title.trim() || !questions.some((q) =>
//       !q.text.trim() || q.options.some(o => !o.trim())
//     )) {
//       alert('Please fill out all fields.');
//       return;
//     }
//
//     // const newQuiz = {
//     //   title,
//     //   questions,
//     // };
//
//     // Insert new quiz into database
//     const { data, error } = await supabaseClient
//       .from('quizzes')
//       .insert(newQuiz);
//
//     if(error) {
//       console.error('Error creating quiz:', error);
//     }
//   }
//
//   return ();
// }