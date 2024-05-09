import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logout from '../Logout/Logout';
import './InputCSV.css';
import Papa from 'papaparse'; 

function InputCSV({ setPlacementData,setWorkerRequirementsData,CurrentUser}) {
    const navigate = useNavigate();
    useEffect(() => {
    }, [CurrentUser]);
    const [employeeSkill, setEmployeeSkill] = useState(null);
    const [workerRequirements, setWorkerRequirements] = useState(null);
    const [shiftBasket, setShiftBasket] = useState(null);
    const [notification, setNotification] = useState('');
    const [filesUploadedEmployeeSkill, setFilesUploadedEmployeeSkill] = useState({
        employeeSkill: false
    });
    const [filesUploadedWorkerRequirements, setFilesUploadedWorkerRequirements] = useState({
        workerRequirements: false
    });
    const [filesUploadedShiftBasket, setFilesUploadedShiftBasket] = useState({
        shiftBasket: false
    });
     

    const handleFileUploadEmployeeSkill = () => {
        // Check if all three files are uploaded
        if (employeeSkill) {
            // Perform any action or display notification
            setNotification('CSV files uploaded successfully!');
            setFilesUploadedEmployeeSkill({ employeeSkill: true})
        } else {
            setNotification('Please upload employeeSkill CSV file.');
        }
    };
    const handleFileUploadWorkerRequirements = () => {
        // Check if all three files are uploaded
        if (workerRequirements) {
            // Perform any action or display notification
            setNotification('CSV files uploaded successfully!');
            setFilesUploadedWorkerRequirements({ workerRequirements: true})
        } else {
            setNotification('Please upload workerRequirements CSV file.');
        }
    };
    const handleFilesUploadedShiftBasket = () => {
        // Check if all three files are uploaded
        if (shiftBasket) {
            // Perform any action or display notification
            setNotification('CSV files uploaded successfully!');
            setFilesUploadedShiftBasket({ shiftBasket: true})
        } else {
            setNotification('Please upload workerRequirements CSV file.');
        }
    };
    const readCSVFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = () => {
                reject(reader.error);
            };
        });
    };
    // Function to handle placement logic
    const handlePlacement = async () => {
        // Check if all files are uploaded before proceeding
        if (filesUploadedEmployeeSkill && filesUploadedWorkerRequirements && filesUploadedShiftBasket) {
            try {
                // Read the contents of the files
                const employeeSkillContent = await readCSVFile(employeeSkill);
                const workerRequirementsContent = await readCSVFile(workerRequirements);
                const shiftBasketContent = await readCSVFile(shiftBasket);
                const parsedWorkerRequirements = Papa.parse(workerRequirementsContent, { header: true,skipEmptyLines:true }).data;
                setWorkerRequirementsData(parsedWorkerRequirements);

                // Send data to the server
                const response = await fetch('http://localhost:5000/api/upload-data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        CurrentUser,
                        employeeSkillContent,
                        workerRequirementsContent,
                        shiftBasketContent
                    })
                });

                if (response.ok) {
                    // If the response is successful, parse the response JSON
                    const data = await response.json();
                    console.log('Server response:', data);

                    // Assuming the server response is an array of placement data
                    setPlacementData(data);
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
    console.log(filesUploadedEmployeeSkill)
    return (
        <>
            <Logout />

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
                            onChange={(e) => {
                                setEmployeeSkill(e.target.files[0]);
                                setFilesUploadedEmployeeSkill({ ...filesUploadedEmployeeSkill, employeeSkill: true });
                            }}
                        />
                    </div>
                    <button type="button" onClick={handleFileUploadEmployeeSkill}>
                        Upload employeeSkill table
                    </button>
                    <div className="file-upload">
                        <label htmlFor="workerRequirements">Upload Workers Required File:</label>
                        <input
                            type="file"
                            id="workerRequirements"
                            name="workerRequirements"
                            accept=".csv"
                            onChange={(e) => {
                                setWorkerRequirements(e.target.files[0]);
                                setFilesUploadedWorkerRequirements({ ...filesUploadedWorkerRequirements, workerRequirements: true });
                            }}
                        />
                    </div>
                    <button type="button" onClick={handleFileUploadWorkerRequirements}>
                        Upload workerRequirements table
                    </button>
                    <div className="file-upload">
                        <label htmlFor="shiftBasket">Upload Optional Shifts File:</label>
                        <input
                            type="file"
                            id="shiftBasket"
                            name="shiftBasket"
                            accept=".csv"
                            onChange={(e) => {
                                setShiftBasket(e.target.files[0]);
                                setFilesUploadedShiftBasket({ ...filesUploadedShiftBasket, shiftBasket: true });
                            }}
                        />
                    </div>

                    <button type="button" onClick={handleFilesUploadedShiftBasket}>
                        Upload shiftBasket table
                    </button>
                    {notification && <div>{notification}</div>}
                </form>
                <br></br>
                {(filesUploadedEmployeeSkill.employeeSkill && 
                    filesUploadedWorkerRequirements.workerRequirements && 
                    filesUploadedShiftBasket.shiftBasket) && (
                <button onClick={handlePlacement}>Place Employees</button>
)}
            </div>
        </>
    );
}

export default InputCSV;
