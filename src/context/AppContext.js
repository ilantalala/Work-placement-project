import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGetShifts } from '../api/useGetShifts';
import { useNavigate} from 'react-router-dom';
const UserContext = createContext();

export const useAppContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);

    useGetShifts({ currentUser });

    const logout = () => {
        localStorage.removeItem('username');
        navigate('/')
        setCurrentUser(null);
    }

    useEffect(()=> {
        const username = localStorage.getItem('username');
        if (username) {
            setCurrentUser(username);
        } 
    }, [])

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, logout}}>
      {children}
    </UserContext.Provider>
  );
};
