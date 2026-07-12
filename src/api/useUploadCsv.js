import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from './axios';

const createCsvFiles = async ({ employeeSkillContent, workerRequirementsContent, shiftBasketContent }) => {
  const response = await axiosInstance.post(`/upload-data`, {
    employeeSkillContent,
    workerRequirementsContent,
    shiftBasketContent
  });
  return response.data;
};

export const useUploadCsv = ({ onSuccess, onError }) => {
  return useMutation({
    mutationFn: createCsvFiles,
    onSuccess,
    onError,
  });
};
