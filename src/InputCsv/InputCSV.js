import React, { useState } from 'react';
import Logout from '../Logout/Logout';
import './InputCSV.css';

function InputCSV() {
    const [employeeSkillFile, setEmployeeSkillFile] = useState(null);
    const [workerRequirementsFile, setWorkerRequirementsFile] = useState(null);
    const [shiftBasketFile, setShiftBasketFile] = useState(null);
    const [notification, setNotification] = useState('');

    const handleFileUpload = () => {
        // Check if all three files are uploaded
        if (employeeSkillFile && workerRequirementsFile && shiftBasketFile) {
            // Perform any action or display notification
            setNotification('CSV files uploaded successfully!');
        } else {
            setNotification('Please upload all three CSV files.');
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
                            onChange={(e) => setEmployeeSkillFile(e.target.files[0])}
                        />
                    </div>

                    <div className="file-upload">
                        <label htmlFor="workerRequirements">Upload Workers Required File:</label>
                        <input
                            type="file"
                            id="workerRequirements"
                            name="workerRequirements"
                            accept=".csv"
                            onChange={(e) => setWorkerRequirementsFile(e.target.files[0])}
                        />
                    </div>

                    <div className="file-upload">
                        <label htmlFor="shiftBasket">Upload Optional Shifts File:</label>
                        <input
                            type="file"
                            id="shiftBasket"
                            name="shiftBasket"
                            accept=".csv"
                            onChange={(e) => setShiftBasketFile(e.target.files[0])}
                        />
                    </div>

                    <button type="button" onClick={handleFileUpload}>
                        Upload CSV Files
                    </button>

                    {notification && <div>{notification}</div>}
                </form>
            </div>
        </>
    );
}

export default InputCSV;
