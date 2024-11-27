import React, { useState, useMemo } from 'react';
import {
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  SmileFilled
} from '@ant-design/icons';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { CalendarTwoTone} from '@ant-design/icons';
import { Login } from './Login';
import { Profile } from './Profile';
import { Register } from './Register';
import ShiftsView from './ShiftsView/ShiftsView';
import WorkerRequirementsChart from './WorkerRequirementsChart/WorkerRequirementsChart';
import { FileManager } from './FileManager/FileManager';
import { ViewSchedule } from './Schedule/ViewSchedule';
import { useAppContext } from './context/AppContext';

const { Sider } = Layout;

const getItem = (label, key, icon, children) => ({ key, icon, children, label });

const items = [
  getItem('Shifts', 'sub1', <PieChartOutlined />, [
    getItem('Create new', '/'),
    getItem('Edit existing', '/shifts-view'),
    getItem('View chart', '/worker-requirements-chart'),
  ]), // { key: 'sub1', icon: <PieChartOutlined />, children: [ ... ] }
  getItem('View schedule', '/schedule', <TeamOutlined />),
  getItem('Logout', '/logout', <UserOutlined />),
];

export const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { currentUser, logout } = useAppContext();

  const onMenuClick = ({ key }) => {
    if (key === '/logout') {
      return logout();
    }
    navigate(key);
  }

  const menuItems = useMemo(()=> {
    return [
      getItem(`Welcome, ${currentUser}!`, '/profile', <SmileFilled />),
       ...items
    ]
  }, [currentUser])

  // If the user is not logged in
  if (!currentUser) {
    return (
    <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
    </Routes>
    );
  }

  const logoStyle = { display: 'flex', gap: '12px', padding: '8px', color: 'white', fontSize: "22px",  fontFamily: 'serif', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flexStart'};
  //  If the user is logged in (if there's a curentUser)
  return (
    <Layout style={{ minHeight: '100vh' }} >
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={logoStyle}>
          <CalendarTwoTone  color="red" twoToneColor="#5a54f9" style={{ fontSize: "32px" , }} />
          {!collapsed &&  "ShiftAssign"}
        </div>
        <Menu 
          theme="dark" 
          selectedKeys={[pathname]} 
          defaultSelectedKeys={['/']} 
          mode="inline" 
          onClick={onMenuClick} 
          items={menuItems}
        />

      </Sider>
      <Layout style={{ padding: '16px'}}> 
        <Routes>
            <Route path="/" element={<FileManager />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/shifts-view" element={<ShiftsView />} />
            <Route path="/worker-requirements-chart" element={<WorkerRequirementsChart />} />
            <Route path="/schedule" element={<ViewSchedule />} />
            <Route path="*" element={<div>404 page not found</div>} />
        </Routes>
      </Layout>
    </Layout>
  );
};