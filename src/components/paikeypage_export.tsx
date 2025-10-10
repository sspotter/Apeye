
import { useState, useEffect, useRef } from 'react';
import { supabase, type ApiKey } from '../lib/supabase';
import { ApiKeysTable } from './ApiKeysTable';
import { ApiKeyModal } from './ApiKeyModal';
import { Key, Plus, Search, Filter, Download, Upload } from 'lucide-react';
import { encrypt } from '../lib/encryption';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

export function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API keys:', error);
    } else {
      setApiKeys(data || []);
      const tags = new Set<string>();
      data?.forEach(key => key.tags.forEach((tag: string) => tags.add(tag)));
      setAllTags(Array.from(tags).sort());
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
      fetchApiKeys();
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingKey(null);
    fetchApiKeys();
  };

  const handleExportJSON = () => {
    const exportData = apiKeys.map(key => ({
      service_name: key.service_name,
      email_username: key.email_username,
      encrypted_password: key.encrypted_password,
      encrypted_api_key: key.encrypted_api_key,
      notes: key.notes,
      tags: key.tags,
      created_at: key.created_at,
      updated_at: key.updated_at
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `api-keys-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['Service Name', 'Email/Username', 'Notes', 'Tags', 'Created At', 'Updated At'];
    const rows = apiKeys.map(key => [
      key.service_name,
      key.email_username,
      key.notes.replace(/,/g, ';'),
      key.tags.join('|'),
      new Date(key.created_at).toLocaleDateString(),
      new Date(key.updated_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `api-keys-backup-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        toast.error('Invalid file format. Expected an array of API keys.', {
          style: {
            border: '1px solid #ef4444',
            padding: '16px',
            color: '#ef4444',
          },
        });
        return;
      }

      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast.error('You must be logged in to import data.', {
          style: {
            border: '1px solid #ef4444',
            padding: '16px',
            color: '#ef4444',
          },
        });
        return;
      }

      const importData = data.map(item => ({
        user_id: user.id,
        service_name: item.service_name,
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
      } else {
        toast.success(`Successfully imported ${importData.length} API keys!`, {
          style: {
            border: '1px solid #713200',
            padding: '16px',
            color: '#713200',
          },
          iconTheme: {
            primary: '#713200',
            secondary: '#FFFAEE',
          },
        });
        fetchApiKeys();
      }
    } catch (err) {
      console.error('Error parsing file:', err);
      toast.error('Failed to parse file. Please ensure it is a valid JSON file.', {
        style: {
          border: '1px solid #ef4444',
          padding: '16px',
          color: '#ef4444',
        },
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredKeys = apiKeys.filter(key => {
    const matchesSearch = !searchQuery ||
      key.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.email_username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.notes.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = !selectedTag || key.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4 flex flex-wrap gap-2 justify-end">
        <button
          onClick={handleExportJSON}
          className="flex items-center gap-2 px-3 py-2 theme-bg-tertiary hover:theme-bg-tertiary theme-text-primary font-medium rounded-lg transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Export JSON
        </button>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3 py-2 theme-bg-tertiary hover:theme-bg-tertiary theme-text-primary font-medium rounded-lg transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 theme-bg-tertiary hover:theme-bg-tertiary theme-text-primary font-medium rounded-lg transition-colors text-sm"
        >
          <Upload className="w-4 h-4" />
          Import JSON
        </button>
        <input
        title='Import JSON'
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-text-tertiary" />
            <input
              type="text"
              placeholder="Search services, emails, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg-secondary theme-text-primary"
            />
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          {allTags.length > 0 && (
            <div className="relative flex-1 sm:flex-initial">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-tertiary" />
              <select
              title='Filter by tag'
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full pl-9 pr-4 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg-secondary theme-text-primary appearance-none"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 theme-accent theme-accent-hover text-white font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Key
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <ApiKeysTable
          apiKeys={filteredKeys}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {!loading && filteredKeys.length === 0 && (
        <div className="text-center py-12 theme-bg-secondary rounded-xl theme-border border">
          <Key className="w-12 h-12 theme-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium theme-text-primary mb-2">
            {searchQuery || selectedTag ? 'No matching keys found' : 'No API keys yet'}
          </h3>
          <p className="theme-text-secondary mb-6">
            {searchQuery || selectedTag
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first API key'}
          </p>
          {!searchQuery && !selectedTag && (
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-6 py-3 theme-accent theme-accent-hover text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Key
            </button>
          )}
        </div>
      )}

      {isModalOpen && (
        <ApiKeyModal
          apiKey={editingKey}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
