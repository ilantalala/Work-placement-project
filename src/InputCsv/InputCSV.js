import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logout from '../Logout/Logout';
import FileUploadInput from './FileUploadInput';
import CSVFileDisplay from './CSVFileDisplay';
import Notification from './Notification';
import './InputCSV.css';
import Papa from 'papaparse'; 

function InputCSV({ setPlacementData, setWorkerRequirementsData }) {
    const navigate = useNavigate();
    const [employeeSkillFile, setEmployeeSkillFile] = useState(null);
    const [workerRequirementsFile, setWorkerRequirementsFile] = useState(null);
    const [shiftBasketFile, setShiftBasketFile] = useState(null);
    const [employeeSkillContent, setEmployeeSkillContent] = useState([]);
    const [workerRequirementsContent, setWorkerRequirementsContent] = useState([]);
    const [shiftBasketContent, setShiftBasketContent] = useState([]);
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
    const handlePlacement = async () => {
        // Check if all files are uploaded before proceeding
        if (filesUploaded.employeeSkill && filesUploaded.workerRequirements && filesUploaded.shiftBasket) {
            try {
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
    
    let employeeSkill="employeeSkill";
    let workerRequirements="workerRequirements";
    let shiftBasket="shiftBasket";

    return (
        <>
            <Logout />

            <div className="container">
                <h1>Employee Placement System</h1>
                <form id="csvForm" encType="multipart/form-data">
                    <FileUploadInput
                        label="Employee Skill"
                        accept=".csv"
                        onFileChange={file => {
                            setEmployeeSkillFile(file);
                            setEmployeeSkillContent([]);
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                const parsedContent = Papa.parse(e.target.result, { header: true }).data;
                                setEmployeeSkillContent(parsedContent);
                            };
                            reader.readAsText(file);
                        }}
                    />
                    <FileUploadInput
                        label="Worker Requirements"
                        accept=".csv"
                        onFileChange={file => {
                            setWorkerRequirementsFile(file);
                            setWorkerRequirementsContent([]);
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                const parsedContent = Papa.parse(e.target.result, { header: true }).data;
                                setWorkerRequirementsContent(parsedContent);
                            };
                            reader.readAsText(file);
                        }}
                    />
                    <FileUploadInput
                        label="Optional Shifts"
                        accept=".csv"
                        onFileChange={file => {
                            setShiftBasketFile(file);
                            setShiftBasketContent([]);
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                const parsedContent = Papa.parse(e.target.result, { header: true }).data;
                                setShiftBasketContent(parsedContent);
                            };
                            reader.readAsText(file);
                        }}
                    />

                    <button type="button" onClick={handleFileUpload}>
                        Upload CSV files
                    </button>

                    <Notification message={notification} />
                </form>
                <br />

                {filesUploaded.employeeSkill && filesUploaded.workerRequirements && filesUploaded.shiftBasket && (
                    <button onClick={handlePlacement}>Place Employees</button>
                )}
            </div>
            <CSVFileDisplay fileContent={employeeSkillContent} fileName={employeeSkill} />
                <CSVFileDisplay fileContent={workerRequirementsContent} fileName={workerRequirements} />
                <CSVFileDisplay fileContent={shiftBasketContent} fileName={shiftBasket}  />
        </>
    );
}

export default InputCSV;
