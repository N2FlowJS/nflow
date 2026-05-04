import React, { useState, useEffect } from 'react';
import { Modal } from '../components/Modal';
import { fetchWithAuth } from '../lib/api';

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
      const response = await fetchWithAuth('/api/secrets');
      if (response.ok) {
        setSecrets(response.secrets || []);
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
        response = await fetchWithAuth(`/api/secrets/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetchWithAuth('/api/secrets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
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
      const response = await fetchWithAuth(`/api/secrets/${id}`, {
        method: 'DELETE',
      });

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
      const response = await fetchWithAuth(`/api/secrets/${id}/regenerate`, {
        method: 'POST',
      });

      if (response.ok) {
        setError(null);
        // Show the new key temporarily
        setShowSecretValue(response.key);
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
      const response = await fetchWithAuth(`/api/secrets/${id}`);
      if (response.ok) {
        setShowSecretValue(response.secret?.key);
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
      const response = await fetchWithAuth(`/api/secrets/${id}`);
      if (response.ok) {
        const secretValue = response.secret?.key;
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Manage Secrets</h1>
        <p className="text-gray-600">Store and manage your API keys and sensitive credentials securely</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <button
        onClick={handleOpenModal}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        + Add New Secret
      </button>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading secrets...</div>
      ) : secrets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No secrets yet. Create one to get started.</div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Label</th>
                <th className="px-4 py-3 text-left">Value Preview</th>
                <th className="px-4 py-3 text-left">Last Used</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {secrets.map((secret) => (
                <tr key={secret.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{secret.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{secret.label || '-'}</td>
                  <td className="px-4 py-3 font-mono text-sm">{secret.key}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {secret.lastUsedAt ? formatDate(secret.lastUsedAt) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(secret.createdAt)}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleRevealSecret(secret.id)}
                      className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                      title="Reveal the full secret value"
                    >
                      👁️ View
                    </button>
                    <button
                      onClick={() => handleCopyToClipboard(secret.id)}
                      className={`text-xs px-2 py-1 rounded transition ${
                        copiedId === secret.id ? 'bg-green-200' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      title="Copy to clipboard"
                    >
                      {copiedId === secret.id ? '✓ Copied' : '📋 Copy'}
                    </button>
                    <button
                      onClick={() => handleRegenerateSecret(secret.id)}
                      className="text-xs px-2 py-1 bg-yellow-200 rounded hover:bg-yellow-300 transition"
                      title="Generate a new value"
                    >
                      🔄 Regen
                    </button>
                    <button
                      onClick={() => handleEditSecret(secret)}
                      className="text-xs px-2 py-1 bg-blue-200 rounded hover:bg-blue-300 transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSecret(secret.id)}
                      className="text-xs px-2 py-1 bg-red-200 rounded hover:bg-red-300 transition"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showSecretValue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Secret Value</h2>
            <p className="text-sm text-gray-600 mb-4">
              This value will auto-hide in 30 seconds for security. Copy it quickly if needed.
            </p>
            <div className="bg-gray-100 p-4 rounded border border-gray-300 mb-4 break-all font-mono">
              {showSecretValue}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(showSecretValue);
                  alert('Copied to clipboard!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setShowSecretValue(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Secret' : 'Create New Secret'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Secret Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., OPENAI_API_KEY"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isEditing} // Don't allow name changes on edit
            />
            <p className="text-xs text-gray-500 mt-1">
              {isEditing ? 'Secret name cannot be changed' : 'Used to reference this secret in flows'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Label (Optional)</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g., OpenAI API Key for Chat  "
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">A human-readable description of this secret</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Secret Value</label>
            <textarea
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              placeholder={isEditing ? 'Leave empty to keep current value' : 'Paste your API key or secret here'}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Stored encrypted. {isEditing ? 'Leave empty to keep the current value.' : 'Never shown again after creation.'}
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSecret}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {isEditing ? 'Update Secret' : 'Create Secret'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SecretManager;
