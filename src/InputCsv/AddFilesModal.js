import { useState } from "react";
import { Button } from "antd";
import { AddCSVFileButton } from "./AddCSVFile";
import { DownloadOutlined } from '@ant-design/icons';

import { Dialog, DialogContent, DialogTitle } from "@mui/material";

export const AddFilesModal = ({ setCsvData }) => {
  const [open, setIsOpen] = useState(false);
  const [tempData, setTemp] = useState({});

  const setTempData = (key, value) => {
    setTemp(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Button style={{margin: '24px'}} onClick={() => setIsOpen(true)} type="primary" shape="round" icon={<DownloadOutlined />} size={"large"}>
        Add All files at once
      </Button>

      <Dialog onClose={() => setIsOpen(false)} open={open}>
        <DialogTitle>Upload your files</DialogTitle>
        <DialogContent>
          <p>Add your employee skills:</p>
          <AddCSVFileButton name="employeeSkill" setData={setTempData} />

          <p>Add your worker Requirements:</p>
          <AddCSVFileButton name="workerRequirements" setData={setTempData} />

          <p>Add your shift Basket:</p>
          <AddCSVFileButton name="shiftBasket" setData={setTempData} />

          <Button variant="contained" color="success" onClick={() => {
            setCsvData(tempData);
            setIsOpen(false);
          }}>
            Display tables
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
