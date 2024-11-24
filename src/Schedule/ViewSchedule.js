import React, { useState, useMemo, useEffect } from 'react';
import _ from 'lodash';
import { Spin } from 'antd';
import { format } from 'date-fns';
import { ScheduleTable } from './ScheduleTable';
import { useSearchParams } from 'react-router-dom'
import Autocomplete from '@mui/material/Autocomplete';
import { DateObject, Calendar } from "react-multi-date-picker"
import { useGetSchedule} from '../api/useGetSchedule';
import TextField from '@mui/material/TextField';
import './style.css';


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
    const [searchParams, setSearchParams] = useSearchParams()
    const [currentScheduleDay, setCurrentScheduleDay] = useState(new DateObject().format());
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [selectedSkills, setSelectedSkills] = useState([]);

    const hasScheduleInThisDate = (currDate) => {
        return schedules?.some(({ start_date, end_date }) => {
            const isAfterStartDate = new DateObject(new Date(start_date)).format() <= (currDate);
            const isBeforeEndDate = new DateObject(new Date(end_date)).format() >= (currDate);
            return isAfterStartDate && isBeforeEndDate
        });
    }

        // Check if the date is in the URL (as param) and set it as the current date , for example: http://localhost:3000/schedule?date=2022-01-01
    useEffect(()=> {
        const date = searchParams.get('date');
        if (date) {
            setCurrentScheduleDay(new DateObject(new Date(date)).format())
            setSearchParams({})
        }
    }, [searchParams])
    
    const currentSchedule = useMemo(() => schedules?.find(({ start_date, end_date }) => {
        const isAfterStartDate = new DateObject(new Date(start_date)).format() <= new DateObject(currentScheduleDay).format();
        const isBeforeEndDate = new DateObject(new Date(end_date)).format() >= new DateObject(currentScheduleDay).format();
        return isAfterStartDate && isBeforeEndDate
    }), [schedules, currentScheduleDay])
    
    const scheduleByDay = useMemo(() => {
        const day = format(new DateObject(currentScheduleDay).format(), "EEEE");
        return currentSchedule?.schedule?.filter((schedule) => schedule.day.toLowerCase() === day.toLowerCase());
    }, [schedules, currentScheduleDay, currentSchedule])
    
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
    
    const filterBySkills = (data, skills) => {
        if (!data) return {};
        return _.pick(data, skills)
    }
    const filteredData = useMemo(() => {
        let data = shiftsBySkill;
        if (selectedEmployee) {
            data = filterByEmployee(data, selectedEmployee);
        }
        if (selectedSkills?.length > 0) {
            data = filterBySkills(data, selectedSkills);
        }
        return data
    }, [selectedEmployee, shiftsBySkill, selectedSkills]);
    
    const employeeSkills = currentSchedule?.employee_skill.map((employee)=> ({...employee, currentShift: scheduleByDay.find((shift) => shift.assigned_employees.includes(employee.name))}));
    
    
    console.log("employeeSkills", scheduleByDay, employeeSkills)
    console.log("currentSchedule", currentSchedule)
    
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

                {currentScheduleDay && Object.values(filteredData)?.length > 0 && 
                <>
                <div style={{ padding: '24px 0px'}}>
                    Filter by employee:
                    <Autocomplete
                        disablePortal
                        value={selectedEmployee}
                        onChange={(_, newValue) => {
                            setSelectedEmployee(newValue);
                        }}
                        options={uniqueEmployeeNames}
                        sx={{ width: 300 }}
                        renderInput={(params) => <TextField {...params} label="Employee name..." />}
                    />

                </div>
                <div style={{ padding: '24px 0px'}}>
                    Filter by skill:
                    <Autocomplete
                        multiple
                        disablePortal
                        value={selectedSkills}
                        onChange={(_, newValue) => {
                            setSelectedSkills(newValue);
                        }}
                        options={Object.keys(shiftsBySkill)}
                        sx={{ width: 300 }}
                        renderInput={(params) => <TextField {...params} label="Choose skill..." />}
                    />

                </div>
                </>}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', overflow: 'auto'}}>
                {currentScheduleDay && Object.values(filteredData)?.length > 0 ?
                    <ScheduleTable shiftsBySkill={filteredData} employeeSkills={employeeSkills} scheduleId={currentSchedule?._id} /> :
                    <div style={{ padding: '24px', textAlign: 'center', flex: 1}}><b>No shifts for this day.</b> <br /> Please try to choose a another date.</div>}

            </div>
            </div>}
        </div>
    )
}