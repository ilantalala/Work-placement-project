// PlacementTable.js

import React, {useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './PlacementTable.css';
import { Button  } from '@mui/material';
import { EditableTable } from './EditableTable';
import { CreateScheduleModal } from './CreateScheduleModal';

const PlacementTable = ({ loading, placementData, currentUser }) => {
    const [rows, setRows] = useState(placementData);

    useEffect(()=> {
        setRows(placementData)
    }, [placementData])

    const onSubmitChanges = async () => {
        try {
            const result = await axios.put(`http://localhost:5000/api/${currentUser}/shifts`, { data: rows });
            console.log("result", result)
            alert("Changes saved successfully.")
        } catch (e) {
            alert("Failed to save changes, please try again.")
        }
    }
     return (
         <div className="placement-table-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px'}}>
                <h2>Placement Table</h2>
                <div style={{ display: 'flex', gap: '24px'}}>
                    <CreateScheduleModal currentUser={currentUser}>
                        <Button variant="contained" color="success"> Create Schedule </Button>
                    </CreateScheduleModal>
                    <Button variant="contained" onClick={onSubmitChanges}> Save changes </Button>
                </div>
             </div>
             {loading ? "Loading placement data...." : rows && rows.length > 0 ? (
             <div>
                <EditableTable rows={rows} setRows={setRows}/>
                 {/* <table>
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
                 </table> */}
                 <Link to={{ pathname: "/worker-requirements-chart" }}>
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
