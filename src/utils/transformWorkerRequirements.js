export const transformWorkerRequirementsData = (workerRequirementsData) => {
    if (!Array.isArray(workerRequirementsData) || !Array.isArray(workerRequirementsData[0])) {
      console.log("Data is already in the desired format:", workerRequirementsData);
      return workerRequirementsData; // Return data as it is if already in the desired format
    }
  
    return workerRequirementsData.map(row => ({
      day: row[0],
      skill: row[1],
      start: row[2],
      end: row[3],
      number_of_employ: parseInt(row[4], 10)
    }));
  }
