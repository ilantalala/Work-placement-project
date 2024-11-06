import * as React from 'react';
import Box from '@mui/material/Box';
import _ from 'lodash';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';

const tableStyle = {
    width: '80%',
    margin: '50px auto',
    borderCollapse: 'collapse',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
  };

  const thStyle = {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '12px 15px',
    textAlign: 'center',
    border: '1px solid #ddd',
    fontSize: '18px'
  };

  const tdStyle = {
    padding: '12px 15px',
    textAlign: 'center',
    border: '1px solid #ddd',
    fontSize: '16px',
    backgroundColor: '#f2f2f2'
  };

  const trStyle = {
    transition: 'background-color 0.3s ease'
  };

export const  ScheduleTable = ({ shiftsBySkill }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [id, setId] = React.useState(null);

    const handleClick = (event, id) => {
      setAnchorEl(event.currentTarget);
      setId(id);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
      setId(null);
    };
  
    const columns = Object.keys(shiftsBySkill);

  return (
    <>

    <table style={tableStyle}>
      <thead>
        <tr style={trStyle}>
          {columns.map((column, index) => (
              <th key={index} style={thStyle}>
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr style={trStyle}>
          {columns.map((skill, index) => (
              <td key={index} style={tdStyle}>
             {shiftsBySkill[skill].map((shift) => {
                const key = `${shift.day}-${shift.start_time}-${shift.end_time}`;
                const employees = shift.assigned_employees.filter((employee) => employee !== 'Unfilled');
                 return <div key={key} style={{ border: '1px solid black', padding: '12px', margin: '12px' }}>
                    <div> {shift.start_time } - {shift.end_time} </div>
                    <div> cost of shift: {shift.cost_of_shift} </div>
                    <div> employees:  {employees?.length} / {shift.number_of_employee} </div>
                    {employees?.length && <Button onClick={(e)=> handleClick(e,key)}>View employees</Button> }
                    <Popover 
                    aria-describedby={key} 
                    id={key}
                    open={Boolean(anchorEl) && id === key}
                    anchorEl={anchorEl}
                    onClose={handleClose}
            
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                        >
                            <div style={{ padding: '12px', overflow: 'auto', maxHeight: '200px'}}>


                        {employees?.map((employee) => <div style={{padding: '8px'}}> {employee} </div>)}
                            </div>
                    </Popover>

                </div>
            })}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
    </>
  );
};

