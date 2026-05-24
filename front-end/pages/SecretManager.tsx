import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Copy, 
  RefreshCw, 
  Edit2, 
  Trash2, 
  Plus, 
  Search, 
  ShieldCheck,
  Check,
  X,
  History,
  Lock
} from 'lucide-react';
import { apiService } from '../lib/apiService';
import { Input } from '../components/ui';
import { CyberPanel, CyberAction, CyberBadge, StatusBadge } from '../components/shared/CyberUI';
import { GlobalHeader } from '../components/shared/GlobalHeader';

interface Secret {
  id: string;
  name: string;
  label?: string;
  key: string; // key preview (****last4chars)
  keyPreview?: string;
  lastUsedAt?: string;
  createdAt: string;
}

interface SecretInput {
  name: string;
  key: string;
  label: string;
}

const SecretManager: React.FC = () => {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SecretInput>({
    name: '',
    key: '',
    label: '',
  });
  const [showSecretValue, setShowSecretValue] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load secrets on mount
  useEffect(() => {
    loadSecrets();
  }, []);

  const loadSecrets = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/secrets');
      if (response.ok) {
        const mapped = (response.data || []).map((s: any) => ({
          ...s,
          key: s.keyPreview || s.key || '',
        }));
        setSecrets(mapped);
        setError(null);
      } else {
        setError(response.error || 'Failed to load secrets');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load secrets');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: '', key: '', label: '' });
    setShowModal(true);
  };

  const handleEditSecret = (secret: Secret) => {
    setIsEditing(true);
    setEditingId(secret.id);
    setFormData({
      name: secret.name,
      key: '', // Don't prefill the value for security
      label: secret.label || '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: '', key: '', label: '' });
  };

  const handleSaveSecret = async () => {
    try {
      if (!formData.name.trim() || (!isEditing && !formData.key.trim())) {
        setError('Secret name and value are required');
        return;
      }

      let response;
      if (isEditing && editingId) {
        response = await apiService.put(`/api/secrets/${editingId}`, formData);
      } else {
        response = await apiService.post('/api/secrets', formData);
      }

      if (response.ok) {
        setError(null);
        loadSecrets();
        handleCloseModal();
      } else {
        setError(response.error || 'Failed to save secret');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save secret');
    }
  };

  const handleDeleteSecret = async (id: string) => {
    if (!confirm('Are you sure you want to delete this secret?')) {
      return;
    }

    try {
      const response = await apiService.delete(`/api/secrets/${id}`);

      if (response.ok) {
        setError(null);
        loadSecrets();
      } else {
        setError(response.error || 'Failed to delete secret');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete secret');
    }
  };

  const handleRegenerateSecret = async (id: string) => {
    if (!confirm('Generate a new value for this secret?')) {
      return;
    }

    try {
      const response = await apiService.post(`/api/secrets/${id}/regenerate`, {});

      if (response.ok) {
        setError(null);
        // Show the new key temporarily
        setShowSecretValue(response.data?.key);
        setTimeout(() => setShowSecretValue(null), 10000); // Hide after 10 seconds
        loadSecrets();
      } else {
        setError(response.error || 'Failed to regenerate secret');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate secret');
    }
  };

  const handleRevealSecret = async (id: string) => {
    try {
      const response = await apiService.get(`/api/secrets/${id}`);
      if (response.ok) {
        setShowSecretValue(response.data?.key);
        // Auto-hide after 30 seconds for security
        setTimeout(() => setShowSecretValue(null), 30000);
      } else {
        setError(response.error || 'Failed to retrieve secret');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve secret');
    }
  };

  const handleCopyToClipboard = async (id: string) => {
    try {
      const response = await apiService.get(`/api/secrets/${id}`);
      if (response.ok) {
        const secretValue = response.data?.key;
        if (secretValue) {
          await navigator.clipboard.writeText(secretValue);
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2000);
        }
      } else {
        setError(response.error || 'Failed to copy secret');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to copy secret');
    }
  };

  const filteredSecrets = secrets.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.label?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#030303] cyber-grid cyber-scanlines text-white relative overflow-hidden font-sans selection:bg-cyber-primary/30">
      <GlobalHeader />

      {/* Premium Blurred Glow Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[15%] w-96 h-96 bg-cyber-primary/5 rounded-full blur-[120px] animate-pulse-glow"></div>
        <div className="absolute bottom-[10%] left-[15%] w-96 h-96 bg-cyber-secondary/5 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyber-primary/10 rounded-xl border border-cyber-primary/30 text-cyber-primary shadow-[0_0_8px_rgba(34,211,238,0.12)]">
                <ShieldCheck size={28} />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
                Secret <span className="text-cyber-primary">Vault</span>
              </h1>
            </div>
            <p className="text-gray-500 text-sm font-medium ml-1">
              Store and manage your API keys and sensitive credentials securely.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-64">
              <Input
                icon={Search}
                placeholder="Find a secret..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/40 border-white/10"
              />
            </div>
            <CyberAction
              icon={Plus}
              label="New Secret"
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

        {/* Secrets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
            ))
          ) : filteredSecrets.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-black/20">
              <div className="p-5 bg-white/5 rounded-full mb-4 text-gray-600">
                <Lock size={40} />
              </div>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Vault Empty</p>
              <p className="text-gray-600 text-xs mt-1">No secrets matched your search.</p>
            </div>
          ) : (
            filteredSecrets.map((secret) => (
              <CyberPanel
                key={secret.id}
                title={secret.name}
                icon={ShieldCheck}
                className="hover:border-cyber-primary/40 transition-all duration-300 group shadow-lg"
                actions={
                  <div className="flex items-center gap-1">
                    <CyberAction
                      icon={Edit2}
                      label="Edit"
                      showLabel={false}
                      onClick={() => handleEditSecret(secret)}
                      className="w-8 h-8 p-0"
                    />
                    <CyberAction
                      icon={Trash2}
                      label="Delete"
                      showLabel={false}
                      onClick={() => handleDeleteSecret(secret.id)}
                      className="w-8 h-8 p-0 hover:border-red-500/50 hover:bg-red-500/10 text-red-400"
                    />
                  </div>
                }
              >
                <div className="p-5 space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-gray-500">
                      <span>Access Key</span>
                      <StatusBadge label="Encrypted" status="online" />
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-black/60 rounded-xl border border-white/5 font-mono text-sm group-hover:border-cyber-primary/20 transition-colors relative overflow-hidden">
                      <Lock size={14} className="text-cyber-primary/50" />
                      <span className="flex-1 truncate">
                        {secret.keyPreview || secret.key}
                      </span>
                      <button 
                        onClick={() => handleRevealSecret(secret.id)}
                        className="text-gray-500 hover:text-cyber-primary transition-colors mr-1"
                        title="Reveal Secret"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => handleCopyToClipboard(secret.id)}
                        className="text-gray-500 hover:text-cyber-primary transition-colors"
                      >
                        {copiedId === secret.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">Created</span>
                      <span className="text-[10px] font-mono text-white/60">
                        {new Date(secret.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">Last Usage</span>
                      <span className="text-[10px] font-mono text-white/60 flex items-center gap-1">
                        <History size={10} />
                        {secret.lastUsedAt ? new Date(secret.lastUsedAt).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                  </div>

                  {secret.label && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {secret.label.split(',').map(tag => (
                        <CyberBadge key={tag} label={tag.trim()} variant="info" />
                      ))}
                    </div>
                  )}
                </div>
              </CyberPanel>
            ))
          )}
        </div>

        {/* View Modal */}
        {showSecretValue && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <CyberPanel
                title="Decrypted Secret"
                icon={Eye}
                className="w-full max-w-md border-cyber-primary/50 shadow-[0_0_20px_rgba(0,240,255,0.12)]"
                onClose={() => setShowSecretValue(null)}
            >
              <div className="p-6 space-y-4">
                <p className="text-xs text-gray-400 font-medium"> This value is shown temporarily for security. It will auto-hide in 30 seconds.</p>
                <div className="p-4 bg-black rounded-xl border border-cyber-primary/30 font-mono text-sm text-cyber-primary break-all shadow-inner">
                  {showSecretValue}
                </div>
                <CyberAction
                  icon={Copy}
                  label="Copy to Clipboard"
                  onClick={() => {
                    navigator.clipboard.writeText(showSecretValue);
                    setShowSecretValue(null);
                  }}
                  className="w-full justify-center bg-cyber-primary text-black border-transparent"
                />
              </div>
            </CyberPanel>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <CyberPanel
              title={isEditing ? 'Modify Secret' : 'Register New Secret'}
              icon={ShieldCheck}
              className="w-full max-w-lg shadow-[0_0_20px_rgba(0,0,0,0.45)] border-cyber-primary/30"
              onClose={handleCloseModal}
              actions={
                <CyberAction
                  icon={Check}
                  label={isEditing ? 'Update' : 'Create'}
                  onClick={handleSaveSecret}
                  className="bg-cyber-primary text-black border-transparent"
                />
              }
            >
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cyber-primary/70 ml-1">Secret Name</label>
                  <Input
                    placeholder="e.g. OPENAI_API_KEY"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cyber-primary/70 ml-1">Key Value</label>
                  <div className="relative">
                    <textarea
                      placeholder={isEditing ? "••••••••••••••••" : "Paste raw secret value here"}
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                      className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl focus:outline-none focus:border-cyber-primary/50 text-xs text-white font-mono min-h-[100px] resize-none pr-10"
                    />
                    <Lock size={16} className="absolute right-3 top-3 text-white/10" />
                  </div>
                  {isEditing && (
                    <p className="text-[9px] text-yellow-500/70 font-bold uppercase tracking-wider ml-1">
                      Leave blank to keep existing value
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cyber-primary/70 ml-1">Description (Optional)</label>
                  <Input
                    placeholder="e.g. Production API key for OpenAI"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  />
                </div>
              </div>
            </CyberPanel>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecretManager;
