import "./Logout.css"
import React from 'react';
import { Link } from 'react-router-dom';


function Logout() {

    return (
        <Link to="/">
            <button className="btn btn-danger logout">Logout</button>
        </Link>
    );
}

export default Logout;
