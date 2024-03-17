import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

function WorkerRequirementsChart({ workerRequirementsData, placementData }) {
    const chartContainerRef = useRef(null);
    const chartInstanceRef = useRef(null);
  
    useEffect(() => {
      if (workerRequirementsData.length > 0 && placementData.length > 0) {
        createChart();
      }
    }, [workerRequirementsData, placementData]);

    const createChart = () => {
      const labels = []; // Array to store x-axis labels (hours of the day)
      const workerRequirements = []; // Array to store total workers required at each hour
      const employeePlacement = []; // Array to store employee placement intervals
  
      workerRequirementsData.forEach(entry => {
        // Ensure start_time is defined before splitting
        if (entry.start_time) {
            // Extract the hour from the entry's start_time or end_time and add it to labels
            const hour = parseInt(entry.start_time.split(':')[0]); // Extract hour from start_time
            labels.push(`${hour}:00`);
    
            // Add the number of workers required to workerRequirements
            workerRequirements.push(parseInt(entry.number_of_employees)); // Convert to integer
        }
    });    
      placementData.forEach(entry => {
        // Extract the hour from the entry's timestamp and add it to employeePlacement
        const hour = new Date(entry.timestamp).getHours();
        employeePlacement.push({ hour, numEmployees: entry.numEmployees });
      });
  
      // Perform calculations to determine total workers required and employee placement intervals
      // For simplicity, let's assume we calculate total workers required as the sum of workerRequirements
      const totalWorkersRequired = workerRequirements.reduce((acc, curr) => acc + curr, 0);
  
      // If chart instance already exists, destroy it first
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Ensure chart container reference exists
      if (!chartContainerRef.current) return;
  
      // Create a new Chart.js chart with the extracted data
      const ctx = chartContainerRef.current.getContext('2d');
      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Total Workers Required',
              data: workerRequirements,
              borderColor: 'blue',
              backgroundColor: 'rgba(0, 0, 255, 0.1)',
              fill: true
            },
            {
              label: 'Employee Placement',
              data: employeePlacement.map(entry => entry.numEmployees),
              borderColor: 'green',
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              fill: false
            }
          ]
        },
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: 'Hours of the Day'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Number of Employees'
              }
            }
          }
        }
      });
    };

    return (
      <div>
        <h1>Worker Requirements Chart</h1>
        <canvas ref={chartContainerRef} id="worker-requirements-chart" width="800" height="400"></canvas>
      </div>
    );
}

export default WorkerRequirementsChart;
