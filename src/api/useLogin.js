
import { useMutation } from '@tanstack/react-query';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { axiosInstance} from './axios';

const doLogin = async ({ username, password }) => {
  const response = await axiosInstance.post(`/login`,  { username, password }) 
  return response.data; 
};

// This hook will post a login request  
export const useLogin = ({ onError }) => {
  const { setCurrentUser } = useAppContext();
  const navigate = useNavigate();
  const { mutate, isError, isPending } = useMutation({
    mutationFn: doLogin,
    onSuccess: (data, { username }) => {
      setCurrentUser(username);
      localStorage.setItem('token', data);
      localStorage.setItem('username', username);
      navigate('/');
    },
    onError,
  });

  return  { mutate, isError, isPending }
};

