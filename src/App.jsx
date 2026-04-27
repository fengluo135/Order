import React, { useState } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import HomePage from './pages/HomePage';
import ResultPage from './pages/ResultPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [travelData, setTravelData] = useState(null);

  const navigateTo = (page, data = null) => {
    setCurrentPage(page);
    if (data) {
      setTravelData(data);
    }
  };

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 4,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      }}
    >
      {currentPage === 'home' ? (
        <HomePage onSubmit={(data) => navigateTo('result', data)} />
      ) : (
        <ResultPage travelData={travelData} onBack={() => navigateTo('home')} />
      )}
    </ConfigProvider>
  );
}

export default App;