import { Button, Input } from "@mui/material"
import Papa from 'papaparse';
import { requiredHeaders } from "./headers";

const validateCSVHeaders = (data, type) => {
    const headers = Object.keys(data[0]);
    const missingHeaders = requiredHeaders[type].filter(header => !headers.includes(header));
    if (missingHeaders.length > 0) {
      alert(`Missing required headers in ${type}: ${missingHeaders.join(',')}`);
      return false;
    }
    return true;
  };

const readCSVFile = (file) =>  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
});

export const AddCSVFileButton = ({ name, setData }) => {

    const onFileUpload = async (e) => {
        const file = e.target.files[0];
        const content = await readCSVFile(file);
        const parsedData = Papa.parse(content, { header: true, skipEmptyLines: true }).data?.map((i, index)=> ({...i, _id: index}));
        if (validateCSVHeaders(parsedData, name)) {
            setData(name, parsedData);
        } else {
            alert('Invalid headers in Worker Requirements CSV.');
        }
    }

    return (
        <>
            <input type="file" id={name} accept=".csv" name={name} onChange={onFileUpload}/>
        </>
    )
}