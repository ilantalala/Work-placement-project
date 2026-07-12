import { useQuery } from '@tanstack/react-query';
import { axiosInstance} from './axios';
import { useAppContext } from '../context/AppContext';

const getCurrentUser = async () => {
  const response = await axiosInstance.get(`/user/me`)
  return response.data;
};

export const useGetCurrentUserData = () => {
  const { currentUser } = useAppContext();
  return useQuery({
    queryKey: ['currentUser', currentUser],
    queryFn: getCurrentUser,
    refetchOnWindowFocus: false,
    enabled: !!currentUser
  });
};
