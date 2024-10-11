import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logout from '../Logout/Logout';
import DynamicTable from './DynamicTable';
import './InputCSV.css';
import Papa from 'papaparse';

function InputCSV({ cleanCurrentUser, setPlacementData, setWorkerRequirsData2, CurrentUser }) {
  
  const navigate = useNavigate();
  
  useEffect(() => {
    if (CurrentUser) {
      fetch(`http://localhost:5000/api/${CurrentUser}/get_initial_data`)
      .then((res) => res.json())
      .then((data)=> {
        console.log("data", data)
        const employeeSkill = data.find((item)=> item.type === 'employee_skill');
        if (employeeSkill) {
          setEmployeeSkillData(transformData(employeeSkill?.data));
          setFilesUploadedEmployeeSkill({ employeeSkill: true });}
        
          const workerRequirements = data.find((item)=> item.type === 'worker_requirements');
        if (workerRequirements){
          setWorkerRequirementsData(transformData(workerRequirements?.data));
          setFilesUploadedWorkerRequirements({ workerRequirements: true });} 

        const shiftBasket = data.find((item)=> item.type === 'shift_basket');
        if (shiftBasket) {
          setShiftBasketData(transformData(shiftBasket?.data));
          setFilesUploadedShiftBasket({ shiftBasket: true });}
      
        }).catch((err)=> {
        console.log("Error while trying to get existing user data...", err)
      })
    } else {
      navigate('/')
    }
  }, [CurrentUser]);

  const [notification, setNotification] = useState('');
  const [filesUploadedEmployeeSkill, setFilesUploadedEmployeeSkill] = useState({ employeeSkill: false });
  const [filesUploadedWorkerRequirements, setFilesUploadedWorkerRequirements] = useState({ workerRequirements: false });
  const [filesUploadedShiftBasket, setFilesUploadedShiftBasket] = useState({ shiftBasket: false });

  const [employeeSkillData, setEmployeeSkillData] = useState([]);
  const [workerRequirementsData, setWorkerRequirementsData] = useState([]);
  const [shiftBasketData, setShiftBasketData] = useState([]);

  const requiredHeaders = {
    employeeSkill: ['day', 'skill', 'start_time', 'end_time', 'number_of_employ'],
    workerRequirements: ['day', 'skill', 'start_time', 'end_time', 'number_of_employ'],
    shiftBasket: ['day', 'skill', 'start_time', 'end_time', 'cost_of_shift']
  };

  const validateCSVHeaders = (data, type) => {
    const headers = Object.keys(data[0]);
    const missingHeaders = requiredHeaders[type].filter(header => !headers.includes(header));
    if (missingHeaders.length > 0) {
      console.error(`Missing required headers in ${type}:`, missingHeaders);
      return false;
    }
    return true;
  };

  const readCSVFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
    });
  };

  const transformData = (data) => {
    return data.map(row => Object.values(row));
  };

  function transformWorkerRequirementsData(workerRequirementsData) {
    if (!Array.isArray(workerRequirementsData) || !Array.isArray(workerRequirementsData[0])) {
      console.log("Data is already in the desired format:", workerRequirementsData);
      return workerRequirementsData; // Return data as it is if already in the desired format
    }
  
    return workerRequirementsData.map(row => ({
      day: row[0],
      skill: row[1],
      start: row[2],
      end: row[3],
      number_of_employ: parseInt(row[4], 10)
    }));
  }
  
  const handlePlacement = async () => {
    if (filesUploadedEmployeeSkill.employeeSkill && filesUploadedWorkerRequirements.workerRequirements && filesUploadedShiftBasket.shiftBasket) {
      try {
        const employeeSkillContent = Papa.unparse({ fields: requiredHeaders.employeeSkill, data: employeeSkillData });
        const workerRequirementsContent = Papa.unparse({ fields: requiredHeaders.workerRequirements, data: workerRequirementsData });
        const shiftBasketContent = Papa.unparse({ fields: requiredHeaders.shiftBasket, data: shiftBasketData });
  
        console.log('Sending data to server:', {
          CurrentUser,
          employeeSkillContent,
          workerRequirementsContent,
          shiftBasketContent,
        });
  
        const response = await fetch('http://localhost:5000/api/upload-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            CurrentUser,
            employeeSkillContent,
            workerRequirementsContent,
            shiftBasketContent,
          }),
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log('Received data from server:', data);
          const transformedWorkerRequirements = transformWorkerRequirementsData(workerRequirementsData);
          console.log("Transformed Worker Requirements Data:", transformedWorkerRequirements);
          setPlacementData(data);
          setWorkerRequirsData2(transformedWorkerRequirements);
          navigate('/placement-table');
        } else {
          console.error('Error:', response.statusText);
          setNotification('Error uploading data to the server. Please try again.');
        }
      } catch (error) {
        console.error('Error:', error);
        setNotification('Error uploading data to the server. Please try again.');
      }
    } else {
      setNotification('Please upload all three CSV files before placing employees.');
    }
  };
  

  return (
    <>
      <div className="container">
        <h1>Employee Placement System</h1>
        <form id="csvForm" encType="multipart/form-data">
          <div className="file-upload">
            <label htmlFor="employeeSkill">Upload Employee Skill CSV:</label>
            <input
              type="file"
              id="employeeSkill"
              name="employeeSkill"
              accept=".csv"
              onChange={async (e) => {
                const file = e.target.files[0];
                const content = await readCSVFile(file);
                const parsedData = Papa.parse(content, { header: true, skipEmptyLines: true }).data;
                if (validateCSVHeaders(parsedData, 'employeeSkill')) {
                  setEmployeeSkillData(transformData(parsedData));
                  setFilesUploadedEmployeeSkill({ employeeSkill: true });
                } else {
                  setNotification('Invalid headers in Employee Skill CSV.');
                }
              }}
            />
          </div>
          <div className="file-upload">
            <label htmlFor="workerRequirements">Upload Workers Required File:</label>
            <input
              type="file"
              id="workerRequirements"
              name="workerRequirements"
              accept=".csv"
              onChange={async (e) => {
                const file = e.target.files[0];
                const content = await readCSVFile(file);
                const parsedData = Papa.parse(content, { header: true, skipEmptyLines: true }).data;
                if (validateCSVHeaders(parsedData, 'workerRequirements')) {
                  setWorkerRequirementsData(transformData(parsedData));
                  setFilesUploadedWorkerRequirements({ workerRequirements: true });
                } else {
                  setNotification('Invalid headers in Worker Requirements CSV.');
                }
              }}
            />
          </div>
          <div className="file-upload">
            <label htmlFor="shiftBasket">Upload Optional Shifts File:</label>
            <input
              type="file"
              id="shiftBasket"
              name="shiftBasket"
              accept=".csv"
              onChange={async (e) => {
                const file = e.target.files[0];
                const content = await readCSVFile(file);
                const parsedData = Papa.parse(content, { header: true, skipEmptyLines: true }).data;
                if (validateCSVHeaders(parsedData, 'shiftBasket')) {
                  setShiftBasketData(transformData(parsedData));
                  setFilesUploadedShiftBasket({ shiftBasket: true });
                } else {
                  setNotification('Invalid headers in Shift Basket CSV.');
                }
              }}
            />
          </div>
          {notification && <div>{notification}</div>}
        </form>
        <br />
        {filesUploadedEmployeeSkill.employeeSkill && filesUploadedWorkerRequirements.workerRequirements && filesUploadedShiftBasket.shiftBasket && (
          <button onClick={handlePlacement}>Place Employees</button>
        )}
        </div>
        <div className="file-contents">
          {employeeSkillData.length > 0 && (
            <div className="content-section">
              <h2>Employee Skill Content</h2>
              <div className="scrollable-content">
                <DynamicTable
                  headers={requiredHeaders.employeeSkill}
                  data={employeeSkillData}
                  onDataChange={setEmployeeSkillData}
                />
              </div>
            </div>
          )}
          {workerRequirementsData.length > 0 && (
            <div className="content-section">
              <h2>Worker Requirements Content</h2>
              <div className="scrollable-content">
                <DynamicTable
                  headers={requiredHeaders.workerRequirements}
                  data={workerRequirementsData}
                  onDataChange={setWorkerRequirementsData}
                />
              </div>
            </div>
          )}
          {shiftBasketData.length > 0 && (
            <div className="content-section">
              <h2>Shift Basket Content</h2>
              <div className="scrollable-content">
                <DynamicTable
                  headers={requiredHeaders.shiftBasket}
                  data={shiftBasketData}
                  onDataChange={setShiftBasketData}
                />
              </div>
            </div>
          )}
        </div>
    </>
  );
}

export default InputCSV;
