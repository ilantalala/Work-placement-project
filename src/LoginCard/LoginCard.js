import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from './login&register.png';
import './LoginCard.css'


function LoginCard({setCurrentUser,CurrentUser}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!username || !password || !companyName) {
      setErrorMessage('Please fill all fields.');
    } else {
      try {
        const response = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password, companyName }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.token);
          setCurrentUser(username);
          navigate('/inputCSV');
        } else {
          const data = await response.json();
          setErrorMessage(data.message);
        }
      } catch (error) {
        console.error('Error logging in:', error);
        setErrorMessage('An error occurred while logging in. Please try again.');
      }
    }
  };

  return (
    <div className="backgroundR">
      <div className="container">
      <div className="form">
            {errorMessage && <p>{errorMessage}</p>}
            <form onSubmit={handleSubmit} >
              <h1>Login</h1>
              <div className="form-group">
                <input type="text" className="form-control" placeholder="Enter username..." value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <br />
              <div className="form-group">
                <input type="password" className="form-control" placeholder="Enter password..." value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <br />
              <div className="form-group">
                <input type="text" className="form-control" placeholder="Enter company name..." value={companyName} onChange={(e) => setCompanyName(e.target.value)} /> {/* Add input field for company name */}
              </div>
              <br />
              <button type="submit" className="btn btn-primary">Login</button>
              <br /><br />
              <div>Not registered? <Link to="/register">Click here</Link> to register</div>
            </form>
          </div>
          </div>
        </div>
  );  
}

export default LoginCard;