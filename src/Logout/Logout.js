import { Button } from "@mui/material";
import "./Logout.css"
import React from 'react';
import {  useNavigate } from 'react-router-dom';


function Logout({ cleanCurrentUser, currentUser}) {

    const navigate = useNavigate();
    const onLogout = () => {
        localStorage.removeItem('username');
        navigate('/')
        cleanCurrentUser();
    }
    if (!currentUser) return null;
    
    return (
        <Button onClick={onLogout} color="error" variant="contained">Logout</Button>
    );
}

export default Logout;
