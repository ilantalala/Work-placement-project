import React, { useState, useEffect, useMemo } from 'react';
import _ from 'lodash';
import { UserOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { Modal, List, Avatar, AutoComplete, Input, Flex } from 'antd';
import { useEditScheduleEmployees } from '../api/useEditScheduleEmployees';

export const  EditScheduleShiftModal = ({ modalData, setModalData, shiftsBySkill, employeeSkills, scheduleId }) => {
    const queryCache = useQueryClient();
    const { mutate } = useEditScheduleEmployees({
        onSuccess: () => {
            queryCache.invalidateQueries(['schedule']);
            alert("success")
            setModalData(null)
        },
        onError: () => {
            console.log("Error");
        }
    });
    const currentModalData = useMemo(()=> 
        modalData && shiftsBySkill[modalData?.skill]?.find(
            (shift) => shift.day === modalData?.day && shift.start_time === modalData?.start_time && shift.end_time === modalData?.end_time
        ), [modalData, shiftsBySkill]);
    const [localEmployees, setLocalEmployees] = useState(currentModalData?.assigned_employees||[]);
        
    useEffect(()=> {
        setLocalEmployees(currentModalData?.assigned_employees);
    },[currentModalData])


    const employeeOptions = useMemo(()=> 
        employeeSkills
        ?.filter((emp)=> {
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
        console.log("Save employees", localEmployees);
        console.log("sending to be", {
            scheduleId,
            shiftId: currentModalData?.id,
            employees: localEmployees,
        })
        mutate({
            scheduleId,
            shiftId: currentModalData?.id,
            employees: localEmployees,
        })
    }

    console.log("currentModalData", currentModalData)
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

