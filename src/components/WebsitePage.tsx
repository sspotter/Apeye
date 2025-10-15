import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, type ApiKey } from '../lib/supabase';
import { ApiKeysTable } from './ApiKeysTable';
import { ApiKeyModal } from './ApiKeyModal';
import { ExportImportButtons } from './ExportImportButtons';
import { getServiceMetadata } from '../lib/serviceMetadata';
import { ArrowLeft, Plus, Key, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export function WebsitePage() {
  const { serviceName } = useParams<{ serviceName: string }>();
  const navigate = useNavigate();
  const decodedServiceName = decodeURIComponent(serviceName || '');
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [isMassAddOpen, setIsMassAddOpen] = useState(false);

  const metadata = getServiceMetadata(decodedServiceName);

  useEffect(() => {
    if (decodedServiceName) {
      fetchServiceKeys();
    }
  }, [decodedServiceName]);

  const fetchServiceKeys = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service_name', decodedServiceName)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Failed to load API keys');
    } else {
      setApiKeys(data || []);
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingKey(null);
    setIsModalOpen(true);
  };

  const handleEdit = (key: ApiKey) => {
    setEditingKey(key);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key', {
        style: {
          border: '1px solid #ef4444',
          padding: '16px',
          color: '#ef4444',
        },
      });
    } else {
      toast.success('Deleted successfully!', {
        icon: '🗑️',
        style: {
          border: '1px solid #10b981',
          padding: '16px',
          color: '#10b981',
        },
        iconTheme: {
          primary: '#10b981',
          secondary: '#FFFAEE',
        },
      });
      fetchServiceKeys();
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingKey(null);
    fetchServiceKeys();
  };

  const handleImportServiceKeys = async (importedData: any[]) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      toast.error('You must be logged in to import data.', {
        style: {
          border: '1px solid #ef4444',
          padding: '16px',
          color: '#ef4444',
        },
      });
      throw new Error('Not authenticated');
    }

    const importData = importedData.map(item => ({
      user_id: user.id,
      service_name: decodedServiceName, // Force service name
      email_username: item.email_username || '',
      encrypted_password: item.encrypted_password || '',
      encrypted_api_key: item.encrypted_api_key,
      notes: item.notes || '',
      tags: item.tags || []
    }));

    const { error } = await supabase
      .from('api_keys')
      .insert(importData);

    if (error) {
      console.error('Error importing data:', error);
      toast.error('Failed to import data. Please check the file format.', {
        style: {
          border: '1px solid #ef4444',
          padding: '16px',
          color: '#ef4444',
        },
      });
      throw new Error('Failed to import data. Please check the file format.');
    }

    await fetchServiceKeys();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const latestUpdate = apiKeys.length > 0
    ? formatDate(apiKeys[0].updated_at)
    : 'Never';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/api-keys')}
          className="flex items-center gap-2 text-sm theme-text-secondary hover:theme-text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Service Header */}
        <div
          className="theme-bg-secondary theme-border border rounded-xl p-6 mb-4"
          style={{
            borderLeft: `4px solid ${metadata.color}`
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-5xl" role="img" aria-label={decodedServiceName}>
                {metadata.icon}
              </span>
              <div>
                <h1 className="text-3xl font-bold theme-text-primary mb-1">
                  {decodedServiceName}
                </h1>
                <p className="theme-text-secondary text-sm">
                  {metadata.description}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t theme-border">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 theme-text-tertiary" />
              <div>
                <p className="text-xs theme-text-tertiary">API Keys</p>
                <p className="text-lg font-semibold theme-text-primary">
                  {apiKeys.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 theme-text-tertiary" />
              <div>
                <p className="text-xs theme-text-tertiary">Last Updated</p>
                <p className="text-lg font-semibold theme-text-primary">
                  {latestUpdate}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 theme-accent text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Add Single Key
            </button>
            <button
              onClick={() => setIsMassAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              <Users className="w-5 h-5" />
              Mass Add Keys
            </button>
          </div>

          {apiKeys.length > 0 && (
            <ExportImportButtons
              data={apiKeys}
              onImport={handleImportServiceKeys}
              exportFileName={`${decodedServiceName.toLowerCase().replace(/\s+/g, '-')}-keys`}
              exportDataTransform={(keys) => keys.map(key => ({
                service_name: key.service_name,
                email_username: key.email_username,
                encrypted_password: key.encrypted_password,
                encrypted_api_key: key.encrypted_api_key,
                notes: key.notes,
                tags: key.tags,
                created_at: key.created_at,
                updated_at: key.updated_at
              }))}
              csvHeaders={['Service Name', 'Email/Username', 'Notes', 'Tags', 'Created At', 'Updated At']}
              csvRowTransform={(key) => [
                key.service_name,
                key.email_username,
                key.notes.replace(/,/g, ';'),
                key.tags.join('|'),
                new Date(key.created_at).toLocaleDateString(),
                new Date(key.updated_at).toLocaleDateString()
              ]}
            />
          )}
        </div>
      </div>

      {/* API Keys Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : apiKeys.length === 0 ? (
        <div className="text-center py-12 theme-bg-secondary rounded-xl theme-border border">
          <Key className="w-12 h-12 theme-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium theme-text-primary mb-2">
            No API keys for {decodedServiceName} yet
          </h3>
          <p className="theme-text-secondary mb-6">
            Get started by adding your first API key for this service
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-6 py-3 theme-accent text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Add First Key
            </button>
            <button
              onClick={() => setIsMassAddOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              <Users className="w-5 h-5" />
              Mass Add Keys
            </button>
          </div>
        </div>
      ) : (
        <ApiKeysTable
          apiKeys={apiKeys}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modals */}
      {isModalOpen && (
        <ApiKeyModal
          apiKey={editingKey}
          onClose={handleModalClose}
          defaultServiceName={decodedServiceName}
        />
      )}

      {/* TODO: Mass Add Modal - Will be created in next phase */}
      {isMassAddOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="theme-bg-secondary theme-border border rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-semibold theme-text-primary mb-4">
              Mass Add Keys (Coming Soon)
            </h2>
            <p className="theme-text-secondary mb-4">
              This feature will allow you to add multiple API keys at once.
            </p>
            <button
              onClick={() => setIsMassAddOpen(false)}
              className="px-4 py-2 theme-accent text-white rounded-lg hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
