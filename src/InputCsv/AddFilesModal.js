// import { useState } from "react"
// import { AddCSVFileButton } from "./AddCSVFile";
// import { Box, Button, Dialog, DialogContent, DialogTitle, Modal } from "@mui/material";
// import { requiredHeaders } from "./headers";

  
// export const AddFilesModal = ({ setPlacementData, setInitialData }) => {
//     const [open, setIsOpen] = useState(false);
//     const [csvData, setCsvData] = useState({});

//     const setData = (key, value)=> {
//         setCsvData(p => ({...p, [key]: value}))
//     }
//     const uploadFilesToServer = async () => {
//     //     if (csvData) {
//     //       try {
//     //         const employeeSkillContent = Papa.unparse({ fields: requiredHeaders.employeeSkill, data: csvData.employeeSkill });
//     //         const workerRequirementsContent = Papa.unparse({ fields: requiredHeaders.workerRequirements, data: csvData.workerRequirements });
//     //         const shiftBasketContent = Papa.unparse({ fields: requiredHeaders.shiftBasket, data: csvData.shiftBasket });
      
//     //         console.log('Sending data to server:', {
//     //           CurrentUser,
//     //           employeeSkillContent,
//     //           workerRequirementsContent,
//     //           shiftBasketContent,
//     //         });
      
//     //         const response = await fetch('http://localhost:5000/api/upload-data', {
//     //           method: 'POST',
//     //           headers: { 'Content-Type': 'application/json' },
//     //           body: JSON.stringify({
//     //             CurrentUser,
//     //             employeeSkillContent,
//     //             workerRequirementsContent,
//     //             shiftBasketContent,
//     //           }),
//     //         });
      
//     //         if (response.ok) {
//     //           const data = await response.json();
//     //           console.log('Received data from server:', data);
//     //           const transformedWorkerRequirements = transformWorkerRequirementsData(workerRequirementsData);
//     //           console.log("Transformed Worker Requirements Data:", transformedWorkerRequirements);
//     //           setPlacementData(data);
//     //           setWorkerRequirsData2(transformedWorkerRequirements);
//     //           navigate('/placement-table');
//     //         } else {
//     //           console.error('Error:', response.statusText);
//     //           setNotification('Error uploading data to the server. Please try again.');
//     //         }
//     //       } catch (error) {
//     //         console.error('Error:', error);
//     //         setNotification('Error uploading data to the server. Please try again.');
//     //       }
//     //     } else {
//     //       setNotification('Please upload all three CSV files before placing employees.');
//     //     }
//      };
      
    
//     return (
//         <>
//             <Button onClick={()=> setIsOpen(true)}>Add CSV</Button>
//             <Dialog onClose={()=> setIsOpen(false)} open={open}>
//              <DialogTitle>Upload your files</DialogTitle>
//                 <DialogContent>

//                     <p>Add your employee skills:</p>
//                     <AddCSVFileButton name="employeeSkill" setData={setData}/>

//                     <p>Add your workerRequirements:</p>
//                     <AddCSVFileButton name="workerRequirements" setData={setData}/>

//                     <p>Add your shiftBasket:</p>
//                     <AddCSVFileButton name="shiftBasket" setData={setData}/>


//                     <Button variant="contained" color="success" onClick={()=> {
//                         setInitialData(csvData)
//                         setIsOpen(false);
//                     }}>
//                         Display tables
//                     </Button>
//                 </DialogContent>
//             </Dialog>
//             {csvData && <Button onClick={uploadFilesToServer}> Upload data to server</Button>}
//         </>
//     )
// }


import { useState } from "react";
import { Button } from "antd";
import { AddCSVFileButton } from "./AddCSVFile";
import { DownloadOutlined } from '@ant-design/icons';

import { Box, Dialog, DialogContent, DialogTitle } from "@mui/material";
import Papa from "papaparse";
import { requiredHeaders } from "./headers";
import { useNavigate } from "react-router-dom";

export const AddFilesModal = ({ setCsvData }) => {
  const [open, setIsOpen] = useState(false);
  const [tempData, setTemp] = useState({});

  const setTempData = (key, value) => {
    setTemp(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Button style={{margin: '24px'}} onClick={() => setIsOpen(true)} type="primary" shape="round" icon={<DownloadOutlined />} size={"large"}>
        Add All files at once
      </Button>

      <Dialog onClose={() => setIsOpen(false)} open={open}>
        <DialogTitle>Upload your files</DialogTitle>
        <DialogContent>
          <p>Add your employee skills:</p>
          <AddCSVFileButton name="employeeSkill" setData={setTempData} />

          <p>Add your worker Requirements:</p>
          <AddCSVFileButton name="workerRequirements" setData={setTempData} />

          <p>Add your shiftBasket:</p>
          <AddCSVFileButton name="shiftBasket" setData={setTempData} />

          <Button variant="contained" color="success" onClick={() => {
            setCsvData(tempData);
            setIsOpen(false);
          }}>
            Display tables
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
