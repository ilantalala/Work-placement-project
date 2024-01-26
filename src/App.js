import './App.css';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import RegisterCard from './registerCard/RegisterCard';

function App() {

  const [users, setUsers] = useState([]);

  return (

    <BrowserRouter>

      <header></header>

      <Routes>
        <Route path="/" element={<RegisterCard users={users} setUsers={setUsers} />} />
      </Routes>

    </BrowserRouter>

  );
}

export default App;