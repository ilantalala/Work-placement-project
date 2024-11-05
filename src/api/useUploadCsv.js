

// const response = await fetch('http://localhost:5000/api/upload-data', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       currentUser,
//       employeeSkillContent,
//       workerRequirementsContent,
//       shiftBasketContent,
//     }),
//   });

//   if (response.ok) {
//     const data = await response.json();
//     console.log('Received data from server:', data);
//     setPlacementData(data);
//     setNotification('Data uploaded successfully.');
//     navigate('/placement-table');
//   } else {
//     console.error('Error:', response.statusText);
//     setNotification('Error uploading data to the server. Please try again.');
//   }
// } catch (error) {
//   console.error('Error:', error);
//   setNotification('Error uploading data to the server. Please try again.');
// }


import { useMutation } from '@tanstack/react-query';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { axiosInstance} from './axios';

const createCsvFiles = async ({ currentUser, employeeSkillContent, workerRequirementsContent, shiftBasketContent }) => {
  const response = await axiosInstance.post(`/upload-data`,  { 
    currentUser,
    employeeSkillContent,
    workerRequirementsContent,
    shiftBasketContent
  }); 
  return response.data; 
};

// This hook will post a login request  
export const useUploadCsv = ({ onSuccess, onError }) => {
  return useMutation({
    mutationFn: createCsvFiles,
    onSuccess,
    onError,
  });

};
