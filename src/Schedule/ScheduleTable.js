import React from 'react';
import _ from 'lodash';
import Popover from '@mui/material/Popover';
import { EditOutlined, TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import { Card, Modal } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { useDeleteShift } from '../api/useDeleteShift';
import { EditScheduleShiftModal } from './EditScheduleShiftModal';
import { tableStyle, tdStyle, thStyle, trStyle } from './style';

const getColor = (employeesLength, number_of_employee) => {
  if (employeesLength === number_of_employee) {
    return 'green';
  }
  if (employeesLength > number_of_employee / 2) {
    return 'orange';
  }
  return 'red';
}

export const ScheduleTable = ({ shiftsBySkill, employeeSkills, scheduleId }) => {
  const [modalData, setModalData] = React.useState(null); // { day, start_time, end_time, skill }
  const queryCache = useQueryClient();
  const { mutate } = useDeleteShift({
    onSuccess: () => {
      queryCache.invalidateQueries(['schedule']);
      alert("shift deleted successfully")
    },
    onError: () => {
      alert("error deleting shift, please try again");
    }
  });
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
                  const { day, start_time, end_time, skill } = shift;
                  const key = `${day}-${start_time}-${end_time}-${skill}`;
                  const employees = shift.assigned_employees.filter((employee) => employee !== 'Unfilled');
                  return (
                    <Card
                      key={key}
                      actions={[
                        <TeamOutlined key="employees" onClick={(e) => handleClick(e, key)} />,
                        <EditOutlined key="edit" onClick={(e) => setModalData({ day, start_time, end_time, skill })} />,
                        <DeleteOutlined key="setting" onClick={(e) => {
                          Modal.warning({
                            title: 'Are you sure you want to delete this shift?',
                            content: 'This action cannot be undone.',
                            okText: "Yes, delete shift",
                            okType: "danger",
                            cancelText: "Cancel",
                            closable: true,
                            onOk() {
                              mutate({
                                scheduleId,
                                shiftId: shift.id
                              })
                            }
                          });
                        }} />,
                      ]}
                      style={{ minWidth: 200, margin: "15px 0px" }}
                    >
                      <Card.Meta
                        title={`${shift.start_time} - ${shift.end_time}`}
                        description={
                          <>
                            <p>Cost of shift: {shift.cost_of_shift} </p>
                            <p>Employees:
                              <span style={{ marginLeft: '2px', color: getColor(employees?.length, shift.number_of_employee) }}>
                                {employees?.length} / {shift.number_of_employee}
                              </span>
                            </p>
                          </>
                        }
                      />
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
                        <div style={{ padding: '12px', overflow: 'auto', maxHeight: '200px' }}>
                          {employees?.map((employee) => <div style={{ padding: '8px' }}> {employee} </div>)}
                        </div>
                      </Popover>
                    </Card>

                  )
                })}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <EditScheduleShiftModal modalData={modalData} setModalData={setModalData} shiftsBySkill={shiftsBySkill} employeeSkills={employeeSkills} scheduleId={scheduleId} />
    </>
  );
};

