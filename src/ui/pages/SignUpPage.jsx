import React from 'react';
import {Navigate, useNavigate, redirect, NavLink} from "react-router-dom";
import {useEffect, useState} from "react";
import supabaseClient from '../../utils/supabaseClient.js';

import './SignUpPage.css'


function SignUpPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [birthday, setBirthday] = React.useState('');
  const [teacher, setTeacher] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabaseClient.auth.getSession().then(({data: {session}}) => {
      if (session) {
        // If the user is already signed in, redirect them away from the sign-up page.
        navigate('/notes');
      }
    });
  }, [navigate]);


  async function updateProfiles(userId, userEmail) {
    try {
      const { error } = await supabaseClient
        .from('profiles')
        .upsert(
          {
            user_id: userId, // Primary key
            email: userEmail,
            first_name: firstName,
            last_name: lastName,
            birthday: birthday,
            teacher: teacher,
          },
          { onConflict: 'user_id' } // Avoids duplicate entries
        );

      if (error) {
        console.error('Error updating profiles:', error.message);
        setMessage(`Error updating profiles: ${error.message}`);
      } else {
        console.log('Profile updated successfully.');
      }
    } catch (err) {
      console.error('Unexpected error:', err.message);
      setMessage('Unexpected error occurred.');
    }
  }

  async function signUpNewUser(e) {
    e.preventDefault();

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters long!');
      return;
    }

    //Validate Password match
    if (password !== confirmPassword) {
      setMessage('Passwords do not match!')
      return;
    }

    //Calling Supabase's auth api
    const {data, error} = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: '/login',
      },
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Signup successful');
      navigate('http://localhost:5123/login');
    }
  }

  supabaseClient.auth.onAuthStateChange( async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      const userId = session.user.id;
      await updateProfiles(userId, session.user.email);
    }
  })

  return (
    <div className="signup-page">
      <div className="signup-page-content">
        <h2 className="signup-title">Sign Up</h2>
        <p className="signup-welcome">
          Create an account and begin your Lyht Notes experience
        </p>
        <form className="signup-form" onSubmit={signUpNewUser}>
          <div className="names-signup">
            <div className="firstname-signup signup-input-section">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="lastname-signup signup-input-section">
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="email-signup signup-input-section">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="password-signup signup-input-section">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="confirm-password-signup signup-input-section">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="date-signup signup-input-section">
            <input
              type="date"
              placeholder="Birthday"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              required
            />
          </div>
          <div className="teacher-signup signup-input-section">
            <label>
              Are you a teacher?
              <input
                type="checkbox"
                checked={teacher}
                onChange={(e) => setTeacher(e.target.checked)}
              />
            </label>
          </div>
          <button type="submit">Create an account</button>
          <NavLink className="to-signup" to="/login">Already have an account? Log in!</NavLink>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>

  )

}

export default SignUpPage;