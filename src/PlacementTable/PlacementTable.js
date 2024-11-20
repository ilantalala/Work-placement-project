import React, {useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PlacementTable.css';
import { Spin, Button, Tooltip } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';

import { EditableTable } from './EditableTable';
import { CreateScheduleModal } from './CreateScheduleModal';
import {  useGetShifts } from '../api/useGetShifts';
import { axiosInstance } from '../api/axios';
import { useAppContext } from '../context/AppContext';

const PlacementTable = () => {
    const { currentUser } = useAppContext(); 
    const navigate = useNavigate();
    const { data: placementData, isLoading: loading } = useGetShifts();
    const [rows, setRows] = useState(placementData);
    

    useEffect(()=> {
        if (placementData) setRows(placementData?.data)
    }, [placementData])

    const onSubmitChanges = async () => {
        try {
            const result = await axiosInstance.put(`/${currentUser}/shifts`, { data: rows });
            console.log("result", result)
            alert("Changes saved successfully.")
        } catch (e) {
            alert("Failed to save changes, please try again.")
        }
    }
     return (
         <div className="placement-table-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px'}}>
                <h2>Current shifts</h2>
                <div style={{ display: 'flex', gap: '24px'}}>
                <Tooltip placement="left" title="Save current shifts">

                    <Button color="primary" size="large" variant="solid" icon={<SaveOutlined/>} onClick={onSubmitChanges}/>
                </Tooltip>
                </div>
             </div>
             {loading ?  
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: "60vh"}}> 
               <Spin size="large" />
                </div> : rows && rows.length > 0 ? (
             <div>
                <EditableTable rows={rows} setRows={setRows}/>
                <div style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end'}}>
                <CreateScheduleModal currentUser={currentUser}>
                    <Button color="primary" size="large" variant="solid" icon={<PlusOutlined/>}> Create Schedule </Button>
                </CreateScheduleModal>
                    </div>
             </div>
             ) : (
                 <p>No placement data available. <span style={{ cursor: "pointer", textDecoration: "underline"}} onClick={()=> navigate('/')}> Click here to create one. </span> </p>
             )}
         </div>
     );
}

export default PlacementTable;
