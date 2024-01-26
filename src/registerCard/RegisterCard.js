import "./RegisterCard.css"
import React, { useState } from "react";
//import {  useNavigate } from 'react-router-dom';


function RegisterCard({ users, setUsers }) {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
 

  //const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Perform validation checks
    if (!username || !password || !confirmPassword || !displayName) {
      setErrorMessage('Please fill all the fields.');
    } else if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
    } else if (password.length < 8) {
      setErrorMessage('Password should be at least 8 characters long.');
    } else if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      setErrorMessage('Password should contain both letters and digits.');
    } else {

      // creates a new user and add him to users
      const newUser = { username: username, password: password, displayName: displayName }
      console.log(newUser);

      setUsers([...users, newUser]);
      console.log(users);

      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setDisplayName('');
      setErrorMessage('');

      // Redirect to login screen
      //navigate('/');
    }
  };


  return (
    <div className="container">
      

        {errorMessage && <p>{errorMessage}</p>}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" placeholder="required field..." className="form-control" id="username"
              value={username} onChange={(e) => setUsername(e.target.value)}></input>
          </div>
          <br></br>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" className="form-control" id="password"
              placeholder="at least 8 characters long and both letters and digits..."
              value={password} onChange={(e) => setPassword(e.target.value)}></input>
          </div>
          <br></br>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input type="password" className="form-control" id="confirmPassword"
              placeholder="enter the exact password again..."
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}></input>
          </div>
          <br></br>

          <div className="form-group">
            <label htmlFor="displayName">Display name</label>
            <input type="text" placeholder="required field..." className="form-control" id="displayName"
              value={displayName} onChange={(e) => setDisplayName(e.target.value)}></input>
          </div>
          <br></br>

          <button type="submit" className="btn btn-primary">Register</button>
          <br></br><br></br>
          
        </form>

    </div>
  );
}

export default RegisterCard;
