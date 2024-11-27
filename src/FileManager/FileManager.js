import React, { useState } from 'react';
import Table from './Table';
import { Tabs } from 'antd';
import { AddCSVFileButton } from './AddCSVFileButton';
import { AddFilesModal } from './AddFilesModal';
import { UploadFilesToServer } from './UploadFilesToServer';
import { useGetCsvData } from '../api/useGetCsvData';

export const FileManager = () => {
    const [value, setValue] = useState('employeeSkill');
    const { csvData, setCsvData } = useGetCsvData(); // { employeeSkill, workerRequirements, shiftBasket } 

    const handleChange = (newValue) => {
        setValue(newValue)
    }

    const setData = (key, value) => {
        setCsvData(prevData => ({ ...prevData, [key]: value }));
    }

    const tabItems = [
        {
            key: 'employeeSkill',
            label: 'Employee Skill Table',
            children: (<>
                <AddCSVFileButton name="employeeSkill" title="Add employee skill CSV" setData={setData} />
                <Table data={csvData?.employeeSkill} />
            </>)
        },
        {
            key: 'workerRequirements',
            label: 'Worker Requirements',
            children: (<>
                <AddCSVFileButton name="workerRequirements" title="Add worker requirements CSV" setData={setData} />
                <Table data={csvData?.workerRequirements} />
            </>)
        },
        {
            key: 'shiftBasket',
            label: 'Shift Basket',
            children: (<>
                <AddCSVFileButton name="shiftBasket" title="Add shift basket CSV" setData={setData} />
                <Table data={csvData?.shiftBasket} />
            </>)
        }
    ]
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3> Create new shifts by files</h3>
                <AddFilesModal setCsvData={setCsvData} />
            </div>
            <Tabs activeKey={value} items={tabItems} onChange={handleChange} />
            <UploadFilesToServer csvData={csvData} />
        </>
    )
}