import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import _ from 'lodash';
import { format } from 'date-fns';
import { ScheduleTable } from './ScheduleTable';
import Autocomplete from '@mui/material/Autocomplete';
import { DateObject, Calendar } from "react-multi-date-picker"

import TextField from '@mui/material/TextField';
import './style.css';


const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
    const [isLoading, setIsLoading] = useState(true);
    const [schedules, setSchedules] = useState([]);
    const [currentScheduleDay, setCurrentScheduleDay] = useState(new DateObject().format());
    const [choosenDay, setChoosenDay] = useState('Sunday');
    const [selectedEmployee, setSelectedEmployee] = useState("");

    const hasScheduleInThisDate = (currDate) => {
        return schedules.some(({ start_date, end_date }) => {
            const isAfterStartDate = new DateObject(new Date(start_date)).format() <= (currDate);
            const isBeforeEndDate = new DateObject(new Date(end_date)).format() >= (currDate);
            return isAfterStartDate && isBeforeEndDate
        });
    }

    useEffect(() => {
        if (currentUser) {
            axios.get(`http://localhost:5000/api/${currentUser}/schedule`)
                .then((response) => {
                    console.log(response.data);
                    setSchedules(response.data);
                    setIsLoading(false);
                })
        }
    }, [currentUser])

    const days = schedules?.map((schedule) => {
        const date = new Date(schedule?.start_date);
        const end_date = new Date(schedule?.end_date);

        return { startDate: format(date, 'dd/MM/yyyy'), endDate: format(end_date, 'dd/MM/yyyy') };
    });

    const scheduleByDay = useMemo(() => {

        const schedule = schedules.find(({ start_date, end_date }) => {
            const isAfterStartDate = new DateObject(new Date(start_date)).format() <= new DateObject(currentScheduleDay).format();
            const isBeforeEndDate = new DateObject(new Date(end_date)).format() >= new DateObject(currentScheduleDay).format();
            return isAfterStartDate && isBeforeEndDate
        });

        const day = format(new DateObject(currentScheduleDay).format(), "EEEE");
        return schedule?.schedule?.filter((schedule) => schedule.day.toLowerCase() === day.toLowerCase());
    }, [schedules, currentScheduleDay])

    const shiftsBySkill = scheduleByDay ? _.groupBy(scheduleByDay, 'skill') : {}
    const allEmployeesNames = scheduleByDay ? _.groupBy(scheduleByDay, 'skill') : {}

    // console.log("data", schedules, days)
    // console.log("scheduleByDate", scheduleByDate)
    // console.log("scheduleByDay", scheduleByDay)
    // console.log("shiftsBySkill", shiftsBySkill)


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


    // Function to filter shifts by selected employee
    if (isLoading) {
        return <div>Loading...</div>
    }

    console.log("currentScheduleDay", currentScheduleDay)

    console.log("schedules", scheduleByDay)
    return (
        <div style={{ display: 'flex' }}>
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
                    <div style={{ padding: '24px', textAlign: 'center', flex: 1}}><b>No shifts for this day.</b> <br /> Please try to choose a different date.</div>}

            </div>
        </div>
    )
}