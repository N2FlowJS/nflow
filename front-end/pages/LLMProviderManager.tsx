import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Cpu,
  Check,
  X,
  Trash2,
  Edit2,
  Globe,
  Key,
  Zap,
  Activity,
  Server
} from 'lucide-react';
import { apiService } from '../lib/apiService';
import { Input } from '../components/ui';
import { CyberPanel, CyberAction, CyberBadge, StatusBadge } from '../components/shared/CyberUI';
import { GlobalHeader } from '../components/shared/GlobalHeader';

interface LLMProvider {
  id: string;
  name: string;
  provider: string;
  baseUrl?: string;
  apiKey?: string;
  createdAt: string;
}

interface ProviderInput {
  name: string;
  provider: string;
  baseUrl: string;
  apiKey: string;
}

const PROVIDER_TYPES = [
  { label: 'OpenAI', value: 'OpenAI' },
  { label: 'Anthropic', value: 'Anthropic' },
  { label: 'Google GenAI', value: 'Google' },
  { label: 'NVIDIA NIM', value: 'NVIDIA' },
  { label: 'Ollama (Local)', value: 'Ollama' },
  { label: 'Groq', value: 'Groq' },
  { label: 'Mistral', value: 'Mistral' },
  { label: 'Custom OpenAI Compatible', value: 'Custom' },
];

