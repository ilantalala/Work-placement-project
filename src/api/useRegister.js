
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { axiosInstance} from './axios';

const registerUser = async ({
   username,
  password,
  displayName,
  companyName
}) => {
  const response = await axiosInstance.post(`/register`,  {        
    username,
    password,
    displayName,
    companyName
}) 
  return response.data; 
};

export const useRegister = ({ onError }) => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      navigate('/');
    },
    onError,
  });

};
