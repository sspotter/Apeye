import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { encrypt } from '../lib/encryption';
import { X, Plus, Trash2, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ApiKeyRow {
  id: string;
  email_username: string;
  password: string;
  api_key: string;
  notes: string;
  showPassword: boolean;
}

interface MassAddModalProps {
  serviceName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function MassAddModal({ serviceName, onClose, onSuccess }: MassAddModalProps) {
  const [rows, setRows] = useState<ApiKeyRow[]>([
    {
      id: crypto.randomUUID(),
      email_username: '',
      password: '',
      api_key: '',
      notes: '',
      showPassword: false
    }
  ]);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  // Add a new row
  const addRow = () => {
    setRows([
      ...rows,
      {
        id: crypto.randomUUID(),
        email_username: '',
        password: '',
        api_key: '',
        notes: '',
        showPassword: false
      }
    ]);
  };

  // Remove a specific row
  const removeRow = (id: string) => {
    if (rows.length === 1) {
      toast.error('You must have at least one row', {
        style: {
          border: '1px solid #ef4444',
          padding: '16px',
          color: '#ef4444',
        },
      });
      return;
    }
    setRows(rows.filter(row => row.id !== id));
  };

  // Update a field in a specific row
  const updateRow = (id: string, field: keyof ApiKeyRow, value: string | boolean) => {
    setRows(rows.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (id: string) => {
    setRows(rows.map(row =>
      row.id === id ? { ...row, showPassword: !row.showPassword } : row
    ));
  };

  // Save all rows
  const handleSaveAll = async () => {
    // Filter out empty rows (rows with no API key)
    const validRows = rows.filter(row => row.api_key.trim() !== '');

    if (validRows.length === 0) {
      toast.error('Please add at least one API key', {
        style: {
          border: '1px solid #ef4444',
          padding: '16px',
          color: '#ef4444',
        },
      });
      return;
    }

    setSaving(true);
    setProgress(0);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Step 1: Encrypting data
      setCurrentStep(`Encrypting ${validRows.length} keys...`);
      const totalSteps = validRows.length;
      
      const dataToInsert = await Promise.all(
        validRows.map(async (row, index) => {
          const encrypted_password = row.password.trim()
            ? await encrypt(row.password.trim())
            : '';
          const encrypted_api_key = await encrypt(row.api_key.trim());

          // Update progress
          setProgress(Math.round(((index + 1) / totalSteps) * 50));

          return {
            user_id: user.id,
            service_name: serviceName,
            email_username: row.email_username.trim(),
            encrypted_password,
            encrypted_api_key,
            notes: row.notes.trim(),
            tags: []
          };
        })
      );

      // Step 2: Inserting to database
      setCurrentStep(`Saving ${validRows.length} keys to database...`);
      setProgress(60);

      const { error } = await supabase
        .from('api_keys')
        .insert(dataToInsert);

      if (error) {
        throw error;
      }

      // Step 3: Success
      setProgress(100);
      setCurrentStep('Complete!');

      toast.success(`Successfully added ${validRows.length} API keys!`, {
        icon: '✅',
        style: {
          border: '2px solid #10b981',
          padding: '16px',
          color: '#10b981',
        },
        duration: 4000,
      });

      // Wait a bit to show success state
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Error saving API keys:', error);
      toast.error('Failed to save API keys. Please try again.', {
        style: {
          border: '1px solid #ef4444',
          padding: '16px',
          color: '#ef4444',
        },
      });
      setSaving(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="theme-bg-secondary theme-border border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 theme-bg-secondary theme-border border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold theme-text-primary">
              Mass Add API Keys - {serviceName}
            </h2>
            <p className="text-sm theme-text-tertiary mt-1">
              Add multiple API keys at once
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="theme-text-secondary hover:theme-text-primary transition-colors disabled:opacity-50"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        {saving && (
          <div className="px-6 py-3 theme-bg-tertiary theme-border border-b">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium theme-text-secondary">
                {currentStep}
              </span>
              <span className="text-sm font-semibold theme-text-primary">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Rows Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="theme-bg-tertiary theme-border border rounded-lg p-4 space-y-3"
            >
              {/* Row Header */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold theme-text-primary">
                  Entry #{index + 1}
                </h3>
                {rows.length > 1 && (
                  <button
                    onClick={() => removeRow(row.id)}
                    disabled={saving}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors disabled:opacity-50"
                    title="Remove row"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                )}
              </div>

              {/* Grid Layout for Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Email/Username */}
                <div>
                  <label className="block text-xs font-medium theme-text-tertiary mb-1">
                    Email / Username
                  </label>
                  <input
                    type="text"
                    value={row.email_username}
                    onChange={(e) => updateRow(row.id, 'email_username', e.target.value)}
                    placeholder="e.g., user@example.com"
                    disabled={saving}
                    className="w-full px-3 py-2 text-sm theme-bg-primary theme-border border rounded-lg theme-text-primary placeholder:theme-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium theme-text-tertiary mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={row.showPassword ? 'text' : 'password'}
                      value={row.password}
                      onChange={(e) => updateRow(row.id, 'password', e.target.value)}
                      placeholder="Optional"
                      disabled={saving}
                      className="w-full px-3 py-2 pr-10 text-sm theme-bg-primary theme-border border rounded-lg theme-text-primary placeholder:theme-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(row.id)}
                      disabled={saving}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 theme-text-tertiary hover:theme-text-secondary transition-colors disabled:opacity-50"
                      title={row.showPassword ? 'Hide password' : 'Show password'}
                    >
                      {row.showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* API Key */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium theme-text-tertiary mb-1">
                    API Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={row.api_key}
                    onChange={(e) => updateRow(row.id, 'api_key', e.target.value)}
                    placeholder="e.g., sk-proj-xxxxxxxxxxxx"
                    disabled={saving}
                    className="w-full px-3 py-2 text-sm font-mono theme-bg-primary theme-border border rounded-lg theme-text-primary placeholder:theme-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium theme-text-tertiary mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={row.notes}
                    onChange={(e) => updateRow(row.id, 'notes', e.target.value)}
                    placeholder="Optional notes"
                    disabled={saving}
                    className="w-full px-3 py-2 text-sm theme-bg-primary theme-border border rounded-lg theme-text-primary placeholder:theme-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add Row Button */}
          <button
            onClick={addRow}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 theme-border border-2 border-dashed rounded-lg theme-text-secondary hover:theme-text-primary hover:border-blue-500 transition-colors disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Another Entry</span>
          </button>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 theme-bg-secondary theme-border border-t px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm theme-text-secondary">
              {rows.filter(r => r.api_key.trim()).length} of {rows.length} entries have API keys
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 theme-bg-tertiary theme-text-secondary font-medium rounded-lg hover:theme-bg-primary transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAll}
                disabled={saving || rows.every(r => !r.api_key.trim())}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : progress === 100 ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Save All ({rows.filter(r => r.api_key.trim()).length} keys)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
