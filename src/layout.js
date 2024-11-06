import React, { useState, useMemo } from 'react';
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  SmileFilled
} from '@ant-design/icons';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import { CalendarTwoTone} from '@ant-design/icons';
import { Login } from './Login';
import { Profile } from './Profile';
import { Register } from './Register';
import RegisterCard from './registerCard/RegisterCard';
import InputCSV from './InputCsv/InputCSV';
import PlacementTable from './PlacementTable/PlacementTable';
import WorkerRequirementsChart from './WorkerRequirementsChart/WorkerRequirementsChart';
import Logout from './Logout/Logout';
import { FileManager } from './InputCsv/FileManager';
import { ViewSchedule } from './Schedule/ViewSchedule';
import { useAppContext } from './context/AppContext';

const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items = [
  getItem('Shifts', 'sub1', <PieChartOutlined />, [
    getItem('Create new', '/'),
    getItem('Edit existing', '/placement-table'),
    getItem('View chart', '/worker-requirements-chart'),
  ]),
  getItem('View schedule', '/schedule', <TeamOutlined />),
  getItem('Logout', '/logout', <UserOutlined />),

];

export const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { currentUser, logout } = useAppContext();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const onMenuClick = ({ item, key, keyPath, domEvent }) => {
    if (key === '/logout') {
      return logout();
    }
    navigate(key);
  }

  const menuItems = useMemo(()=> {
    return [getItem(`Welcome, ${currentUser}!`, '/profile', <SmileFilled />), ...items]
  }, [currentUser])

  if (!currentUser) {
    return (
    <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
    </Routes>
    );
  }
  return (
    <Layout
      style={{
        minHeight: '100vh',
      }}
    >
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ display: 'flex', gap: '12px', padding: '8px', color: 'white', fontSize: "22px",  fontFamily: 'serif', alignItems: 'center'}}>
          <CalendarTwoTone  color="red" twoToneColor="#5a54f9" style={{ fontSize: "32px" , }} />
          ShiftAssign
        </div>
        <Menu theme="dark" defaultSelectedKeys={['/']} mode="inline" onClick={onMenuClick} items={menuItems} />

      </Sider>
      <Layout style={{ padding: '16px'}}>
        <Routes>
            <Route path="/" element={<FileManager />} />
            <Route path="/profile" element={<Profile />} />

            <Route path="/schedule" element={<ViewSchedule />} />
            <Route path="/oldInputCsv" element={<InputCSV />} />
            <Route path="/placement-table" element={<PlacementTable />} />
            <Route path="/worker-requirements-chart" element={<WorkerRequirementsChart />} />
        </Routes>
      </Layout>
    </Layout>
  );
};