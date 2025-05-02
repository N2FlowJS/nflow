import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export default function Loading() {
  const antIcon = <LoadingOutlined style={{ fontSize: 40 }} spin />;
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'rgba(255, 255, 255, 0.9)',
    }}>
      <Spin indicator={antIcon} />
      <div style={{
        marginTop: 16,
        fontSize: '16px',
        color: '#1890ff',
        fontWeight: 500,
      }}>
        Loading...
      </div>
    </div>
  );
}