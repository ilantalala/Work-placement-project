import { Button, notification } from "antd";
import Papa from "papaparse";
import { UploadOutlined } from '@ant-design/icons';
import { useAppContext } from "../context/AppContext";
import { requiredHeaders } from "./headers";
import { useNavigate } from "react-router-dom";
import { useUploadCsv } from "../api/useUploadCsv";

export const UploadFilesToServer = ({ csvData }) => {
  const { currentUser } = useAppContext();
  const [api, contextHolder] = notification.useNotification();


  const { isError, mutate} = useUploadCsv({
    onSuccess: (data) => {
      console.log('Received data from server:', data);
      navigate('/placement-table');
    },
    onError: (error) => {
        api.error({
            message: 'Error uploading data to the server. Please try again.',
        });
    },
  }); 

  const navigate = useNavigate();

  const uploadFilesToServer = async () => {
    if (csvData.employeeSkill && csvData.workerRequirements && csvData.shiftBasket) {
        const employeeSkillContent = Papa.unparse({ fields: requiredHeaders.employeeSkill, data: csvData.employeeSkill });
        const workerRequirementsContent = Papa.unparse({ fields: requiredHeaders.workerRequirements, data: csvData.workerRequirements });
        const shiftBasketContent = Papa.unparse({ fields: requiredHeaders.shiftBasket, data: csvData.shiftBasket });

        mutate({
          currentUser,
          employeeSkillContent,
          workerRequirementsContent,
          shiftBasketContent,
        });
    } else {
        api.error({
            message: 'Please upload all three CSV files before uploading.',
        });
    }
  };

  if (!csvData) return null;
  return (
    <>
     {contextHolder}
        <Button style={{margin: '24px', position: 'fixed', bottom: 0, right: 0 }} onClick={uploadFilesToServer} type="primary" color="danger" shape="round" icon={<UploadOutlined />} size={"large"}>
        Create shifts
      </Button>
    </>
  );
};
