import { useMutation } from '@tanstack/react-query';
import { axiosInstance} from './axios';


const deleteShiftOfSchedule = async ({ scheduleId, shiftId }) => {
  const response = await axiosInstance.delete(`/schedule/${scheduleId}/delete/${shiftId}`); 
  return response.data; 
};

export const useDeleteShift = ({ onSuccess, onError }) => {
  return useMutation({
    mutationFn: deleteShiftOfSchedule,
    onSuccess,
    onError,
  });

};
