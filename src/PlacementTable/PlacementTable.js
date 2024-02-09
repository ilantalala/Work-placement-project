// PlacementTable.js

import React from 'react';
import './PlacementTable.css';

function PlacementTable({ placementData }) {
    return (
        <div className="placement-table-container">
            <h2>Placement Table</h2>
            {placementData && placementData.length > 0 ? (
                <table>
                    <thead>
                    <tr>
                        <th>Skill</th>
                        <th>Day</th>
                        <th>From Hour</th>
                        <th>To Hour</th>
                        <th>Number of Employees</th>
                    </tr>
                    </thead>
                    <tbody>
                    {placementData.map((item, index) => (
                        <tr key={index}>
                            <td>{item.skill}</td>
                            <td>{item.day}</td>
                            <td>{item.start}</td>
                            <td>{item.end}</td>
                            <td>{item.number_of_employ}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>No placement data available.</p>
            )}
        </div>
    );
}

export default PlacementTable;
