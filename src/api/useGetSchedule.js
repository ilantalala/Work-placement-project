
import { useQuery } from '@tanstack/react-query';
import { axiosInstance} from './axios';
import { useAppContext } from '../context/AppContext';

const fetchSchedule = async () => {
  const response = await axiosInstance.get(`/schedule`)
  return response.data;
};

export const useGetSchedule = () => {
  const { currentUser } = useAppContext();
  return useQuery({
    queryKey: ['schedule'],
    queryFn: fetchSchedule,
    refetchOnWindowFocus: false,
    enabled: !!currentUser
  });
};
