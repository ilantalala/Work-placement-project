import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import _ from 'lodash';
import { Spin } from 'antd';
import { format } from 'date-fns';
import { DAYS_OF_WEEK } from '../consts';
import { ScheduleTable } from './ScheduleTable';
import Autocomplete from '@mui/material/Autocomplete';
import { DateObject, Calendar } from "react-multi-date-picker"
import { useGetSchedule} from '../api/useGetSchedule';
import TextField from '@mui/material/TextField';
import './style.css';

// 3 useSomething:
// 1. useEffect -> do something, everyttime [state1, state2] changes
// 2. useMemo -> calculate value , everytime [state1, state2] changes
// example:
// const sum = useMemo(() => {
//     return calculateSum(num1, num2);
// }, [num1, num2])

// 3. useCallback -> return a function, everytime [state1, state2] changes
// example:
// const handleSum = useCallback(() => {
//     return () => {
//         return num1 + num2;
//     }
// }, [])
// handleSum()

const filterByEmployee = (data, employeeName) => {
    const filteredData = {};

    for (const skill in data) {
        const filteredShifts = data[skill].filter(shift =>
            shift.assigned_employees.some(emp => emp.trim() === employeeName)
        );

        if (filteredShifts.length > 0) {
            filteredData[skill] = filteredShifts;
        } else {
            filteredData[skill] = [];
        }
    }

    return filteredData;
};

export const ViewSchedule = ({ currentUser }) => {
    const { data: schedules, isLoading } = useGetSchedule();
    const [currentScheduleDay, setCurrentScheduleDay] = useState(new DateObject().format());
    const [selectedEmployee, setSelectedEmployee] = useState("");

    const hasScheduleInThisDate = (currDate) => {
        return schedules.some(({ start_date, end_date }) => {
            const isAfterStartDate = new DateObject(new Date(start_date)).format() <= (currDate);
            const isBeforeEndDate = new DateObject(new Date(end_date)).format() >= (currDate);
            return isAfterStartDate && isBeforeEndDate
        });
    }

    const scheduleByDay = useMemo(() => {
        const schedule = schedules?.find(({ start_date, end_date }) => {
            const isAfterStartDate = new DateObject(new Date(start_date)).format() <= new DateObject(currentScheduleDay).format();
            const isBeforeEndDate = new DateObject(new Date(end_date)).format() >= new DateObject(currentScheduleDay).format();
            return isAfterStartDate && isBeforeEndDate
        });

        const day = format(new DateObject(currentScheduleDay).format(), "EEEE");
        return schedule?.schedule?.filter((schedule) => schedule.day.toLowerCase() === day.toLowerCase());
    }, [schedules, currentScheduleDay])

    const shiftsBySkill = scheduleByDay ? _.groupBy(scheduleByDay, 'skill') : {}

    const uniqueEmployeeNames = useMemo(() => {
        const employees = new Set();

        Object.keys(shiftsBySkill).forEach((skill) => {
            shiftsBySkill[skill].forEach((shift) => {
                shift.assigned_employees.forEach((employee) => {
                    if (employee.trim() !== "Unfilled") {
                        employees.add(employee.trim());
                    }
                });
            });
        });

        return Array.from(employees);
    }, [shiftsBySkill]);


    const filteredData = useMemo(() => {
        if (selectedEmployee) {
            return filterByEmployee(shiftsBySkill, selectedEmployee);
        }
        return shiftsBySkill
    }, [selectedEmployee, shiftsBySkill]);


    console.log("currentScheduleDay", currentScheduleDay)

    console.log("schedules", scheduleByDay)
    return (
        <div style={{ display: 'flex', flexDirection: "column" }}>
            <h2>View Schedule</h2>
            { isLoading ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: "60vh"}}> 
            <Spin size="large" />
        </div> : <div style={{ display: 'flex'}}>
        
            <div style={{ padding: '24px'}}>
                <Calendar
                    value={currentScheduleDay}
                    onChange={(value) => setCurrentScheduleDay(value)}
                    mapDays={({ date }) => {
                        let className;
                        const strDate = date.format();
                        if (hasScheduleInThisDate(strDate)) className = "exists";
                        if (className) return { className };
                    }}
                />

                {currentScheduleDay && Object.values(filteredData)?.length > 0 && <div style={{ padding: '24px 0px'}}>
                    Filter by employee:
                    <Autocomplete
                        disablePortal
                        value={selectedEmployee}
                        onChange={(_, newValue) => {
                            setSelectedEmployee(newValue);
                        }}
                        options={uniqueEmployeeNames}
                        sx={{ width: 300 }}
                        renderInput={(params) => <TextField {...params} label="employee name" />}
                    />

                </div>}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center'}}>
                {currentScheduleDay && Object.values(filteredData)?.length > 0 ?
                    <ScheduleTable shiftsBySkill={filteredData} /> :
                    <div style={{ padding: '24px', textAlign: 'center', flex: 1}}><b>No shifts for this day.</b> <br /> Please try to choose a another date.</div>}

            </div>
            </div>}
        </div>
    )
}