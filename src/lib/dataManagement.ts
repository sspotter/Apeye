import { supabase } from './supabase';
import type { ApiKey } from './supabase';

export interface DatabaseExport {
  version: string;
  exportedAt: string;
  userId: string;
  data: {
    apiKeys: ApiKey[];
    serviceNotes: ServiceNote[];
    resourceCategories: ResourceCategory[];
    resources: Resource[];
  };
}

interface ServiceNote {
  id: string;
  user_id: string;
  service_name: string;
  markdown_content: string;
  created_at: string;
  updated_at: string;
}

interface ResourceCategory {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

interface Resource {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  url: string;
  description: string;
  created_at: string;
}

/**
 * Export all user data from the database
 */
export async function exportAllData(
  onProgress?: (step: string, progress: number) => void
): Promise<DatabaseExport> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const exportData: DatabaseExport = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    userId: user.id,
    data: {
      apiKeys: [],
      serviceNotes: [],
      resourceCategories: [],
      resources: []
    }
  };

  // Step 1: Export API Keys
  onProgress?.('Exporting API Keys...', 25);
  const { data: apiKeys, error: apiKeysError } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', user.id);

  if (apiKeysError) throw apiKeysError;
  exportData.data.apiKeys = apiKeys || [];

  // Step 2: Export Service Notes
  onProgress?.('Exporting Service Notes...', 50);
  const { data: serviceNotes, error: notesError } = await supabase
    .from('service_notes')
    .select('*')
    .eq('user_id', user.id);

  if (notesError) throw notesError;
  exportData.data.serviceNotes = serviceNotes || [];

  // Step 3: Export Resource Categories
  onProgress?.('Exporting Resource Categories...', 75);
  const { data: categories, error: categoriesError } = await supabase
    .from('resource_categories')
    .select('*')
    .eq('user_id', user.id);

  if (categoriesError) throw categoriesError;
  exportData.data.resourceCategories = categories || [];

  // Step 4: Export Resources
  onProgress?.('Exporting Resources...', 90);
  const { data: resources, error: resourcesError } = await supabase
    .from('resources')
    .select('*')
    .eq('user_id', user.id);

  if (resourcesError) throw resourcesError;
  exportData.data.resources = resources || [];

  onProgress?.('Export Complete!', 100);
  
  return exportData;
}

/**
 * Import all user data into the database
 * @param data - The exported data to import
 * @param mode - 'merge' to keep existing data, 'replace' to delete first
 */
export async function importAllData(
  data: DatabaseExport,
  mode: 'merge' | 'replace' = 'merge',
  onProgress?: (step: string, progress: number) => void
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Validate data structure
  if (!data.data || !data.version) {
    throw new Error('Invalid import file format');
  }

  // If replace mode, delete existing data first
  if (mode === 'replace') {
    onProgress?.('Clearing existing data...', 10);
    
    await supabase.from('resources').delete().eq('user_id', user.id);
    await supabase.from('resource_categories').delete().eq('user_id', user.id);
    await supabase.from('service_notes').delete().eq('user_id', user.id);
    await supabase.from('api_keys').delete().eq('user_id', user.id);
  }

  // Step 1: Import API Keys
  if (data.data.apiKeys && data.data.apiKeys.length > 0) {
    onProgress?.('Importing API Keys...', 30);
    
    const apiKeysToImport = data.data.apiKeys.map(key => {
      const { id, ...rest } = key;
      return {
        ...rest,
        user_id: user.id,
        ...(mode === 'replace' && { id }) // Only include id if replace mode
      };
    });

    const { error: apiKeysError } = await supabase
      .from('api_keys')
      .upsert(apiKeysToImport, { onConflict: 'id' });

    if (apiKeysError) throw apiKeysError;
  }

  // Step 2: Import Service Notes
  if (data.data.serviceNotes && data.data.serviceNotes.length > 0) {
    onProgress?.('Importing Service Notes...', 50);
    
    const notesToImport = data.data.serviceNotes.map(note => {
      const { id, ...rest } = note;
      return {
        ...rest,
        user_id: user.id,
        ...(mode === 'replace' && { id })
      };
    });

    const { error: notesError } = await supabase
      .from('service_notes')
      .upsert(notesToImport, { onConflict: 'id' });

    if (notesError) throw notesError;
  }

  // Step 3: Import Resource Categories
  if (data.data.resourceCategories && data.data.resourceCategories.length > 0) {
    onProgress?.('Importing Resource Categories...', 70);
    
    const categoriesToImport = data.data.resourceCategories.map(cat => {
      const { id, ...rest } = cat;
      return {
        ...rest,
        user_id: user.id,
        ...(mode === 'replace' && { id })
      };
    });

    const { error: categoriesError } = await supabase
      .from('resource_categories')
      .upsert(categoriesToImport, { onConflict: 'id' });

    if (categoriesError) throw categoriesError;
  }

  // Step 4: Import Resources
  if (data.data.resources && data.data.resources.length > 0) {
    onProgress?.('Importing Resources...', 90);
    
    const resourcesToImport = data.data.resources.map(res => {
      const { id, ...rest } = res;
      return {
        ...rest,
        user_id: user.id,
        ...(mode === 'replace' && { id })
      };
    });

    const { error: resourcesError } = await supabase
      .from('resources')
      .upsert(resourcesToImport, { onConflict: 'id' });

    if (resourcesError) throw resourcesError;
  }

  onProgress?.('Import Complete!', 100);
}

/**
 * Download exported data as JSON file
 */
export function downloadExportFile(data: DatabaseExport, filename?: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `api-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse imported JSON file
 */
export async function parseImportFile(file: File): Promise<DatabaseExport> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        resolve(json);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Get statistics about exported data
 */
export function getDataStats(data: DatabaseExport): {
  apiKeys: number;
  serviceNotes: number;
  categories: number;
  resources: number;
  total: number;
} {
  return {
    apiKeys: data.data.apiKeys?.length || 0,
    serviceNotes: data.data.serviceNotes?.length || 0,
    categories: data.data.resourceCategories?.length || 0,
    resources: data.data.resources?.length || 0,
    total: 
      (data.data.apiKeys?.length || 0) +
      (data.data.serviceNotes?.length || 0) +
      (data.data.resourceCategories?.length || 0) +
      (data.data.resources?.length || 0)
  };
}

/**
 * Clear all user data from the database
 */
export async function clearAllData(
  onProgress?: (step: string, progress: number) => void
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Step 1: Delete Resources
  onProgress?.('Deleting Resources...', 25);
  const { error: resourcesError } = await supabase
    .from('resources')
    .delete()
    .eq('user_id', user.id);
  
  if (resourcesError) throw resourcesError;

  // Step 2: Delete Resource Categories
  onProgress?.('Deleting Resource Categories...', 50);
  const { error: categoriesError } = await supabase
    .from('resource_categories')
    .delete()
    .eq('user_id', user.id);
  
  if (categoriesError) throw categoriesError;

  // Step 3: Delete Service Notes
  onProgress?.('Deleting Service Notes...', 75);
  const { error: notesError } = await supabase
    .from('service_notes')
    .delete()
    .eq('user_id', user.id);
  
  if (notesError) throw notesError;

  // Step 4: Delete API Keys
  onProgress?.('Deleting API Keys...', 90);
  const { error: apiKeysError } = await supabase
    .from('api_keys')
    .delete()
    .eq('user_id', user.id);
  
  if (apiKeysError) throw apiKeysError;

  onProgress?.('All Data Cleared!', 100);
}
