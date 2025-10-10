import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface ExportImportButtonsProps<T> {
  data: T[];
  onImport: (data: T[]) => Promise<void>;
  exportFileName: string;
  exportDataTransform?: (data: T[]) => any[];
  csvHeaders?: string[];
  csvRowTransform?: (item: T) => string[];
}

export function ExportImportButtons<T>({
  data,
  onImport,
  exportFileName,
  exportDataTransform,
  csvHeaders,
  csvRowTransform,
}: ExportImportButtonsProps<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    try {
      const exportData = exportDataTransform ? exportDataTransform(data) : data;
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${exportFileName}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('Exported successfully!', {
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
    } catch (error) {
      toast.error('Failed to export data', {
        style: {
          border: '1px solid #ef4444',
          padding: '16px',
          color: '#ef4444',
        },
      });
    }
  };
  
  const handleExportCSV = () => {
    if (!csvHeaders || !csvRowTransform) {
      toast.error('CSV export is not configured for this data type', {
        style: {
          border: '1px solid #ef4444',
          padding: '16px',
          color: '#ef4444',
        },
      });
      return;
    }

    try {
      const rows = data.map(csvRowTransform);
      const csvContent = [
        csvHeaders.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const dataBlob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${exportFileName}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('Exported successfully!', {
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
    } catch (error) {
      toast.error('Failed to export data', {
        style: {
          border: '1px solid #ef4444',
          padding: '16px',
          color: '#ef4444',
        },
      });
    }
  };
  

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      if (!Array.isArray(importedData)) {
        toast.error('Invalid file format. Expected an array of items.', {
          style: {
            border: '1px solid #ef4444',
            padding: '16px',
            color: '#ef4444',
          },
        });
        return;
      }

      await onImport(importedData);
      
      toast.success(`Imported successfully. ${importedData.length} item(s) added!`, {
        style: {
          border: '2px solid green',
          padding: '16px',
          color: 'green',
        },
        iconTheme: {
          primary: 'green',
          secondary: '#FFFAEE',
        },
      });
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

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleExportJSON}
          title="Export as JSON"
          className="flex items-center gap-2 px-3 py-2 theme-bg-tertiary hover:theme-bg-primary theme-text-primary font-medium rounded-lg transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Export JSON
        </button>
        
        {csvHeaders && csvRowTransform && (
          <button
            onClick={handleExportCSV}
            title="Export as CSV"
            className="flex items-center gap-2 px-3 py-2 theme-bg-tertiary hover:theme-bg-primary theme-text-primary font-medium rounded-lg transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
        
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Import from JSON"
          className="flex items-center gap-2 px-3 py-2 theme-bg-tertiary hover:theme-bg-primary theme-text-primary font-medium rounded-lg transition-colors text-sm"
        >
          <Upload className="w-4 h-4" />
          Import JSON
        </button>




        {/* Notificationtester */}
        {/* <div>
      <button onClick={notify}>Make me a toast</button>
      <Toaster />
    </div> */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
          title="Import JSON file"
          aria-label="Import JSON file"
        />
      </div>
    </>
  );
}
