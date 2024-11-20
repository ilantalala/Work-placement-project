import { Box,Tab, Tabs } from '@mui/material';
import React, { useState } from 'react';
import Table from './Table';
import { AddCSVFileButton } from './AddCSVFile';
import { AddFilesModal } from './AddFilesModal';
import CustomTabPanel from './CustomTabPanel';
import { UploadFilesToServer } from './UploadFilesToServer';
import { useGetCsvData } from '../api/useGetCsvData';

export const FileManager = () => {
    const [value, setValue] = useState(0);
    const { csvData, setCsvData} = useGetCsvData(); // { employeeSkill, workerRequirements, shiftBasket } 

    const handleChange = (_, newValue) => {
        setValue(newValue)
    }

    const setData = (key, value)=> {
        setCsvData(p => ({...p, [key]: value}))
    }

    return (
        <>
        <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                <h3> Create new shifts by files</h3>
                <AddFilesModal setCsvData={setCsvData} />
            </div>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Employee Skill Table" />
                    <Tab label="Worker Requirements" />
                    <Tab label="Shift Basket"  />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <AddCSVFileButton name="employeeSkill" title="Add employee skill CSV" setData={setData}/>
                <Table data={csvData?.employeeSkill} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <AddCSVFileButton name="workerRequirements" title="Add worker requirements CSV" setData={setData}/>
                <Table data={csvData?.workerRequirements} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                <AddCSVFileButton name="shiftBasket" title="Add shift basket CSV" setData={setData}/>
                <Table data={csvData?.shiftBasket} />
            </CustomTabPanel>
            <UploadFilesToServer csvData={csvData}/>
        </>
    )
}