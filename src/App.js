import './App.css';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginCard from './LoginCard/LoginCard';
import RegisterCard from './registerCard/RegisterCard';
import InputCSV from './InputCsv/InputCSV';
import PlacementTable from './PlacementTable/PlacementTable';
import WorkerRequirementsChart from './WorkerRequirementsChart/WorkerRequirementsChart';

function App() {

  const [users, setUsers] = useState([]);
  const [CurrentUser, setCurrentUser] = useState(null);
  const [placementData, setPlacementData] = useState(null);
  const [workerRequirementsData, setWorkerRequirementsData] = useState(null);
 console.log("CurrentUser in App component:", CurrentUser); // Added console log

  return (

    <BrowserRouter>

      <header></header>

      <Routes>
      <Route path="/" element={<LoginCard setCurrentUser={setCurrentUser} CurrentUser={CurrentUser} />} />
      <Route path="/register" element={<RegisterCard users={users} setUsers={setUsers} />} />
      <Route path="/inputCSV" element={<InputCSV setPlacementData={setPlacementData} setWorkerRequirementsData={setWorkerRequirementsData} CurrentUser={CurrentUser}/>} />
      <Route path="/placement-table" element={<PlacementTable placementData={placementData} />} />
      <Route path="/worker-requirements-chart" element={<WorkerRequirementsChart workerRequirementsData={workerRequirementsData} placementData={placementData} />} />
      </Routes>
      
    </BrowserRouter>

  );
}

export default App;