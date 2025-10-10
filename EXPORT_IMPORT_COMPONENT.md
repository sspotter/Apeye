# Export/Import Component

## Overview
Created a reusable `ExportImportButtons` component that provides export (JSON/CSV) and import (JSON) functionality for any data type.

## Component Location
`src/components/ExportImportButtons.tsx`

## Features
- **Export to JSON**: Exports data as formatted JSON with customizable transformation
- **Export to CSV**: Exports data as CSV with custom headers and row transformations
- **Import from JSON**: Imports data from JSON files with validation
- **Generic/Reusable**: Works with any data type using TypeScript generics
- **Accessible**: Includes proper ARIA labels and title attributes

## Usage

### In API Keys Page
```tsx
<ExportImportButtons
  data={apiKeys}
  onImport={handleImportApiKeys}
  exportFileName="api-keys-backup"
  exportDataTransform={(keys) => keys.map(key => ({
    service_name: key.service_name,
    // ... other fields
  }))}
  csvHeaders={['Service Name', 'Email/Username', 'Notes', 'Tags', 'Created At', 'Updated At']}
  csvRowTransform={(key) => [
    key.service_name,
    key.email_username,
    // ... other fields
  ]}
/>
```

### In Resources/Tester Page
```tsx
<ExportImportButtons
  data={resources.map(resource => ({
    ...resource,
    category_name: category?.name || 'Unknown'
  }))}
  onImport={handleImportResources}
  exportFileName="resources-backup"
  exportDataTransform={(items) => items.map(item => ({
    name: item.name,
    url: item.url,
    description: item.description,
    category_name: item.category_name,
  }))}
  csvHeaders={['Name', 'URL', 'Description', 'Category', 'Created At']}
  csvRowTransform={(item) => [
    item.name,
    item.url,
    item.description.replace(/,/g, ';'),
    item.category_name,
  ]}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `T[]` | Array of data to export |
| `onImport` | `(data: T[]) => Promise<void>` | Async function to handle imported data |
| `exportFileName` | `string` | Base name for exported files (date will be appended) |
| `exportDataTransform?` | `(data: T[]) => any[]` | Optional function to transform data before JSON export |
| `csvHeaders?` | `string[]` | CSV column headers (required for CSV export) |
| `csvRowTransform?` | `(item: T) => string[]` | Function to transform each item to CSV row (required for CSV export) |

## Import Handler Examples

### API Keys Import Handler
```tsx
const handleImportApiKeys = async (importedData: any[]) => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Not authenticated');

  const importData = importedData.map(item => ({
    user_id: user.id,
    service_name: item.service_name,
    // ... map imported fields
  }));

  const { error } = await supabase
    .from('api_keys')
    .insert(importData);

  if (error) throw new Error('Failed to import data');
  await fetchApiKeys();
};
```

### Resources Import Handler
```tsx
const handleImportResources = async (importedData: any[]) => {
  if (!user) throw new Error('Not authenticated');

  // Create category map and handle new categories
  const categoryMap = new Map<string, string>();
  categories.forEach(cat => categoryMap.set(cat.name.toLowerCase(), cat.id));

  // Create new categories if needed
  // ... category creation logic

  // Insert resources
  const { error } = await supabase
    .from('resources')
    .insert(importData);

  if (error) throw new Error('Failed to import resources');
  await fetchData();
};
```

## File Naming Convention
Exported files are automatically named with the format:
`{exportFileName}-{YYYY-MM-DD}.{json|csv}`

Example: `api-keys-backup-2025-10-10.json`

## Benefits
1. **DRY Principle**: Single component for all export/import needs
2. **Type Safety**: Uses TypeScript generics for type safety
3. **Flexibility**: Customizable transformations for different data structures
4. **Consistency**: Uniform UI/UX across different pages
5. **Maintainability**: Changes to export/import logic only need to be made in one place
