import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import _ from 'lodash';
import { format } from 'date-fns';
import { ScheduleTable } from './ScheduleTable';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';


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
    const [currentScheduleDate, setCurrentScheduleDate] = useState();
    const [choosenDay, setChoosenDay] = useState('Sunday');
    const [selectedEmployee, setSelectedEmployee] = useState("");

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
        return format(date, 'dd/MM/yyyy');
    });

    const scheduleByDate = schedules?.find((schedule) => {
        const date = new Date(schedule?.start_date);
        return format(date, 'dd/MM/yyyy') === currentScheduleDate;
    });


    const scheduleByDay = scheduleByDate?.schedule?.filter((schedule) => schedule.day === choosenDay);

    const shiftsBySkill = scheduleByDay ? _.groupBy(scheduleByDay, 'skill'): {}
    const allEmployeesNames = scheduleByDay ? _.groupBy(scheduleByDay, 'skill'): {}

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
    },[shiftsBySkill]);
    

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
    return (
        <div>

            <div>
                Choose date:
                {days.map((day) => <button
                    key={day}
                    onClick={() => setCurrentScheduleDate(day)}
                    style={{ backgroundColor: currentScheduleDate === day ? 'salmon' : 'white' }}>{day}</button>)}

            </div>

            { currentScheduleDate && <div>
                <div>
                
                    Pick day:
                    {daysOfWeek.map((day) =>
                        <button key={day} onClick={() => setChoosenDay(day)} style={{ backgroundColor: choosenDay === day ? 'salmon' : 'white' }}>
                        {day}
                        </button>)}

                </div>
                <div>
                    Filter by employee:
                    {/* <select value={selectedEmployee} onChange={handleEmployeeSelect}>
                        <option value="">Select Employee</option>
                        {uniqueEmployeeNames.map((employee) => (
                        <option key={employee} value={employee}>
                            {employee}
                        </option>
                        ))}
                    </select> */}

                    <Autocomplete
                    disablePortal
                    value={selectedEmployee}
                    onChange={(_, newValue) => {
                        setSelectedEmployee(newValue);
                    }}
                    options={uniqueEmployeeNames}
                    sx={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} label="employee" />}
                    />

                </div>
                {choosenDay && <div>
                        <ScheduleTable shiftsBySkill={filteredData}  />
                </div>}
            </div>}
        </div>
    )
}