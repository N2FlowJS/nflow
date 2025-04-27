import { Card, Button } from 'antd';
import React from 'react';
import Image from 'next/image';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import LanguageMenu from './LanguageMenu';
import styles from './AuthLayout.module.css';
import { useTheme } from '../../theme';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`${styles.authContainer} ${theme === 'dark' ? styles.darkMode : ''}`}>
      <div className={styles.backgroundPattern} />
      <div className={styles.contentWrapper}>
        <Card className={`${styles.authCard} ${theme === 'dark' ? styles.darkCard : ''}`}>
          <div className={styles.headerControls}>
            <div className={styles.controlsGroup}>
              <Button
                type="text"
                icon={theme === 'light' ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggleTheme}
                className={styles.controlButton}
              />
              <div className={styles.divider} />
              <LanguageMenu className={styles.controlButton} />
            </div>
          </div>

          <div className={styles.cardContent}>
            <Image
              src={theme === 'dark' ? '/n-flow-light.png' : '/n-flow.png'}
              alt={title}
              width={256}
              height={64}
              className={styles.logo}
              priority
              style={{ objectFit: 'contain' }}
            />
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
            
            <div className={styles.formWrapper}>
              {children}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuthLayout;
