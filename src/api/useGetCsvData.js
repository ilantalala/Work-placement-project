
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppContext } from '../context/AppContext';
import { axiosInstance} from './axios';

const fetchInitialCsvData = async (currentUser) => {
  const response = await axiosInstance.get(`/${currentUser}/get_initial_data`) 
  const data = response.data;
    const employeeSkill = data.find((item)=> item.type === 'employee_skill')?.data;
    const workerRequirements = data.find((item)=> item.type === 'worker_requirements')?.data;
    const shiftBasket = data.find((item)=> item.type === 'shift_basket')?.data;
    return { employeeSkill, workerRequirements, shiftBasket }
};

export const useGetCsvData = () => {
 const [csvData, setCsvData] = useState({});
 const { currentUser } = useAppContext();
 const { data }= useQuery({
    queryKey: ['csvData', currentUser],
    queryFn: () => fetchInitialCsvData(currentUser),
    refetchOnWindowFocus: false, // Do not refetch when window is focused
    enabled: !!currentUser, // Only fetch data when enabled is true -> turn currentUser to boolean,
  });

  useEffect(()=> {
    setCsvData(data);
  }, [data])

  return { csvData, setCsvData }
};



