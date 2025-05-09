import { Card, Button } from 'antd';
import React from 'react';
import Image from 'next/image';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import LanguageMenu from './LanguageMenu';
import { useTheme } from '../../theme';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const { theme, toggleTheme } = useTheme();
  
  const styles = {
    authContainer: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: theme === 'dark' 
        ? 'linear-gradient(135deg, #111827 0%, #1f2937 100%)' 
        : 'linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)',
      position: 'relative' as const,
      overflow: 'hidden',
    },
    backgroundPattern: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(circle at 100% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
      animation: 'patternMove 30s linear infinite',
    },
    contentWrapper: {
      width: '100%',
      maxWidth: '480px',
      margin: '20px',
      position: 'relative' as const,
      zIndex: 1,
      animation: 'fadeIn 0.6s ease-out',
    },
    authCard: {
      background: theme === 'dark' 
        ? 'rgba(17, 24, 39, 0.95)' 
        : 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(12px)',
      borderRadius: '32px',
      border: theme === 'dark' 
        ? '1px solid rgba(255, 255, 255, 0.08)' 
        : '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.08), 0 8px 20px -5px rgba(0, 0, 0, 0.06)',
      padding: '48px',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    headerControls: {
      position: 'absolute' as const,
      top: '16px',
      right: '16px',
      zIndex: 10,
    },
    controlsGroup: {
      display: 'flex',
      alignItems: 'center',
      background: theme === 'dark' 
        ? 'rgba(17, 24, 39, 0.8)' 
        : 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(8px)',
      borderRadius: '12px',
      padding: '4px',
      border: theme === 'dark' 
        ? '1px solid rgba(255, 255, 255, 0.1)' 
        : '1px solid rgba(0, 0, 0, 0.05)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    },
    controlButton: {
      padding: '8px 12px',
      height: '36px',
      border: 'none',
      background: 'transparent',
      transition: 'all 0.2s ease',
      color: theme === 'dark' ? '#e2e8f0' : 'inherit',
    },
    divider: {
      width: '1px',
      height: '20px',
      background: theme === 'dark' 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.1)',
      margin: '0 4px',
    },
    cardContent: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      color: theme === 'dark' ? '#e2e8f0' : 'inherit',
    },
    logo: {
      filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
      transform: 'scale(1)',
      transition: 'transform 0.3s ease',
      objectFit: 'contain' as const,
      marginBottom: '24px',
    },
    title: {
      fontSize: '38px',
      fontWeight: 800,
      background: 'linear-gradient(135deg, #4338ca 0%, #3b82f6 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '16px',
      letterSpacing: '-0.5px',
    },
    subtitle: {
      fontSize: '17px',
      color: theme === 'dark' ? '#a0aec0' : '#6b7280',
      marginBottom: '40px',
      lineHeight: 1.6,
    },
    formWrapper: {
      marginTop: '24px',
    },
  };

  // Global styles need to be added to the document
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes patternMove {
        0% { background-position: 0 0; }
        100% { background-position: 1000px 1000px; }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @media (max-width: 480px) {
        .responsive-content { margin: 16px; }
        .responsive-card { padding: 24px; }
        .responsive-title { font-size: 28px; }
        .responsive-subtitle { font-size: 14px; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={styles.authContainer}>
      <div style={styles.backgroundPattern} />
      <div style={styles.contentWrapper} className="responsive-content">
        <Card style={styles.authCard} className="responsive-card" bordered={false}>
          <div style={styles.headerControls}>
            <div style={styles.controlsGroup}>
              <Button
                type="text"
                icon={theme === 'light' ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggleTheme}
                style={styles.controlButton}
              />
              <div style={styles.divider} />
              <LanguageMenu />
            </div>
          </div>

          <div style={styles.cardContent}>
            <Image
              src={theme === 'dark' ? '/n-flow-light.png' : '/n-flow.png'}
              alt={title}
              width={256}
              height={64}
              style={styles.logo}
              priority
            />
            <h1 style={styles.title} className="responsive-title">{title}</h1>
            <p style={styles.subtitle} className="responsive-subtitle">{subtitle}</p>
            
            <div style={styles.formWrapper}>
              {children}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuthLayout;
