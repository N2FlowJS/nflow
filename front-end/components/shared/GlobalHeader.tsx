import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GitBranch, FolderOpen, ShieldCheck, LogOut, Activity } from 'lucide-react';
import { useAuthUser, useLogout } from '../ProtectedRoute';
import { apiService } from '../../lib/apiService';

export const GlobalHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useLogout();
  const user = useAuthUser() as { username?: string; email?: string } | null;

  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await apiService.get('/api/health');
        setIsOnline(response.ok);
      } catch {
        setIsOnline(false);
      }
    };
    const timer = setInterval(checkStatus, 30000);
    checkStatus();
    return () => clearInterval(timer);
  }, []);

  const currentPath = location.pathname;
  const isDashboardActive = currentPath === '/' || currentPath.startsWith('/flow/');
  const isSecretsActive = currentPath.startsWith('/secrets');

  return (
    <header className="sticky top-0 z-50 w-full bg-black/60 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      {/* Laser Top Glow Highlight */}
      <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${isOnline ? 'from-cyber-primary via-cyber-secondary to-cyber-primary' : 'from-red-500 via-orange-500 to-red-500'} opacity-80`} />

      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left Side: Branding */}
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className={`p-2 ${isOnline ? 'bg-cyber-primary/10 border-cyber-primary/20' : 'bg-red-500/10 border-red-500/20'} rounded-xl border relative`}>
            <div className={`absolute inset-0 ${isOnline ? 'bg-cyber-primary/25' : 'bg-red-500/25'} rounded-xl blur-sm opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />
            <GitBranch className={`${isOnline ? 'text-cyber-primary' : 'text-red-500'} relative drop-shadow-[0_0_3px_currentColor]`} size={18} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-widest uppercase text-white transition-colors group-hover:text-cyber-primary">
              n2<span className="text-cyber-primary">flow</span>
            </h1>
            <div className="flex items-center gap-1.5 -mt-0.5">
              <span className="text-[7px] text-cyber-muted font-mono tracking-[0.25em] uppercase">
                OPERATIONAL_AGENT_ORCHESTRATION
              </span>
              <div className="flex items-center gap-1 px-1 py-0.5 bg-white/[0.03] rounded border border-white/5">
                <span className={`h-1 w-1 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className={`text-[5px] font-bold uppercase tracking-tighter ${isOnline ? 'text-green-500/70' : 'text-red-500/70'}`}>
                  {isOnline ? 'Active' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Dynamic Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 px-1.5 py-1 rounded-xl">
          {/* Dashboard Tab */}
          <button
            onClick={() => navigate('/')}
            className={`relative px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono transition-all duration-300 ${
              isDashboardActive
                ? 'text-cyber-primary bg-cyber-primary/10 border border-cyber-primary/20 shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <FolderOpen size={12} className={isDashboardActive ? 'text-cyber-primary' : 'text-white/30'} />
              Dashboard
            </div>
            {isDashboardActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-cyber-primary rounded-full shadow-[0_0_6px_#00f0ff]" />
            )}
          </button>

          {/* Secret Vault Tab */}
          <button
            onClick={() => navigate('/secrets')}
            className={`relative px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono transition-all duration-300 ${
              isSecretsActive
                ? 'text-cyber-primary bg-cyber-primary/10 border border-cyber-primary/20 shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={12} className={isSecretsActive ? 'text-cyber-primary' : 'text-white/30'} />
              Secret Vault
            </div>
            {isSecretsActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-cyber-primary rounded-full shadow-[0_0_6px_#00f0ff]" />
            )}
          </button>
        </nav>

        {/* Right Side: Active Operator Info & Logout */}
        <div className="flex items-center gap-4">
          {/* User Profile Badge */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-xl font-mono text-[9px] select-none">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500 shadow-[0_0_6px_#22c55e]"></span>
              </span>
              <span className="text-white/40 uppercase tracking-widest font-black">Operator:</span>
              <span className="text-white font-bold tracking-wider">{user.username}</span>
            </div>
          )}

          {/* Logout Action */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl transition-all duration-200 font-mono text-[9px] uppercase tracking-widest font-black active:scale-95 hover:shadow-[0_0_12px_rgba(239,68,68,0.15)]"
          >
            <LogOut size={12} />
            Exit Session
          </button>
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;
