import './App.css';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginCard from './LoginCard/LoginCard';
import RegisterCard from './registerCard/RegisterCard';
import InputCSV from './InputCsv/InputCSV';
import PlacementTable from './PlacementTable/PlacementTable';

function App() {

  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [placementData, setPlacementData] = useState(null);

  return (

    <BrowserRouter>

      <header></header>

      <Routes>
      <Route path="/" element={<LoginCard users={users} setCurrentUser={setCurrentUser} />} />
      <Route path="/register" element={<RegisterCard users={users} setUsers={setUsers} />} />
      <Route path="/inputCSV" element={<InputCSV setPlacementData={setPlacementData}/>} />
      <Route path="/placement-table" element={<PlacementTable placementData={placementData} />} />
      </Routes>

    </BrowserRouter>

  );
}

export default App;