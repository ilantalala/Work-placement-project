
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from './axios';
import { useAppContext } from '../context/AppContext';

const fetchShifts = async () => {
  const response = await axiosInstance.get(`/shifts`)
  return response.data;
};

export const useGetShifts = () => {
  const { currentUser } = useAppContext();
  return useQuery({
    queryKey: ['shifts', currentUser],
    queryFn: fetchShifts,
    staleTime: 60000,
    cacheTime: 300000,
    refetchOnWindowFocus: false,
    enabled: !!currentUser
  });
};
