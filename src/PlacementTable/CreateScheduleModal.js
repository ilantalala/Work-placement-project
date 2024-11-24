import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button, Switch } from 'antd';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DatePicker, { DateObject } from "react-multi-date-picker"
import { axiosInstance } from '../api/axios';
import "react-multi-date-picker/styles/layouts/mobile.css"

function getNextSunday() {
    const today = new Date();
    const dayOfWeek = today.getDay();  // 0 for Sunday, 6 for Saturday
    const daysUntilSunday = 7 - dayOfWeek;  // Calculate days to the next Sunday
    const nextSunday = new Date(today);
    
    nextSunday.setDate(today.getDate() + daysUntilSunday);  // Set the date to next Sunday
    
    return nextSunday;
  }
  
export const CreateScheduleModal = ({ children, currentUser }) => {
  const [checked, setChecked] = React.useState(false);
  const navigate = useNavigate();
  const {  mutate, isPending, isError } = useMutation({
    mutationFn: ({ startTime, endTime }) => axiosInstance.post(`/${currentUser}/schedule`, { date: [startTime, endTime], prioritize: checked }),
    onSuccess: (_, { startTime, endTime }) => {
      navigate(`/schedule?date=${new Date(startTime).toLocaleDateString()}`);
    },
    onError: () => {
      alert("Failed to create schedule. try again.");
    }
  });
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState([]);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onCreateSchedule = async() => {
    if (date.length !== 2) {
        alert("Please select a valid date range.");
    }
    const startTime = new Date(date[0]);
    const endTime = new Date(date[1]);
    
    // Reset the time to 00:00:00 for both start and end times
    startTime.setUTCHours(0, 0, 0, 0);
    endTime.setUTCHours(0, 0, 0, 0); 
    
    mutate({ startTime, endTime });
  }

  return (
    <React.Fragment>
      <div onClick={handleClickOpen}>
        {children}
      </div>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const email = formJson.email;
            console.log(email);
            handleClose();
          },
        }}
      >
        <DialogTitle>Create schedule</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please choose the week you want to create the schedule for.
          </DialogContentText>
          <DatePicker
            onChange={(date)=> setDate([date?.[0]?.toDate(), date?.[1]?.toDate()])}
           className="rmdp-mobile" range weekPicker  minDate={new DateObject(getNextSunday())} format="DD/MM/YYYY"/>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: "24px"}}>
            <span> Should prioritize day shifts?</span> <Switch checked={checked} onChange={(c)=> setChecked(c)} />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} size="large" >Close</Button>
          <Button disabled={!date?.length} loading={isPending} type="submit" color="primary" size="large" variant="solid" onClick={onCreateSchedule}>Create</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
