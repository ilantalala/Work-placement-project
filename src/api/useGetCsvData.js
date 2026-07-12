
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppContext } from '../context/AppContext';
import { axiosInstance} from './axios';

const fetchInitialCsvData = async () => {
  const response = await axiosInstance.get(`/files`)
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
    queryFn: fetchInitialCsvData,
    refetchOnWindowFocus: false,
    enabled: !!currentUser,
  });

  useEffect(()=> {
    setCsvData(data);
  }, [data])

  return { csvData, setCsvData }
};
