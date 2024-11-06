
import { useQuery } from '@tanstack/react-query';
import { axiosInstance} from './axios';
import { useAppContext } from '../context/AppContext';

const fetchSchedule = async (currentUser) => {
  const response = await axiosInstance.get(`${currentUser}/schedule`) 
  return response.data; 
};

export const useGetSchedule = () => {
  const { currentUser } = useAppContext();
  return useQuery({
    queryKey: ['schedule', currentUser],
    queryFn: () => fetchSchedule(currentUser),
    refetchOnWindowFocus: false, // Do not refetch when window is focused
    enabled: !!currentUser // Only fetch data when enabled is true -> turn currentUser to boolean
  });
};