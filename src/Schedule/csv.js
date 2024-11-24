import Papa from 'papaparse';
  
export const exportCSV = ({ data, filename }) => {
    const cleanData = data.map(({ id, assigned_employees, start_datetime, ...rest})=> ({
        id,
        ...rest, 
        assigned_employees: assigned_employees.filter((name)=> name !== 'Unfilled').join(', ') 
    }));
    const csvData = Papa.unparse(cleanData, {
        // Customizing the CSV output
        quotes: true, // Add quotes around fields that contain special characters
        delimiter: ',', // Delimiter for the CSV
        header: true, // Include the header row
        skipEmptyLines: true, // Skip empty lines if any
      });
  
    
    // Create a Blob with the CSV data
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.target = '_blank';
    link.download = filename || 'data.csv'; // default filename if not provided
    link.click(); // Trigger download
  };

