import React from 'react';

function Notification({ message }) {
    return message && <div className="notification">{message}</div>;
}

export default Notification;
