import React, { useEffect, useRef, useState } from 'react';
import { DAYS_OF_WEEK } from '../consts';
import Chart from 'chart.js/auto';
import { useGetShifts } from '../api/useGetShifts';
import { useGetCsvData } from '../api/useGetCsvData';
import { Checkbox, Select } from 'antd';
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
  const filteredData = workerRequirementsData.filter(row => row.day === selectedDay && selectedSkill.includes(row.skill));
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
    const { start_time: start, end_time: end, skill, number_of_employee: number_of_employ, day } = row;

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


function WorkerRequirementsChart() {
  const { data, isLoading: loading } = useGetShifts();
  const { csvData = {} } = useGetCsvData(); // { employeeSkill, workerRequirements, shiftBasket } 
  const { workerRequirements: workerRequirementsData } = csvData;
  const placementData = data?.data;

  
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [selectedDay, setSelectedDay] = useState('Sunday');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);

  useEffect(() => {
    if (placementData && placementData.length > 0) {
      const filteredSkills = [...new Set(placementData.filter(row => row.day === selectedDay).map(row => row.skill))];
      setAllSkills(filteredSkills);
      if (filteredSkills && filteredSkills.length > 0) {
        setSelectedSkills(filteredSkills)
      }
    }
  }, [placementData, selectedDay]);

  useEffect(() => {
    if (selectedSkills && workerRequirementsData && placementData && workerRequirementsData.length > 0 && placementData.length > 0) {
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
        <p htmlFor="day"><b>Select Day: </b></p>
        <Select
          value={selectedDay}
          style={{ width: 120 }}
          onChange={setSelectedDay}
          options={DAYS_OF_WEEK.map((v) => ({ value: v, label: v }))}
        />

      </div>
      <div style={{ padding: '10px 0px' }}>
        <p htmlFor="skills"><b>Select Skills: </b></p>
        <Checkbox.Group value={selectedSkills} options={allSkills.map((i) => ({ label: i, value: i }))} defaultValue={['Apple']} onChange={setSelectedSkills} />
      </div>
      <canvas ref={chartContainerRef} id="worker-requirements-chart" width="800" height="400"></canvas>
    </div>
  );

}

export default WorkerRequirementsChart;