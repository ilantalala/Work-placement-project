import "./Logout.css"
import React from 'react';
import {  useNavigate } from 'react-router-dom';


function Logout({ cleanCurrentUser}) {

    const navigate = useNavigate();
    const onLogout = () => {
        localStorage.removeItem('username');
        navigate('/')
        cleanCurrentUser();
    }
    return (
        <button onClick={onLogout} className="btn btn-danger logout">Logout</button>
    );
}

export default Logout;
