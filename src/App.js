import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import LoginCard from './LoginCard/LoginCard';
import RegisterCard from './registerCard/RegisterCard';
import InputCSV from './InputCsv/InputCSV';
import PlacementTable from './PlacementTable/PlacementTable';
import WorkerRequirementsChart from './WorkerRequirementsChart/WorkerRequirementsChart';
import Logout from './Logout/Logout';
import { FileManager } from './InputCsv/FileManager';
import { Button } from '@mui/material';

function App() {
  const [users, setUsers] = useState([]);
  const [CurrentUser, setCurrentUser] = useState(null);
  const [placementData, setPlacementData] = useState(null);
  const [workerRequirementsData, setWorkerRequirementsData] = useState(null);
  const [loading, setLoading] = React.useState(false);
 console.log("CurrentUser in App component:", CurrentUser);

  useEffect(()=> {
    const username = localStorage.getItem('username');
    if (username) {
      setCurrentUser(username);
    } 
  }, [])

  useEffect(()=> {
      if (CurrentUser) {
          setLoading(true);
          axios.get(`http://localhost:5000/api/${CurrentUser}/shifts`)
          .then((response) => {
              console.log("Response table: ", response.data);
              setPlacementData(response.data.data)
          })
          .catch((error)=> {
              console.log("Could not fetch data", error)
          }).finally(()=> {
              setLoading(false);
          })
      }
  }, [CurrentUser])


  return (

    <BrowserRouter>
      <Logout cleanCurrentUser={()=> setCurrentUser(null)} currentUser={CurrentUser} />
        <Button href={"placement-table"} disabled={!CurrentUser}> Go to placement data</Button>
        <Button href={"/"} disabled={!CurrentUser}> Create placement data </Button>
        <Button href={"/worker-requirements-chart"} disabled={!placementData || !CurrentUser }> View chart </Button>

      <header></header>
      <Routes>
      <Route path="/" element={<LoginCard setCurrentUser={setCurrentUser} CurrentUser={CurrentUser} />} />
      <Route path="/register" element={<RegisterCard users={users} setUsers={setUsers} />} />
      <Route path="/inputCSV" element={<FileManager currentUser={CurrentUser} setPlacementData={setPlacementData} />} />

      <Route path="/oldInputCsv" element={<InputCSV  setPlacementData={setPlacementData} setWorkerRequirsData2={setWorkerRequirementsData} CurrentUser={CurrentUser}/>} />
      <Route path="/placement-table" element={<PlacementTable loading={loading} currentUser={CurrentUser} placementData={placementData} workerRequirementsData={workerRequirementsData} />} />
      <Route path="/worker-requirements-chart" element={<WorkerRequirementsChart currentUser={CurrentUser} placementData={placementData} />} />
      </Routes>
      
    </BrowserRouter>

  );
}

export default App;