// PlacementTable.js

import React from 'react';
import { Link } from 'react-router-dom';
import './PlacementTable.css';

function PlacementTable({ placementData, workerRequirementsData }) {
     return (
         <div className="placement-table-container">
             <h2>Placement Table</h2>
             { placementData && placementData.length > 0 ? (
             <div>
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
                     { placementData.map((item, index) => (
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
                 <Link to={{ pathname: "/worker-requirements-chart", state: { workerRequirementsData: workerRequirementsData, placementData: placementData } }}>
                         <button>View Worker Requirements Chart</button>
                 </Link>
             </div>
             ) : (
                 <p>No placement data available.</p>
             )}
         </div>
     );
}

export default PlacementTable;
