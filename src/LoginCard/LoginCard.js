import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


function LoginCard({ users, setCurrentUser }) {
  users=[{username:"ilan",password:"12345678"}]
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setErrorMessage('Please fill all fields.');
    } else {
      try {
        const response = await fetch('http://localhost:5000/api/login', { // Change this URL
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
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

      <div className="container">
        <h1>Wellcome!</h1>

        {errorMessage && <p>{errorMessage}</p>}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <input type="text" className="form-control" placeholder="Enter username..." id="username"
                   value={username} onChange={(e) => setUsername(e.target.value)}></input>
          </div>

          <br></br>

          <div className="form-group">
            <input type="password" className="form-control" placeholder="Enter password..." id="password"
                   value={password} onChange={(e) => setPassword(e.target.value)}></input>
          </div>

          <br></br>

          <button type="submit" className="btn btn-primary">Login</button>

          <br></br><br></br>
          <div>Not registered? <Link to="/register">Click here</Link> to register</div>

        </form>

      </div>
  );
}

export default LoginCard;