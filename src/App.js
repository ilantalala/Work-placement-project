import './App.css';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginCard from './LoginCard/LoginCard';
import RegisterCard from './registerCard/RegisterCard';
import InputCSV from './InputCsv/InputCSV';

function App() {

  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  return (

    <BrowserRouter>

      <header></header>

      <Routes>
      <Route path="/" element={<LoginCard users={users} setCurrentUser={setCurrentUser} />} />
      <Route path="/register" element={<RegisterCard users={users} setUsers={setUsers} />} />
      <Route path="/inputCSV" element={<InputCSV />} />
      </Routes>

    </BrowserRouter>

  );
}

export default App;