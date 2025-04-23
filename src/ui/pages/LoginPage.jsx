import React, {useState} from 'react';
import {useNavigate, NavLink} from 'react-router-dom';
import supabaseClient from '../../utils/supabaseClient.js';
import './LoginPage.css';

// Importing assets
import bgImg from '../assets/backgrounds/login_bg.jpg'
import CustomTitleBar from "../components/CustomTitleBar.jsx";

function LoginPage({setIsLoggedIn}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage('Please fill in both fields.');
      console.log(message);
      return;
    }

    const {error} = await supabaseClient.auth.signInWithPassword({email, password});
    if (error) {
      setMessage('Error logging in: ' + error.message);
      console.log(error);
    } else {
      setMessage('Login successful!');
      setIsLoggedIn(true)
      navigate('/'); // Redirect after successful login
    }
  };

  return (
    <div className="login-page">
      <CustomTitleBar />
      <div className="login-page-content">
        <div className="login-fun-card">
          <h2 className="login-fun-card-title">
            Lyht Notes
          </h2>
          <p className="login-fun-card-text">
            Sign up and change the <br/> way you collaborate,<br/>
            take notes <br/>and facilitate the <br/>perfect lectures!
          </p>
          {/*<img src={funcardImg} alt="" className="login-fun-card-image"/>*/}
        </div>
        <div className="login-form-container">
          <h2 className="page-title">Login</h2>
          <p className="page-welcome">Welcome back to your favourite app</p>
          <form className="login-form" onSubmit={handleLogin}>
            <div className="email-login login-input-section">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="password-login login-input-section">
              <label className="password-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="submit-button" type="submit">Login</button>
            <NavLink className="to-signup" to="/signup">Don't have an account? Create One!</NavLink>
          </form>
          {message && <p>{message}</p>}
        </div>
      </div>
      <img src={bgImg} alt="" className="login-bg-image"/>
    </div>
  );
}

export default LoginPage;