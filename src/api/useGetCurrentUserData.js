import { useQuery } from '@tanstack/react-query';
import { axiosInstance} from './axios';
import { useAppContext } from '../context/AppContext';

const getUserByUsername = async (currentUser) => {
  const response = await axiosInstance.get(`/user/${currentUser}`) 
  return response.data; 
};

export const useGetCurrentUserData = () => {
  const { currentUser } = useAppContext();
  return useQuery({
    queryKey: ['currentUser', currentUser],
    queryFn: () => getUserByUsername(currentUser),
    refetchOnWindowFocus: false, // Prevents refetching when the user switches back to the browser window.
    enabled: !!currentUser // Only fetch data when enabled is true -> turn currentUser to boolean
  });
};