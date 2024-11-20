import React from 'react';
import Box from '@mui/material/Box';
import _ from 'lodash';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import { EditOutlined, TeamOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Modal, List, Avatar, AutoComplete, Input, Flex } from 'antd';


const getColor = (employeesLength, number_of_employee) => {
  if (employeesLength === number_of_employee) {
    return 'green';
  }
  if (employeesLength > number_of_employee / 2) {
    return 'orange';
  }
  return 'red';
}

const tableStyle = {
    width: '80%',
    margin: '50px auto',
    borderCollapse: 'collapse',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    maxWidth: '100%',
    overflow: 'auto'
  };

  const thStyle = {
    backgroundColor: '#5a54f9',
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

export const  ScheduleTable = ({ shiftsBySkill, employeeSkills }) => {
    const [modalData, setModalData] = React.useState(null); // { day, start_time, end_time, skill }

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

    const currentModalData = modalData && shiftsBySkill[modalData?.skill]?.find(
      (shift) => shift.day === modalData?.day && shift.start_time === modalData?.start_time && shift.end_time === modalData?.end_time
    );

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
                      <TeamOutlined key="employees"onClick={(e)=> handleClick(e,key)}  />,
                      <EditOutlined key="edit" onClick={(e)=> setModalData({ day, start_time, end_time, skill })}/>,
                      <DeleteOutlined key="setting" />,
                    ]} 
                    style={{ minWidth: 200, margin: "15px 0px"}}
                  >
                  <Card.Meta
                    // avatar={<Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=2" />}
                    title={`${shift.start_time} - ${shift.end_time}`}
                    description={
                      <>
                        <p>Cost of shift: {shift.cost_of_shift} </p>
                        <p>Employees: 
                          <span style={{ marginLeft: '2px', color: getColor(employees?.length, shift.number_of_employee)}}>
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
                      <div style={{ padding: '12px', overflow: 'auto', maxHeight: '200px'}}>
                        {employees?.map((employee) => <div style={{padding: '8px'}}> {employee} </div>)}
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
    <Modal
        title={`Edit shift of schedule ${modalData?.skill}, ${modalData?.day}, ${modalData?.start_time} -${modalData?.end_time}`}
        centered
        open={!!modalData}
        onOk={() => setModalData(null)}
        onCancel={() => setModalData(null)}
      >
      <List
       style={{ maxHeight: '300px', overflow: 'auto'}}
        className="demo-loadmore-list"
        itemLayout="horizontal"
        dataSource={currentModalData?.assigned_employees}
        renderItem={(item) => {
          const isUnfilled = item === 'Unfilled';
          const avatar = isUnfilled ? <Avatar icon={<UserOutlined />} /> : <Avatar src={"https://api.dicebear.com/7.x/miniavs/svg?seed=3"} />;
          const actions = isUnfilled ? [<a key="assign-employee">Assign</a>] : [<a key="list-loadmore-more">Replace</a>, <a key="list-loadmore-more">Delete</a>];
          
          return (
          <List.Item
            actions={actions}
          >
              <List.Item.Meta
                avatar={avatar}
                title={
                <AutoComplete
                  value={{ value: item, label: item}}
                  popupClassName="employee-search"
                  popupMatchSelectWidth={500}
                  style={{ width: 250 }}
                  options={employeeSkills.map((emp)=> ({ 
                    label:     <Flex align="center" justify="space-between">
                    {emp.name}
                    {emp.currentShift && 
                    <span style={{ color: 'darkgray'}}>
                      {emp.currentShift.skill}, {emp.currentShift.start_time} - {emp.currentShift.end_time}
                      </span>}
                    {console.log("empt", emp)}
                  </Flex>, 
                    value: emp.name 
                  }))}
                  size="large"
                >
                  <Input size="middle" placeholder="Search employee..." />
                </AutoComplete>
              }
              />
          </List.Item>
        )}}
      />

      </Modal>

    </>
  );
};

