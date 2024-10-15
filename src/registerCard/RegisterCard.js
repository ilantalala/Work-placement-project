import "./RegisterCard.css"
import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logoImg from './login&register.png';

function RegisterCard({ users, setUsers }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform validation checks
    if (!username || !password || !confirmPassword || !displayName || !companyName) {
      setErrorMessage('Please fill all the fields.');
    } else if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
    } else if (password.length < 8) {
      setErrorMessage('Password should be at least 8 characters long.');
    } else if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      setErrorMessage('Password should contain both letters and digits.');
    } else {
      try {
        const response = await axios.post('http://localhost:5000/api/register', {
          username,
          password,
          displayName,
          companyName
        });

        if (response.status === 200) {
          // Registration successful, redirect to login screen
          navigate('/');
        } else {
          // Registration failed, display error message
          setErrorMessage(response.data.message || 'Registration failed.');
        }
      } catch (error) {
        console.error('Error registering user:', error);
        setErrorMessage(error?.response?.data?.message || 'An error occurred while registering. Please try again.');
      }
    }
  };


  return (
    <div className="backgroundR">
      <div className="container">
      <div className="form">
            {errorMessage && <p>{errorMessage}</p>}
            <form onSubmit={handleSubmit} >
              <h1>Register</h1>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input type="text" placeholder="required field..." className="form-control" id="username" value={username} onChange={(e) => setUsername(e.target.value)}></input>
              </div>
              <br />
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" className="form-control" id="password" placeholder="at least 8 characters long and both letters and digits..." value={password} onChange={(e) => setPassword(e.target.value)}></input>
              </div>
              <br />
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input type="password" className="form-control" id="confirmPassword" placeholder="enter the exact password again..." value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}></input>
              </div>
              <br />
              <div className="form-group">
                <label htmlFor="displayName">Display name</label>
                <input type="text" placeholder="required field..." className="form-control" id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)}></input>
              </div>
              <br />
              <div className="form-group">
                <label htmlFor="companyName">Company name</label>
                <input type="text" placeholder="required field..." className="form-control" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)}></input>
              </div>
              <br />
              <button type="submit" className="btn btn-primary">Register</button>
              <br /><br />
              <div>Already registered? <Link to="/">Click here</Link> to login</div>
            </form>
            </div>
          </div>
        </div>
  );  
  
}

export default RegisterCard;
