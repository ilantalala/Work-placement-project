import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logout from '../Logout/Logout';
import './InputCSV.css';

function InputCSV({ setPlacementData }) {
    const navigate = useNavigate();
    const [employeeSkillFile, setEmployeeSkillFile] = useState(null);
    const [workerRequirementsFile, setWorkerRequirementsFile] = useState(null);
    const [shiftBasketFile, setShiftBasketFile] = useState(null);
    const [notification, setNotification] = useState('');
    const [filesUploaded, setFilesUploaded] = useState({
        employeeSkill: false,
        workerRequirements: false,
        shiftBasket: false,
    });

    const handleFileUpload = () => {
        // Check if all three files are uploaded
        if (employeeSkillFile && workerRequirementsFile && shiftBasketFile) {
            // Perform any action or display notification
            setNotification('CSV files uploaded successfully!');
            setFilesUploaded({
                employeeSkill: true,
                workerRequirements: true,
                shiftBasket: true,
            });
        } else {
            setNotification('Please upload all three CSV files.');
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
        if (filesUploaded.employeeSkill && filesUploaded.workerRequirements && filesUploaded.shiftBasket) {
            try {
                // Read the contents of the files
                const employeeSkillContent = await readCSVFile(employeeSkillFile);
                const workerRequirementsContent = await readCSVFile(workerRequirementsFile);
                const shiftBasketContent = await readCSVFile(shiftBasketFile);

                // Send data to the server
                const response = await fetch('http://localhost:5000/api/upload-data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
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
                                setEmployeeSkillFile(e.target.files[0]);
                                setFilesUploaded({ ...filesUploaded, employeeSkill: true });
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
                            onChange={(e) => {
                                setWorkerRequirementsFile(e.target.files[0]);
                                setFilesUploaded({ ...filesUploaded, workerRequirements: true });
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
                            onChange={(e) => {
                                setShiftBasketFile(e.target.files[0]);
                                setFilesUploaded({ ...filesUploaded, shiftBasket: true });
                            }}
                        />
                    </div>

                    <button type="button" onClick={handleFileUpload}>
                        Upload CSV files
                    </button>

                    {notification && <div>{notification}</div>}
                </form>
                <br></br>
                {filesUploaded.employeeSkill && filesUploaded.workerRequirements && filesUploaded.shiftBasket && (
                    <button onClick={handlePlacement}>Place Employees</button>
                )}
            </div>
        </>
    );
}

export default InputCSV;
