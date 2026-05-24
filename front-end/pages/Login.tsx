import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, User, Eye, EyeOff, ShieldAlert } from 'lucide-react';
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
      <div className="min-h-screen bg-[#030303] cyber-grid cyber-scanlines flex items-center justify-center p-4">
        <div className="text-sm font-black uppercase tracking-[0.4em] text-cyber-primary animate-pulse flex items-center gap-2">
          <span className="w-2 h-2 bg-cyber-primary rounded-full animate-ping"></span>
          Establishing Secure Session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] cyber-grid cyber-scanlines flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Blurred Glow Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[15%] w-96 h-96 bg-cyber-primary/10 rounded-full blur-[120px] animate-pulse-glow"></div>
        <div className="absolute bottom-[10%] left-[15%] w-96 h-96 bg-cyber-secondary/15 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Glassmorphic Cyber Card */}
      <div className="relative z-10 w-full max-w-md animate-cyber-float">
        <div className="cyber-glass neon-glow-purple rounded-2xl p-8 border border-white/10 relative overflow-hidden bg-black/40 backdrop-blur-xl">
          {/* Futuristic top-bar highlight */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyber-primary via-cyber-secondary to-cyber-primary" />
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyber-primary to-cyber-secondary rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-black/60 border border-cyber-primary/30 p-3.5 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-cyber-primary drop-shadow-[0_0_4px_currentColor]" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
              n2<span className="text-cyber-primary">flow</span>
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-cyber-muted font-mono">
              {isLogin ? 'SECURE_GATEWAY_AUTHENTICATED' : 'PROVISION_NEW_OPERATOR_INTERFACE'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[11px] font-mono flex items-center gap-2">
              <ShieldAlert size={14} className="text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="operator@n2flow.ai"
              icon={Mail}
              required
              className="!bg-black/60 focus:!border-cyber-primary focus:!ring-1 focus:!ring-cyber-primary/20 text-white placeholder-white/20 transition-all font-mono"
            />

            {!isLogin && (
              <Input
                label="Operator Name"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="cyber_operator"
                icon={User}
                className="!bg-black/60 focus:!border-cyber-primary focus:!ring-1 focus:!ring-cyber-primary/20 text-white placeholder-white/20 transition-all font-mono"
              />
            )}

            <div className="relative">
              <Input
                label="Access Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                icon={Lock}
                required
                className="pr-10 !bg-black/60 focus:!border-cyber-primary focus:!ring-1 focus:!ring-cyber-primary/20 text-white placeholder-white/20 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[29px] text-white/30 hover:text-cyber-primary transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button 
              type="submit" 
              loading={loading} 
              className="mt-6 w-full py-2.5 bg-gradient-to-r from-cyber-primary to-cyber-primary/80 hover:from-cyber-primary hover:to-cyan-400 text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all transform active:scale-95"
            >
              {isLogin ? 'INITIALIZE GATEWAY' : 'PROVISION INTERFACE'}
            </Button>
          </form>

          {/* Toggle Form */}
          <div className="mt-6 text-center border-t border-white/5 pt-5">
            <p className="text-white/40 text-xs">
              {isLogin ? "No active operator interface?" : 'Access existing gateway?'}
              <Button
                variant="ghost"
                className="ml-1 text-cyber-primary hover:text-cyber-primary/80 hover:underline text-xs !px-1.5 !py-0.5 inline-block"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({ email: '', password: '', username: '' });
                }}
              >
                {isLogin ? 'REQUEST PROVISION' : 'SIGN IN PROTOCOL'}
              </Button>
            </p>
          </div>

          {/* Demo Info */}
          <div className="mt-5 p-3.5 bg-black/40 border border-white/5 rounded-xl text-[10px] text-white/40 font-mono">
            <p className="font-bold text-cyber-primary/80 uppercase tracking-widest mb-1.5">Default Gate Credentials:</p>
            <div className="flex justify-between border-b border-white/5 pb-1 mb-1">
              <span>Email:</span>
              <span className="text-white/60">demo@example.com</span>
            </div>
            <div className="flex justify-between">
              <span>Password:</span>
              <span className="text-white/60">demo12345</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
