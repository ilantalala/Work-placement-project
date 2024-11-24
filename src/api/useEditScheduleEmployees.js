import { useMutation } from '@tanstack/react-query';
import { axiosInstance} from './axios';


const editScheduleShiftEmployees = async ({ scheduleId, shiftId, employees }) => {
  const response = await axiosInstance.put(`/schedule/${scheduleId}/edit/${shiftId}`,  { 
    employees
  }); 
  return response.data; 
};

export const useEditScheduleEmployees = ({ onSuccess, onError }) => {
  return useMutation({
    mutationFn: editScheduleShiftEmployees,
    onSuccess,
    onError,
  });

};
