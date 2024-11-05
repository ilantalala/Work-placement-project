
import { useQuery } from '@tanstack/react-query';
import { axiosInstance} from './axios';

const fetchShifts = async (currentUser) => {
  const response = await axiosInstance.get(`/${currentUser}/shifts`) 
  return response.data; 
};

// This hook will return the query object of the shifts 
export const useGetShifts = ({ currentUser }) => {
  return useQuery({
    queryKey: ['shifts', currentUser],
    queryFn: () => fetchShifts(currentUser),
    // Optional: customize the query behavior
    staleTime: 60000, // Data is considered fresh for 1 minute
    cacheTime: 300000, // Cached data remains for 5 minutes
    refetchOnWindowFocus: false, // Do not refetch when window is focused
    enabled: !!currentUser // Only fetch data when enabled is true -> turn currentUser to boolean
  });
};



// useEffect(()=> {
//     if (CurrentUser) {
//         setLoading(true);
//         axios.get(`http://localhost:5000/api/${CurrentUser}/shifts`)
//         .then((response) => {
//             console.log("Response table: ", response.data);
//             setPlacementData(response.data.data)
//         })
//         .catch((error)=> {
//             console.log("Could not fetch data", error)
//         }).finally(()=> {
//             setLoading(false);
//         })
//     }
// }, [CurrentUser])

