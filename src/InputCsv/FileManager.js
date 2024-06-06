import { Box,Tab, Tabs } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Table from './Table';
import { useNavigate } from 'react-router-dom';
import { AddCSVFileButton } from './AddCSVFile';
import { AddFilesModal } from './AddFilesModal';
import CustomTabPanel from './CustomTabPanel';

export const FileManager = ({ currentUser }) => {
    const navigate = useNavigate();
    const [value, setValue] = useState(0);
    const [initialData, setInitialData] = useState({});
    const handleChange = (_, newValue) => {
        setValue(newValue)
    }

    const setData = (key, value)=> {
        setInitialData(p => ({...p, [key]: value}))
    }
    useEffect(() => {
        if (currentUser) {
          fetch(`http://localhost:5000/api/${currentUser}/get_initial_data`)
          .then((res) => res.json())
          .then((data)=> {
            console.log("data", data)
            const employeeSkill = data.find((item)=> item.type === 'employee_skill')?.data;
            const workerRequirements = data.find((item)=> item.type === 'worker_requirements')?.data;
            const shiftBasket = data.find((item)=> item.type === 'shift_basket')?.data;
            setInitialData({ employeeSkill, workerRequirements, shiftBasket })
          }).catch((err)=> {
            console.log("Error while trying to get existing user data...", err)
          })
        } else {
          navigate('/')
        }
      }, [currentUser]);

      console.log("initialData", initialData)

    return (
        <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Employee Skill Table" />
                    <Tab label="Worker Requirements" />
                    <Tab label="Shift Basket"  />
                </Tabs>
                <AddFilesModal initialData={initialData} setInitialData={setInitialData} />
            </Box>
            <CustomTabPanel value={value} index={0}>
                <AddCSVFileButton name="employeeSkill" setData={setData}/>
                <Table data={initialData?.employeeSkill} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <AddCSVFileButton name="workerRequirements" setData={setData}/>
                <Table data={initialData?.workerRequirements} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                <AddCSVFileButton name="shiftBasket" setData={setData}/>
                <Table data={initialData?.shiftBasket} />
            </CustomTabPanel>
        </>
    )
}