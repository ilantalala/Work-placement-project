import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { ConfigProvider } from 'antd';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './layout';
import './index.css';

const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConfigProvider  // Provider for ant's design
        theme={{
          token: {
            colorPrimary: '#5A54F9', // purple
            borderRadius: 2,
          },
        }}
      >
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <AppProvider>
              <AppLayout />
            </AppProvider>
          </QueryClientProvider>
        </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
