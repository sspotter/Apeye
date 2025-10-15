import { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, Download, Upload, Database, AlertCircle, Trash2 } from 'lucide-react';
import { exportAllData, importAllData, downloadExportFile, parseImportFile, getDataStats, clearAllData, type DatabaseExport } from '../lib/dataManagement';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export function DataManagementSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClearExpanded, setIsClearExpanded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);

    try {
      const data = await exportAllData((step, prog) => {
        setProgressText(step);
        setProgress(prog);
      });

      const stats = getDataStats(data);
      
      // Download file
      downloadExportFile(data);

      // Success toast
      toast.success(
        <div>
          <p className="font-semibold">Export Successful!</p>
          <p className="text-sm">
            {stats.total} items exported
          </p>
        </div>,
        {
          icon: '📦',
          duration: 4000,
          style: {
            border: '2px solid #10b981',
            padding: '16px',
          },
        }
      );
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.', {
        icon: '❌',
      });
    } finally {
      setIsExporting(false);
      setProgress(0);
      setProgressText('');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input
    event.target.value = '';

    try {
      // Parse file
      const data = await parseImportFile(file);
      const stats = getDataStats(data);

      // Show confirmation dialog
      const result = await Swal.fire({
        title: 'Import Data',
        html: `
          <div class="text-left">
            <p class="mb-4">Found <strong>${stats.total} items</strong> to import:</p>
            <ul class="space-y-1 mb-4">
              <li>🔑 API Keys: ${stats.apiKeys}</li>
              <li>📝 Service Notes: ${stats.serviceNotes}</li>
              <li>🗂️ Categories: ${stats.categories}</li>
              <li>🔗 Resources: ${stats.resources}</li>
            </ul>
            <p class="text-sm text-gray-600">Choose import mode:</p>
          </div>
        `,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Merge with Existing',
        denyButtonText: 'Replace All Data',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#3b82f6',
        denyButtonColor: '#ef4444',
        icon: 'question',
      });

      if (result.isConfirmed) {
        await performImport(data, 'merge');
      } else if (result.isDenied) {
        // Extra confirmation for replace
        const confirmReplace = await Swal.fire({
          title: 'Are you sure?',
          text: 'This will DELETE all existing data and replace it with imported data. This cannot be undone!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, Replace All',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#ef4444',
        });

        if (confirmReplace.isConfirmed) {
          await performImport(data, 'replace');
        }
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Invalid import file. Please check the file and try again.', {
        icon: '❌',
      });
    }
  };

  const performImport = async (data: DatabaseExport, mode: 'merge' | 'replace') => {
    setIsImporting(true);
    setProgress(0);

    try {
      await importAllData(data, mode, (step, prog) => {
        setProgressText(step);
        setProgress(prog);
      });

      const stats = getDataStats(data);

      // Success toast
      toast.success(
        <div>
          <p className="font-semibold">Import Successful!</p>
          <p className="text-sm">
            {stats.total} items imported ({mode === 'merge' ? 'merged' : 'replaced'})
          </p>
        </div>,
        {
          icon: '✅',
          duration: 4000,
          style: {
            border: '2px solid #10b981',
            padding: '16px',
          },
        }
      );

      // Reload page to show new data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Import failed. Please try again.', {
        icon: '❌',
      });
    } finally {
      setIsImporting(false);
      setProgress(0);
      setProgressText('');
    }
  };

  const handleClearAllData = async () => {
    // First, ask if user wants to backup before clearing
    const result = await Swal.fire({
      title: '⚠️ Clear All Data',
      html: `
        <div class="text-left">
          <p class="mb-4 text-gray-700">This will permanently delete ALL your data:</p>
          <ul class="space-y-1 mb-4 text-gray-600">
            <li>🔑 All API Keys</li>
            <li>📝 All Service Notes</li>
            <li>🗂️ All Categories</li>
            <li>🔗 All Resources</li>
          </ul>
          <p class="text-sm font-semibold text-red-600">This action cannot be undone!</p>
          <p class="text-sm text-gray-600 mt-4">Would you like to backup your data first?</p>
        </div>
      `,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: '📦 Backup & Delete',
      denyButtonText: '🗑️ Delete Without Backup',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#f59e0b',
      denyButtonColor: '#ef4444',
      icon: 'warning',
    });

    if (result.isDismissed) {
      return; // User cancelled
    }

    try {
      // If user wants to backup first
      if (result.isConfirmed) {
        setIsExporting(true);
        setProgress(0);

        // Export data
        const data = await exportAllData((step, prog) => {
          setProgressText(step);
          setProgress(prog);
        });

        downloadExportFile(data);

        toast.success('Backup downloaded! Now clearing data...', {
          icon: '📦',
          duration: 2000,
        });

        setIsExporting(false);
        await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause
      }

      // Final confirmation
      const confirmDelete = await Swal.fire({
        title: 'Final Confirmation',
        text: 'Are you absolutely sure you want to delete ALL data?',
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete Everything',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444',
      });

      if (!confirmDelete.isConfirmed) {
        return;
      }

      // Clear all data
      setIsClearing(true);
      setProgress(0);

      await clearAllData((step, prog) => {
        setProgressText(step);
        setProgress(prog);
      });

      toast.success(
        <div>
          <p className="font-semibold">All Data Cleared!</p>
          <p className="text-sm">Your database has been wiped clean.</p>
        </div>,
        {
          icon: '🗑️',
          duration: 4000,
          style: {
            border: '2px solid #10b981',
            padding: '16px',
          },
        }
      );

      // Reload page
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Clear data error:', error);
      toast.error('Failed to clear data. Please try again.', {
        icon: '❌',
      });
    } finally {
      setIsClearing(false);
      setProgress(0);
      setProgressText('');
    }
  };

  const isLoading = isExporting || isImporting || isClearing;

  return (
    <section className="theme-bg-secondary theme-border border rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:theme-bg-tertiary transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 theme-text-tertiary" />
          ) : (
            <ChevronRight className="w-5 h-5 theme-text-tertiary" />
          )}
          <div className="bg-blue-500 p-2 rounded-lg">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-semibold theme-text-primary">Data Management</h2>
            <p className="text-xs theme-text-tertiary mt-0.5">
              Export or import all your data
            </p>
          </div>
        </div>
        
        {!isExpanded && (
          <span className="text-xs theme-text-tertiary px-2 py-1 theme-bg-tertiary rounded">
            Backup & Restore
          </span>
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t theme-border p-6 space-y-6">
          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-900 dark:text-blue-100 font-medium mb-1">
                Backup Your Data
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                Export all your API keys, service notes, categories, and resources as a JSON file. 
                You can restore it later or transfer it to another account.
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="theme-text-secondary">{progressText}</span>
                <span className="theme-text-tertiary">{progress}%</span>
              </div>
              <div className="w-full h-3 theme-bg-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Download className={`w-5 h-5 ${isExporting ? 'animate-bounce' : 'group-hover:animate-bounce'}`} />
              <div className="text-left">
                <div>{isExporting ? 'Exporting...' : 'Export All Data'}</div>
                <div className="text-xs opacity-90">Download as JSON</div>
              </div>
            </button>

            {/* Import Button */}
            <button
              onClick={handleImportClick}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Upload className={`w-5 h-5 ${isImporting ? 'animate-bounce' : 'group-hover:animate-bounce'}`} />
              <div className="text-left">
                <div>{isImporting ? 'Importing...' : 'Import Data'}</div>
                <div className="text-xs opacity-90">Restore from JSON</div>
              </div>
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* What Gets Exported */}
          <div className="theme-bg-tertiary rounded-lg p-4">
            <h3 className="text-sm font-semibold theme-text-primary mb-3">
              What gets exported:
            </h3>
            <ul className="space-y-2 text-sm theme-text-secondary">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                All API keys (with encrypted data)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Service documentation and notes
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Resource categories
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                All saved resources
              </li>
            </ul>
          </div>

          {/* Import Modes Explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 theme-bg-tertiary rounded-lg border-2 border-blue-500/20">
              <h4 className="text-sm font-semibold theme-text-primary mb-2">
                🔵 Merge Mode
              </h4>
              <p className="text-xs theme-text-secondary">
                Keeps your existing data and adds imported items. Duplicates will be updated.
              </p>
            </div>
            <div className="p-4 theme-bg-tertiary rounded-lg border-2 border-red-500/20">
              <h4 className="text-sm font-semibold theme-text-primary mb-2">
                🔴 Replace Mode
              </h4>
              <p className="text-xs theme-text-secondary">
                Deletes all existing data and replaces it with imported data. Use with caution!
              </p>
            </div>
          </div>

          {/* Clear All Data Section */}
          <div className="border-t theme-border pt-6">
            <button
              onClick={() => setIsClearExpanded(!isClearExpanded)}
              className="w-full flex items-center justify-between p-4 theme-bg-tertiary hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                {isClearExpanded ? (
                  <ChevronDown className="w-4 h-4 theme-text-tertiary group-hover:text-red-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 theme-text-tertiary group-hover:text-red-600" />
                )}
                <Trash2 className="w-5 h-5 text-red-600" />
                <div className="text-left">
                  <h3 className="text-sm font-semibold theme-text-primary group-hover:text-red-600">
                    Clear All Data
                  </h3>
                  <p className="text-xs theme-text-tertiary">
                    Permanently delete everything
                  </p>
                </div>
              </div>
              <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                Danger Zone
              </span>
            </button>

            {isClearExpanded && (
              <div className="mt-4 space-y-4">
                {/* Warning Box */}
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-red-900 dark:text-red-100 font-medium mb-1">
                      ⚠️ Permanent Deletion Warning
                    </p>
                    <p className="text-red-700 dark:text-red-300">
                      This will permanently delete ALL your data including API keys, service notes, 
                      categories, and resources. <strong>This action cannot be undone!</strong>
                    </p>
                    <p className="text-red-700 dark:text-red-300 mt-2">
                      We'll offer to backup your data before deletion.
                    </p>
                  </div>
                </div>

                {/* Clear Button */}
                <button
                  onClick={handleClearAllData}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Trash2 className={`w-5 h-5 ${isClearing ? 'animate-bounce' : 'group-hover:animate-bounce'}`} />
                  <div className="text-left">
                    <div>{isClearing ? 'Clearing Data...' : 'Clear All Data'}</div>
                    <div className="text-xs opacity-90">Backup option available</div>
                  </div>
                </button>

                {/* What Will Be Deleted */}
                <div className="p-4 theme-bg-tertiary rounded-lg border-2 border-red-500/20">
                  <h4 className="text-sm font-semibold theme-text-primary mb-3">
                    What will be deleted:
                  </h4>
                  <ul className="space-y-2 text-sm theme-text-secondary">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      All API keys (cannot be recovered)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      All service documentation
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      All resource categories
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      All saved resources
                    </li>
                    <li className="flex items-center gap-2 text-red-600 font-semibold">
                      <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                      EVERYTHING in your database!
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
