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