const LLMProviderManager: React.FC = () => {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProviderInput>({
    name: '',
    provider: 'OpenAI',
    baseUrl: '',
    apiKey: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/llm-providers');
      if (response.ok) {
        setProviders(response.data || []);
        setError(null);
      } else {
        setError(response.error || 'Failed to load providers');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: '', provider: 'OpenAI', baseUrl: '', apiKey: '' });
    setShowModal(true);
  };

  const handleEditProvider = (provider: LLMProvider) => {
    setIsEditing(true);
    setEditingId(provider.id);
    setFormData({
      name: provider.name,
      provider: provider.provider,
      baseUrl: provider.baseUrl || '',
      apiKey: '', // Security: don't prefill
    });
    setShowModal(true);
  };

  const handleSaveProvider = async () => {
    try {
      if (!formData.name.trim() || !formData.provider) {
        setError('Name and Provider Type are required');
        return;
      }

      let response;
      if (isEditing && editingId) {
        response = await apiService.patch(`/api/llm-providers/${editingId}`, formData);
      } else {
        response = await apiService.post('/api/llm-providers', formData);
      }

      if (response.ok) {
        setSuccess(isEditing ? 'Provider updated' : 'Provider created');
        setTimeout(() => setSuccess(null), 3000);
        loadProviders();
        setShowModal(false);
      } else {
        setError(response.error || 'Failed to save provider');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save provider');
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;
    try {
      const response = await apiService.delete(`/api/llm-providers/${id}`);
      if (response.ok) {
        loadProviders();
      } else {
        setError(response.error || 'Failed to delete provider');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete provider');
    }
  };

  const handleTestConnection = async (id: string) => {
    try {
      setTestingId(id);
      setError(null);
      const response = await apiService.post(`/api/llm-providers/${id}/test`, {});
      if (response.ok) {
        setSuccess(`Connection successful! Found ${response.models?.length || 0} models.`);
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(response.error || 'Connection failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setTestingId(null);
    }
  };

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#030303] cyber-grid cyber-scanlines text-white relative overflow-hidden font-sans selection:bg-cyber-primary/30">
      <GlobalHeader />

      <div className="max-w-6xl mx-auto p-6 space-y-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyber-primary/10 rounded-xl border border-cyber-primary/30 text-cyber-primary shadow-[0_0_8px_rgba(34,211,238,0.12)]">
                <Cpu size={28} />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
                LLM <span className="text-cyber-primary">Providers</span>
              </h1>
            </div>
            <p className="text-gray-500 text-sm font-medium ml-1">
              Configure and test your AI model providers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-64">
              <Input
                icon={Search}
                placeholder="Find a provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/40 border-white/10"
              />
            </div>
            <CyberAction
              icon={Plus}
              label="Add Provider"
              onClick={handleOpenModal}
              className="bg-cyber-primary text-black hover:bg-cyber-primary/80 border-transparent px-4 py-2.5"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-2">
            <X size={18} />
            <span className="text-sm font-bold uppercase tracking-wide">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400 animate-in fade-in slide-in-from-top-2">
            <Check size={18} />
            <span className="text-sm font-bold uppercase tracking-wide">{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-56 bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
            ))
          ) : filteredProviders.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-black/20">
              <div className="p-5 bg-white/5 rounded-full mb-4 text-gray-600">
                <Cpu size={40} />
              </div>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No Providers</p>
              <p className="text-gray-600 text-xs mt-1">Add your first LLM provider to get started.</p>
            </div>
          ) : (
            filteredProviders.map((p) => (
              <CyberPanel
                key={p.id}
                title={p.name}
                icon={Cpu}
                className="hover:border-cyber-primary/40 transition-all duration-300 group shadow-lg"
                actions={
                  <div className="flex items-center gap-1">
                    <CyberAction
                      icon={Edit2}
                      label="Edit"
                      showLabel={false}
                      onClick={() => handleEditProvider(p)}
                      className="w-8 h-8 p-0"
                    />
                    <CyberAction
                      icon={Trash2}
                      label="Delete"
                      showLabel={false}
                      onClick={() => handleDeleteProvider(p.id)}
                      className="w-8 h-8 p-0 hover:border-red-500/50 hover:bg-red-500/10 text-red-400"
                    />
                  </div>
                }
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <CyberBadge label={p.provider} variant="info" />
                    <StatusBadge label="Configured" status="online" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Globe size={12} className="text-cyber-primary/50" />
                      <span className="truncate">{p.baseUrl || 'Default Endpoint'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                      <Key size={12} className="text-cyber-primary/50" />
                      <span>{p.apiKey || 'No Key'}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">Status</span>
                      <span className="text-[10px] font-mono text-white/60 flex items-center gap-1">
                        <Activity size={10} />
                        Ready
                      </span>
                    </div>
                    <button
                      onClick={() => handleTestConnection(p.id)}
                      disabled={testingId === p.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-cyber-primary/10 hover:bg-cyber-primary/20 text-cyber-primary rounded-lg border border-cyber-primary/20 transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                    >
                      {testingId === p.id ? (
                        <Zap size={10} className="animate-pulse" />
                      ) : (
                        <Zap size={10} />
                      )}
                      Test
                    </button>
                  </div>
                </div>
              </CyberPanel>
            ))
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <CyberPanel
              title={isEditing ? 'Modify Provider' : 'Add New Provider'}
              icon={Cpu}
              className="w-full max-w-lg shadow-[0_0_20px_rgba(0,0,0,0.45)] border-cyber-primary/30"
              onClose={() => setShowModal(false)}
              actions={
                <CyberAction
                  icon={Check}
                  label={isEditing ? 'Update' : 'Register'}
                  onClick={handleSaveProvider}
                  className="bg-cyber-primary text-black border-transparent"
                />
              }
            >
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cyber-primary/70 ml-1">Friendly Name</label>
                    <Input
                      placeholder="e.g. My OpenAI"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cyber-primary/70 ml-1">Type</label>
                    <select
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      className="w-full h-11 px-4 bg-black/60 border border-white/10 rounded-xl focus:outline-none focus:border-cyber-primary/50 text-xs text-white appearance-none cursor-pointer"
                    >
                      {PROVIDER_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cyber-primary/70 ml-1">Base URL (Optional)</label>
                  <Input
                    icon={Server}
                    placeholder="https://api.openai.com/v1"
                    value={formData.baseUrl}
                    onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cyber-primary/70 ml-1">API Key</label>
                  <div className="relative">
                    <textarea
                      placeholder={isEditing ? "••••••••••••••••" : "Paste your API key here"}
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl focus:outline-none focus:border-cyber-primary/50 text-xs text-white font-mono min-h-[80px] resize-none pr-10 shadow-inner"
                    />
                    <Key size={16} className="absolute right-3 top-3 text-white/10" />
                  </div>
                  {isEditing && (
                    <p className="text-[9px] text-yellow-500/70 font-bold uppercase tracking-wider ml-1">
                      Leave blank to keep existing key
                    </p>
                  )}
                </div>
              </div>
            </CyberPanel>
          </div>
        )}
      </div>
    </div>
  );
};

export default LLMProviderManager;
