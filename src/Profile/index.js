import React from 'react';
import { useGetCurrentUserData } from '../api/useGetCurrentUserData';
import { Avatar, Descriptions } from 'antd';
import { UserOutlined } from '@ant-design/icons';

export const Profile = () => {
  const { data } = useGetCurrentUserData()

  const items = [
    {
      key: '1',
      label: 'Username',
      children: data?.username,
    },
    {
      key: '2',
      label: 'Full name',
      children: data?.display_name,
    },
    {
      key: '3',
      label: 'Company name',
      children: data?.company_name,
    },
  ];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '24px' }}>
        <Avatar size={64} icon={<UserOutlined />} />

        <h1>Profile</h1>
      </div>
      <Descriptions title="User Info" bordered items={items} layout="vertical" />

    </div>
  )
}