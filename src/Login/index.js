import React , { useState, useEffect } from 'react';
import { Layout, Card, Typography, Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, KeyOutlined } from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import {useLogin} from '../api/useLogin';

import './style.css';

const { Title, Text, Link } = Typography;
const { Content } = Layout;

export const Login = () => {
    const { currentUser } = useAppContext();
    const navigate = useNavigate();

    const { mutate, isError, isPending } = useLogin({
        onError: (error) => {
          console.error('Error logging in:', error);
          setErrorMessage(error?.response?.data?.error || 'An error occurred while logging in. Please try again.');
        }
      });

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    useEffect(()=> {
        if (currentUser) {
          navigate('/inputCSV');
        }
      }, [currentUser])
    
      const handleSubmit = async (e) => {
        e.preventDefault();
      
        console.log({ username, password})
        if (!username || !password) {
          return setErrorMessage('Please fill all fields.');
        } 
        await mutate({ username, password });
    };

    return (
        <Layout className="login">
            <Content className='login-content'>
                <Card 
                    rootClassName='login-card'
                    className="card-content"
                    bordered={false} 
                    bodyStyle={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '42px' }} 
                >
                    <Title level={1}>Login</Title>

                    <div className="card-inputs">
                        <Input 
                            value={username} 
                            onChange={(e)=> setUsername(e.target.value)} 
                            status={isError ? "error": null} 
                            size="large" 
                            placeholder="Username" 
                            prefix={<UserOutlined />}
                        />
                        <Input.Password 
                            value={password} 
                            onChange={(e)=> setPassword(e.target.value)} 
                            status={isError ? "error": null} 
                            size="large" 
                            placeholder="Password" 
                            prefix={<KeyOutlined />}
                        />
                    </div>

                    <Button block loading={isPending} type="submit" color="primary" size="large" variant="solid" onClick={handleSubmit} >
                        Login
                    </Button>

                    {errorMessage && <Text type="danger">{errorMessage}</Text>}

                    <div>
                        <Text> 
                            Don't have an account? <Link onClick={() => navigate('/register')}> Sign up </Link>
                        </Text>
                    </div>


                </Card>
            </Content>
        </Layout>
    )
}