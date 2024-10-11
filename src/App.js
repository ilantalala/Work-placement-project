import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginCard from './LoginCard/LoginCard';
import RegisterCard from './registerCard/RegisterCard';
import InputCSV from './InputCsv/InputCSV';
import PlacementTable from './PlacementTable/PlacementTable';
import WorkerRequirementsChart from './WorkerRequirementsChart/WorkerRequirementsChart';
import Logout from './Logout/Logout';
import { FileManager } from './InputCsv/FileManager';

function App() {
  const [users, setUsers] = useState([]);
  const [CurrentUser, setCurrentUser] = useState(null);
  const [placementData, setPlacementData] = useState(null);
  const [workerRequirementsData, setWorkerRequirementsData] = useState(null);
 console.log("CurrentUser in App component:", CurrentUser);

  useEffect(()=> {
    const username = localStorage.getItem('username');
    if (username) {
      setCurrentUser(username);
    } 
  }, [])
  return (

    <BrowserRouter>
      <Logout cleanCurrentUser={()=> setCurrentUser(null)} currentUser={CurrentUser} />
      <header></header>
      <Routes>
      <Route path="/" element={<LoginCard setCurrentUser={setCurrentUser} CurrentUser={CurrentUser} />} />
      <Route path="/register" element={<RegisterCard users={users} setUsers={setUsers} />} />
      <Route path="/inputCSV" element={<FileManager currentUser={CurrentUser} />} />

      <Route path="/oldInputCsv" element={<InputCSV  setPlacementData={setPlacementData} setWorkerRequirsData2={setWorkerRequirementsData} CurrentUser={CurrentUser}/>} />
      <Route path="/placement-table" element={<PlacementTable placementData={placementData} workerRequirementsData={workerRequirementsData} />} />
      <Route path="/worker-requirements-chart" element={<WorkerRequirementsChart workerRequirementsData={workerRequirementsData} placementData={placementData} />} />
      </Routes>
      
    </BrowserRouter>

  );
}

export default App;