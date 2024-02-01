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

    // Function to handle placement logic
    const handlePlacement = () => {

        // Check if all files are uploaded before proceeding
        if (filesUploaded.employeeSkill && filesUploaded.workerRequirements && filesUploaded.shiftBasket) {
            
            // For demonstration, using dummy data
            const dummyPlacementData =  [
                { skill: 'Skill1', day: 'Monday', fromHour: '09:00', toHour: '12:00', numOfEmployees: 3 },
                { skill: 'Skill2', day: 'Monday', fromHour: '10:00', toHour: '12:00', numOfEmployees: 5 },
                { skill: 'Skill3', day: 'Monday', fromHour: '11:00', toHour: '14:00', numOfEmployees: 4 },
                { skill: 'Skill4', day: 'Monday', fromHour: '12:00', toHour: '14:00', numOfEmployees: 5 },
                { skill: 'Skill5', day: 'Monday', fromHour: '13:00', toHour: '16:00', numOfEmployees: 8 },
                { skill: 'Skill6', day: 'Monday', fromHour: '14:00', toHour: '16:00', numOfEmployees: 1 },
            ];

            setPlacementData(dummyPlacementData);
            navigate('/placement-table');

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
