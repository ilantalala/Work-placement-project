import React, { useEffect, useRef,useState } from 'react';
import Chart from 'chart.js/auto';

function padTime(time) {
  return time.padStart(5, "0")
}
function textToColor(text) {
  let hash = 0;
  text.split('').forEach(char => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash)
  })
  let colour = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    colour += value.toString(16).padStart(2, '0')
  }
  return colour
}
// range(0,24)
// (24) [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
function range(from, untilInclusive) {
  const rangeSize = untilInclusive - from;
  return new Array(rangeSize).fill(from).map((item, index) => item + index);
}

// ["00:00", "00:30", "01:00", "01:30", ... , "23:30"]
const timeLabels = range(0, 24).flatMap(item => [padTime(`${item}:00`), padTime(`${item}:30`)])
// map [["00:00", "00:30"], ["01:00", "01:30"], ["02:00", "02:30"], ..., ["23:00", "23:30"]]
// flatMap ["00:00", "00:30", "01:00", "01:30", "02:00", "02:30", ..., "23:00", "23:30"]

function getWorkerRequirementsGraphData(workerRequirementsData) {
  const data = new Array(timeLabels.length).fill(0);

  workerRequirementsData.forEach((current) => {
    const index = timeLabels.indexOf(padTime(current.start_time));
    console.log({ index })
    data[index] += parseInt(current.number_of_employ);
  });

  return { data };
}
function getGraphData(dataFromCsv) {
  const datasetsPerSkill = {};

  dataFromCsv.forEach((row) => {
    const { start, end, skill, number_of_employ, day } = row;

    datasetsPerSkill[skill] ||= {
      label: skill,
      // when first encountering this skill, there is no y data yet so:
      // [0, 0, 0, 0] y
      // in parallel to ["07:00", "07:30", "8:00", "8:30"] x
      data: new Array(timeLabels.length).fill(0),
      backgroundColor: textToColor(skill),
      type: "bar"
    }

    // for each time (07:00, 07:30, 08:00, 08:30)
    timeLabels.forEach((timeLabel, timeLabelIndex) => {
      if (padTime(start) <= timeLabel &&
        padTime(end) >= timeLabel) {
        datasetsPerSkill[skill].data[timeLabelIndex] += number_of_employ
      }
    })
  });

  return { datasets: Object.values(datasetsPerSkill) };
}

function WorkerRequirementsChart({ workerRequirementsData, placementData }) {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  console.table(workerRequirementsData);
  console.table(placementData);

  useEffect(() => {
    if (workerRequirementsData.length > 0 && placementData.length > 0) {
      createChart();
    }
  }, [workerRequirementsData, placementData]);

  const createChart = () => {
    const { data } = getWorkerRequirementsGraphData(workerRequirementsData.filter(row => row.day === selectedDay));
    const { datasets } = getGraphData(placementData.filter(row => row.day === selectedDay));
    console.log(datasets);
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Ensure chart container reference exists
    if (!chartContainerRef.current) return;

    // Create a new Chart.js chart with the extracted data
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
            }
            , stacked: true
          },
          y: {
            title: {
              display: true,
              text: 'Number of Employees'
            }
            , stacked: true,
          }
        }
      }
    });
  };

  const [selectedDay, setSelectedDay] = useState('Sunday'); // State to track the selected day

  // Handler for when the selected day changes
  const handleDayChange = (event) => {
    setSelectedDay(event.target.value);
  };
  return (
    <div>
      <h1>Worker Requirements Chart</h1>
      <select value={selectedDay} onChange={handleDayChange}>
        <option value="Sunday">Sunday</option>
        <option value="Monday">Monday</option>
        <option value="Tuesday">Tuesday</option>
        <option value="Wednesday">Wednesday</option>
        <option value="Thursday">Thursday</option>
        <option value="Friday">Friday</option>
        <option value="Saturday">Saturday</option>
      </select>
      <canvas ref={chartContainerRef} id="worker-requirements-chart" width="800" height="400"></canvas>
    </div>)
}

export default WorkerRequirementsChart;


