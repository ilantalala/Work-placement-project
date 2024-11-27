import React, { useState, useEffect, useMemo } from 'react';
import _ from 'lodash';
import { UserOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { Modal, List, Avatar, AutoComplete, Input, Flex } from 'antd';
import { useEditScheduleEmployees } from '../api/useEditScheduleEmployees';

export const  EditScheduleShiftModal = ({ modalData, setModalData, shiftsBySkill, employeeSkills, scheduleId }) => {
  const currentModalData = useMemo(()=> 
    modalData && shiftsBySkill[modalData?.skill]?.find(
      (shift) => shift.day === modalData?.day && shift.start_time === modalData?.start_time && shift.end_time === modalData?.end_time
    ), [modalData, shiftsBySkill]);
    
    const [localEmployees, setLocalEmployees] = useState(currentModalData?.assigned_employees||[]);
    const queryCache = useQueryClient();
    const { mutate } = useEditScheduleEmployees({
        onSuccess: () => {
          //invalidate the cache of the query, so the next time the query is called, it will fetch the data from the server
            queryCache.invalidateQueries(['schedule']);
            alert("Successfully updated employees for the shift");
            setModalData(null) // Closes the modal
        },
        onError: () => {
            alert("Failed to update employees for the shift");
        }
    });
    
    // Everytime the modal data changes, update the local employees
    useEffect(()=> {
        setLocalEmployees(currentModalData?.assigned_employees);
    },[currentModalData])


    const employeeOptions = useMemo(()=> 
        employeeSkills
        ?.filter((emp)=> {
          // Take only employees with the same skill as the current shift
           const skills = [emp.skill1, emp.skill2, emp.skill3];
           return !localEmployees?.includes(emp.name) && skills.includes(currentModalData?.skill);
        })
        .map((emp)=> ({ 
            label: (
                <Flex align="center" justify="space-between">
                    {emp.name}
                    {emp.currentShift && 
                    <span style={{ color: 'darkgray'}}>
                    {emp.currentShift.skill}, {emp.currentShift.start_time} - {emp.currentShift.end_time}
                    </span>}
                </Flex>), 
            value: emp.name 
          }))
    ,[localEmployees, employeeSkills]);


    const onSaveEmployees = () => {
        mutate({
            scheduleId,
            shiftId: currentModalData?.id,
            employees: localEmployees,
        })
    }

  return (

    <Modal
        title={`Edit shift of schedule ${modalData?.skill}, ${modalData?.day}, ${modalData?.start_time} -${modalData?.end_time}`}
        centered
        open={!!modalData}
        okText="Save"
        onOk={onSaveEmployees}
        onCancel={() => setModalData(null)}
      >
      <List
        style={{ maxHeight: '300px', overflow: 'auto'}}
        className="demo-loadmore-list"
        itemLayout="horizontal"
        dataSource={localEmployees}
        renderItem={(item, index) => {
          const isUnfilled = item === 'Unfilled';
          const avatar = isUnfilled ? <Avatar icon={<UserOutlined />} /> : <Avatar src={"https://api.dicebear.com/7.x/miniavs/svg?seed=3"} />;
          
          return (
          <List.Item
            key={index}
          >
              <List.Item.Meta
                avatar={avatar}
                title={
                <AutoComplete
                allowClear
                onClear={() =>
                    setLocalEmployees((prev)=> {
                        const newEmployees = [...prev];

                        newEmployees[index] = 'Unfilled';
                        return newEmployees;
                    })
                    }
                  value={{ value: item, label: item}}
                  popupClassName="employee-search"
                  popupMatchSelectWidth={500}
                  style={{ width: 250 }}
                  options={employeeOptions}
                  onSelect={(value) => 
                    setLocalEmployees((prev)=> {
                        const newEmployees = [...prev];
                        newEmployees[index] = value;
                        return newEmployees;
                    })
                  }
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
  );
};

