import React , { useState, useEffect } from 'react';
import { Layout, Card, Typography, Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, KeyOutlined, TeamOutlined, SmileOutlined } from '@ant-design/icons';
import {useRegister} from '../api/useRegister';

import './style.css';

const { Title, Text, Link } = Typography;
const { Content } = Layout;

export const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [companyName, setCompanyName] = useState('');

    const { mutate, isError, isPending } = useRegister({
        onError: (error) => {
          console.error('Error registering in:', error);
          setErrorMessage(error?.response?.data?.error || 'An error occurred while registering. Please try again.');
        }
    });

    
    const [errorMessage, setErrorMessage] = useState('');

        
const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Perform validation checks
    if (!username || !password || !confirmPassword || !displayName || !companyName) {
      return setErrorMessage('Please fill all the fields.');
    } 
    
    if (password !== confirmPassword) {
      return setErrorMessage('Passwords do not match.');
    } 
    if (password.length < 8) {
      return setErrorMessage('Password should be at least 8 characters long.');
    }
    
    if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      return setErrorMessage('Password should contain both letters and digits.');
    }
     
    mutate({ 
        username,
        password,
        displayName,
        companyName
     });
    };

    return (
        <Layout className="register">
            <Content className='register-content'>
                <Card 
                    rootClassName='register-card'
                    className="register-content"
                    bordered={false} 
                    bodyStyle={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '42px', width: "100%" }} 
                >
                    <Title level={1}>Register</Title>

                    <div className="register-inputs">
                        <Input 
                            value={username} 
                            onChange={(e)=> setUsername(e.target.value)} 
                            status={isError ? "error": null} 
                            size="large" 
                            placeholder="Username" 
                            prefix={<UserOutlined />}
                            width="100%"
                        />
                        <Input.Password 
                            value={password} 
                            onChange={(e)=> setPassword(e.target.value)} 
                            status={isError ? "error": null} 
                            size="large" 
                            placeholder="Password" 
                            prefix={<KeyOutlined />}
                            width="100%"

                        />
                        <Input.Password 
                            value={confirmPassword} 
                            onChange={(e)=> setConfirmPassword(e.target.value)} 
                            status={isError ? "error": null} 
                            size="large" 
                            placeholder="Confirm Password" 
                            prefix={<KeyOutlined />}
                        />
                        <Input 
                            value={companyName} 
                            onChange={(e)=> setCompanyName(e.target.value)} 
                            status={isError ? "error": null} 
                            size="large" 
                            placeholder="Company name" 
                            prefix={<TeamOutlined />}
                        />
                        <Input 
                            value={displayName} 
                            onChange={(e)=> setDisplayName(e.target.value)} 
                            status={isError ? "error": null} 
                            size="large" 
                            placeholder="Full name" 
                            prefix={<SmileOutlined />}
                        />
                    </div>

                    <Button block loading={isPending} type="submit" color="primary" size="large" variant="solid" onClick={handleSubmit} >
                        Register
                    </Button>

                    {errorMessage && <Text type="danger">{errorMessage}</Text>}

                    <div>
                        <Text> 
                            Already have an account? <Link onClick={() => navigate('/')}> Login </Link>
                        </Text>
                    </div>


                </Card>
            </Content>
        </Layout>
    )
}