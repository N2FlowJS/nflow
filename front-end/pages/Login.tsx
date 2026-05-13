import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import { bootstrapAuthSession, setAuthSession } from '../lib/api';
import { apiService } from '../lib/apiService';
import { Input, Button } from '../components/ui';

interface AuthFormData {
  email: string;
  password: string;
  username?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = (location.state as any)?.from?.pathname || '/';
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    username: '',
  });

  useEffect(() => {
    let isMounted = true;

    const bootstrapLoginSession = async () => {
      const session = await bootstrapAuthSession();

      if (!isMounted) {
        return;
      }

      if (session.authenticated) {
        navigate(redirectPath, { replace: true });
        return;
      }

      setCheckingSession(false);
    };

    void bootstrapLoginSession();

    return () => {
      isMounted = false;
    };
  }, [navigate, redirectPath]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const email = formData.email.trim();
      const username = formData.username?.trim();
      const payload = isLogin
        ? { email, password: formData.password }
        : {
            email,
            username: username || email.split('@')[0],
            password: formData.password,
          };

      const result = await apiService.post(endpoint, payload);

      if (!result.ok) {
        setError(result.error || 'Authentication failed');
        return;
      }

      if (!result.token || !result.user) {
        setError('Authentication response is missing session data');
        return;
      }

      setAuthSession(result.token, result.user);

      // Redirect to previous page or home
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-sm uppercase tracking-[0.3em] text-cyan-400">Checking Session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-cyan-500 to-purple-500 p-3 rounded-lg">
                <Lock className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">n2flow</h1>
            <p className="text-slate-400">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              icon={Mail}
              required
            />

            {!isLogin && (
              <Input
                label="Username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="username"
                icon={User}
              />
            )}

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                icon={Lock}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[32px] text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button type="submit" loading={loading} className="mt-6">
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Toggle Form */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <Button
                variant="ghost"
                className="ml-1"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({ email: '', password: '', username: '' });
                }}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Button>
            </p>
          </div>

          {/* Demo Info */}
          <div className="mt-6 p-3 bg-slate-900/50 border border-slate-700/50 rounded text-xs text-slate-400">
            <p className="font-semibold text-slate-300 mb-1">Demo Credentials:</p>
            <p>Email: demo@example.com</p>
            <p>Password: demo12345</p>
          </div>
        </div>
      </div>
    </div>
  );
}
