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
  X
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { apiService } from '../lib/apiService';
import { Input, Button } from '../components/ui';

interface Secret {
  id: string;
  name: string;
  label?: string;
  key: string; // key preview (****last4chars)
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

  // Load secrets on mount
  useEffect(() => {
    loadSecrets();
  }, []);

  const loadSecrets = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/secrets');
      if (response.ok) {
        setSecrets(response.data || []);
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
      if (!formData.name.trim() || !formData.key.trim()) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-black/20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white flex items-center gap-3">
            <ShieldCheck className="text-cyber-primary" size={32} />
            Manage Secrets
          </h1>
          <p className="text-slate-400">Store and manage your API keys and sensitive credentials securely</p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenModal}
          className="shadow-[0_0_20px_rgba(0,240,255,0.15)]"
        >
          <Plus size={16} className="mr-2" /> Add New Secret
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading secrets...</div>
      ) : secrets.length === 0 ? (
        <div className="text-center py-8 text-slate-500">No secrets yet. Create one to get started.</div>
      ) : (
        <div className="overflow-x-auto border border-slate-700 rounded-xl bg-slate-800/30 backdrop-blur-sm shadow-xl">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700">
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-slate-400 font-semibold">Name</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-slate-400 font-semibold">Label</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-slate-400 font-semibold">Value Preview</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-slate-400 font-semibold">Last Used</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-slate-400 font-semibold">Created</th>
                <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-slate-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {secrets.map((secret) => (
                <tr key={secret.id} className="hover:bg-cyan-500/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-200">{secret.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{secret.label || '-'}</td>
                  <td className="px-6 py-4 font-mono text-sm text-cyan-400/80">{secret.key}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {secret.lastUsedAt ? formatDate(secret.lastUsedAt) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">{formatDate(secret.createdAt)}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRevealSecret(secret.id)}
                      title="Reveal the full secret value"
                      className="border-white/10 hover:border-cyber-primary/50"
                    >
                      <Eye size={12} className="mr-1" /> View
                    </Button>
                    <Button
                      size="sm"
                      variant={copiedId === secret.id ? "primary" : "outline"}
                      onClick={() => handleCopyToClipboard(secret.id)}
                      className={copiedId === secret.id ? "" : "border-white/10 hover:border-cyber-primary/50"}
                      title="Copy to clipboard"
                    >
                      {copiedId === secret.id ? <Check size={12} className="mr-1" /> : <Copy size={12} className="mr-1" />}
                      {copiedId === secret.id ? 'Copied' : 'Copy'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRegenerateSecret(secret.id)}
                      className="text-amber-400 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/50"
                      title="Generate a new value"
                    >
                      <RefreshCw size={12} className="mr-1" /> Regen
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditSecret(secret)}
                      className="text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/10 hover:border-cyan-500/50"
                    >
                      <Edit2 size={12} className="mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteSecret(secret.id)}
                    >
                      <Trash2 size={12} className="mr-1" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showSecretValue && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4 text-white">Secret Value</h2>
            <p className="text-sm text-slate-400 mb-4">
              This value will auto-hide in 30 seconds for security. Copy it quickly if needed.
            </p>
            <div className="bg-slate-950 p-4 rounded border border-slate-700 font-mono text-cyan-400 break-all mb-6">
              {showSecretValue}
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  navigator.clipboard.writeText(showSecretValue);
                  alert('Copied to clipboard!');
                }}
              >
                <Copy size={14} className="mr-2" /> Copy to Clipboard
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowSecretValue(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <Modal 
          isOpen={showModal} 
          onClose={handleCloseModal}
          title={isEditing ? 'Edit Secret' : 'Create New Secret'}
        >
          <div className="space-y-4">
            <Input
              label="Secret Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., OPENAI_API_KEY"
              disabled={isEditing}
              helperText={isEditing ? 'Secret name cannot be changed' : 'Used to reference this secret in flows'}
            />

            <Input
              label="Label (Optional)"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g., OpenAI API Key for Chat"
              helperText="A human-readable description of this secret"
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-300">Secret Value</label>
              <textarea
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder={isEditing ? 'Leave empty to keep current value' : 'Paste your API key or secret here'}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono text-sm text-slate-200 placeholder:text-slate-600"
                rows={4}
              />
              <p className="text-xs text-slate-500">
                Stored encrypted. {isEditing ? 'Leave empty to keep the current value.' : 'Never shown again after creation.'}
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="ghost"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveSecret}
                loading={loading}
              >
                {isEditing ? 'Update Secret' : 'Create Secret'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};


export default SecretManager;
