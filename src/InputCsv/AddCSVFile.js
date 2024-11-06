import Papa from 'papaparse';
import { requiredHeaders } from "./headers";
import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload } from 'antd';

const props = {};

  
const validateCSVHeaders = (data, type) => {
    const headers = Object.keys(data[0]);
    const missingHeaders = requiredHeaders[type].filter(header => !headers.includes(header));
    console.log(missingHeaders);
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

export const AddCSVFileButton = ({ name, setData, title }) => {

    const onFileChange = (info) => {
        console.log("info", info)
        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    }
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
            <input type="file" id={name} accept=".csv" name={name}  onChange={onFileUpload}/>
          {/* <Upload name={name} accept=".csv" onChange={onFileChange}  action={readCSVFile} {...props}>
            <Button icon={<UploadOutlined />}>{title}</Button>
        </Upload> */}
            {/* <label for={name} class="custom-button">Upload File</label> <!-- Custom button --> */}

        </>
    )
}