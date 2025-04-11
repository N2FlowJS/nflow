import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Spin } from 'antd';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Auth check on route change
    authCheck();
  }, [isAuthenticated, loading, router.asPath]);

  function authCheck() {
    // If not authenticated and not loading, redirect to login
    if (!loading && !isAuthenticated) {
      router.push({
        pathname: '/auth/login',
        query: { returnUrl: router.asPath },
      });
    } else if (!loading && isAuthenticated) {
      setAuthorized(true);
    }
  }

  // Show loading indicator while checking auth status
  if (loading || !authorized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" tip="Authenticating..." />
      </div>
    );
  }

  // If authorized, render children
  return <>{children}</>;
}
