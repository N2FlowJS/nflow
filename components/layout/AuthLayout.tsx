import { Card } from 'antd';
import React from 'react';
import Image from 'next/image';
import LanguageMenu from './LanguageMenu';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className={styles.authContainer}>
      <div className={styles.backgroundPattern} />
      <div className={styles.contentWrapper}>
        <Card className={styles.authCard}>
          <div style={{ textAlign: 'center' }}>
            <Image
              src="/n-flow.png"
              alt={title}
              width={256}
              height={64}
              className={styles.logo}
            />
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>

          <div className={styles.formWrapper}>
            {children}
          </div>

          <div style={{ position: 'absolute', top: 16, right: 16 }}>
            <LanguageMenu />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuthLayout;
