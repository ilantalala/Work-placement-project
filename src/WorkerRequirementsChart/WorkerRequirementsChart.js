import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import { transformWorkerRequirementsData } from '../utils/transformWorkerRequirements';

function padTime(time) {
  return time.padStart(5, "0");
}

function textToColor(text) {
  let hash = 0;
  text.split('').forEach(char => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += value.toString(16).padStart(2, '0');
  }
  return color;
}

// range[0,24)
function range(from, untilInclusive) {
  const rangeSize = untilInclusive - from;
  return new Array(rangeSize).fill(from).map((item, index) => item + index);
}

// ["00:00", "00:30", "01:00", "01:30", ... , "23:30"]
const timeLabels = range(0, 24).flatMap(item => [padTime(`${item}:00`), padTime(`${item}:30`)]);
// map [["00:00", "00:30"], ["01:00", "01:30"], ["02:00", "02:30"], ..., ["23:00", "23:30"]]
// flatMap ["00:00", "00:30", "01:00", "01:30", "02:00", "02:30", ..., "23:00", "23:30"]


function getWorkerRequirementsGraphData(workerRequirementsData, selectedDay, selectedSkill) {
  const filteredData = workerRequirementsData.filter(row => row.day === selectedDay && row.skill === selectedSkill);
  const data = new Array(timeLabels.length).fill(0);
  filteredData.forEach((current) => {
    const index = timeLabels.indexOf(padTime(current.start_time));
    data[index] += parseInt(current.number_of_employ);
  });

  return { data };
}

function getGraphData(dataFromCsv, selectedDay, selectedSkills) {
  const datasetsPerSkill = {};

  dataFromCsv.forEach((row) => {
    const { start, end, skill, number_of_employ, day } = row;

    if (selectedSkills.length === 0 || selectedSkills.includes(skill)) {
      if (day === selectedDay) {
        datasetsPerSkill[skill] ||= {
          label: skill,
          data: new Array(timeLabels.length).fill(0),
          backgroundColor: textToColor(skill),
          type: "bar"
        };

        timeLabels.forEach((timeLabel, timeLabelIndex) => {
          if (padTime(start) <= timeLabel && padTime(end) >= timeLabel) {
            datasetsPerSkill[skill].data[timeLabelIndex] += number_of_employ;
          }
        });
      }
    }
  });

  return { datasets: Object.values(datasetsPerSkill) };
}


function WorkerRequirementsChart({ placementData, currentUser }) {
  const [workerRequirementsData, setWorkerRequirementsData]= useState([]);
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [selectedDay, setSelectedDay] = useState('Sunday');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);

  useEffect(() => {
    if (currentUser) {
      axios.get(`http://localhost:5000/api/${currentUser}/get_initial_data`)
      .then(({ data })=> {
        const workerRequirements = data.find((item)=> item.type === 'worker_requirements')?.data;
        if (workerRequirements) {
          setWorkerRequirementsData(transformWorkerRequirementsData(workerRequirements));
        } else {
          alert("Missing worker requirements data");
        }
      }).catch((err)=> {
        console.log("Error while trying to get existing user data...", err)
      })
    }
  }, [currentUser]);

  // Update allSkills when placementData changes or selectedDay changes
  useEffect(() => {
    if (placementData && placementData.length > 0) {
      const filteredSkills = [...new Set(placementData.filter(row => row.day === selectedDay).map(row => row.skill))];
      setAllSkills(filteredSkills);
    }
  }, [placementData, selectedDay]);

  // Watch for changes in selectedDay
  const handleDayChange = (event) => {
    setSelectedDay(event.target.value);
  };

  // Watch for changes in selected skills
  const handleSkillChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
    setSelectedSkills(selectedOptions);
  };

  useEffect(() => {
    if (workerRequirementsData && placementData && workerRequirementsData.length > 0 && placementData.length > 0) {
      createChart();
    }
  }, [workerRequirementsData, placementData, selectedDay, selectedSkills]);

  const createChart = () => {
    if (!workerRequirementsData || !placementData) {
      console.error('workerRequirementsData or placementData is null or undefined');
      return;
    }
    const { data } = getWorkerRequirementsGraphData(workerRequirementsData, selectedDay, selectedSkills);
    const { datasets } = getGraphData(placementData, selectedDay, selectedSkills);

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    if (!chartContainerRef.current) return;

    const ctx = chartContainerRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      data: {
        labels: timeLabels,
        datasets: [
          {
            label: 'Total Workers Required',
            type: 'line',
            data,
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 255, 0.1)',
            fill: false
          },
          ...datasets
        ]
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Hours of the Day'
            },
            stacked: true
          },
          y: {
            title: {
              display: true,
              text: 'Number of Employees'
            },
            stacked: true
          }
        }
      }
    });
  };
  
  return (
    <div>
      <h1>Worker Requirements Chart</h1>
      <div>
        <label htmlFor="day">Select Day: </label>
        <select value={selectedDay} onChange={handleDayChange}>
          <option value="Sunday">Sunday</option>
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
          <option value="Saturday">Saturday</option>
        </select>
      </div>
      <div>
        <label htmlFor="skills">Select Skills: </label>
        <select value={selectedSkills} onChange={handleSkillChange} >
        {allSkills.map((skill, index) => (
        <option key={index} value={skill}>{skill}</option>
        ))}
        </select>
      </div>
      <canvas ref={chartContainerRef} id="worker-requirements-chart" width="800" height="400"></canvas>
    </div>
  );
  
}

export default WorkerRequirementsChart;