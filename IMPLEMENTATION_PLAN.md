# Multi-Page API Key Manager - Implementation Plan

## 📋 Overview
Transform the current single-page API Key Manager into a multi-page system where users can:
1. View all API keys from all services (Main Dashboard)
2. Click a service name to view only that service's keys (Single Website Page)
3. Mass add multiple API keys for a specific service

---

## 🏗️ Architecture Changes

### Current Structure
```
ApiKeysPage.tsx (Main page - shows all keys)
├── ApiKeysTable.tsx (Table/Card display)
├── ApiKeyModal.tsx (Add/Edit single key)
└── ExportImportButtons.tsx (Import/Export)
```

### New Structure
```
ApiKeysPage.tsx (Main Dashboard - shows all keys, services clickable)
├── ApiKeysTable.tsx (Table/Card display with clickable services)
├── ApiKeyModal.tsx (Add/Edit single key)
├── ExportImportButtons.tsx (Import/Export)
└── ServiceOverview.tsx (NEW - Shows service cards/stats)

WebsitePage.tsx (NEW - Single service view)
├── WebsiteHeader.tsx (NEW - Service info, back button)
├── ApiKeysTable.tsx (Reused - filtered for service)
├── MassAddModal.tsx (NEW - Add multiple keys at once)
└── ExportImportButtons.tsx (Reused - for service)
```

---

## 🎯 Implementation Steps

### Phase 1: Data & Routing Setup
**Goal:** Enable navigation between pages

#### 1.1 Create Routing Structure
- [ ] Install/configure React Router (if not already)
- [ ] Create routes:
  - `/api-keys` - Main Dashboard
  - `/api-keys/:serviceName` - Single Website Page

#### 1.2 Database Schema Check
Current `api_keys` table has:
- ✅ `service_name` - Used to group by website
- ✅ `email_username`
- ✅ `encrypted_password`
- ✅ `encrypted_api_key`
- ✅ `notes`
- ✅ `tags`
- ✅ `created_at`, `updated_at`

**No schema changes needed!** ✅

---

### Phase 2: Main Dashboard Enhancements
**Goal:** Show services overview and make service names clickable

#### 2.1 Create ServiceOverview Component
**File:** `src/components/ServiceOverview.tsx`

**Features:**
- Card grid showing each unique service
- Display:
  - Service name
  - Number of API keys
  - Last updated date
  - Quick action buttons
- Click card → navigate to service page

**Design:**
```tsx
// Service Card Example
┌─────────────────────────────┐
│ 🌐 OpenAI                   │
│ 5 API Keys                  │
│ Last updated: Oct 15, 2025  │
│ [View All] [+ Add Keys]     │
└─────────────────────────────┘
```

#### 2.2 Update ApiKeysTable
- Make `service_name` clickable
- On click → navigate to `/api-keys/:serviceName`
- Add hover effect for clickable names

#### 2.3 Update ApiKeysPage
- Add toggle: Grid View (services) vs Table View (all keys)
- Add service statistics section
- Keep existing search/filter functionality

---

### Phase 3: Single Website Page
**Goal:** Dedicated page for managing one service's keys

#### 3.1 Create WebsitePage Component
**File:** `src/components/WebsitePage.tsx`

**Features:**
- URL parameter: `/api-keys/OpenAI`
- Header section:
  - Large service name
  - Description (optional, from metadata)
  - Key count
  - Back to Dashboard button
  - Export button (filtered)
- Filter API keys by `service_name`
- Reuse `ApiKeysTable` with filtered data
- Add Mass Add button

**Layout:**
```
┌────────────────────────────────────────────┐
│ ← Back to Dashboard                        │
│                                            │
│ OpenAI                                     │
│ AI model APIs for production and research  │
│ 5 API Keys | Last updated: Today          │
│                                            │
│ [+ Mass Add] [+ Add Single] [Export]      │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│         API Keys Table (filtered)          │
└────────────────────────────────────────────┘
```

#### 3.2 Create WebsiteHeader Component
**File:** `src/components/WebsiteHeader.tsx`

**Props:**
- `serviceName: string`
- `keyCount: number`
- `description?: string`
- `onBack: () => void`
- `onMassAdd: () => void`
- `onExport: () => void`

---

### Phase 4: Mass Add Feature
**Goal:** Add multiple API keys at once

#### 4.1 Create MassAddModal Component
**File:** `src/components/MassAddModal.tsx`

**Features:**
- Dynamic row addition/removal
- Each row has:
  - Email/Username
  - Password
  - API Key (required)
  - Notes
- Validation before saving
- Preview before final save
- Save all → bulk insert to database

**UI Structure:**
```tsx
┌─────────────────────────────────────────────┐
│ Mass Add API Keys - OpenAI            [X]   │
├─────────────────────────────────────────────┤
│                                             │
│ Row 1                            [Remove]   │
│ Email:    [_______________]                 │
│ Password: [_______________] [👁]           │
│ API Key:  [_______________] * Required      │
│ Notes:    [_______________]                 │
│                                             │
│ Row 2                            [Remove]   │
│ Email:    [_______________]                 │
│ Password: [_______________] [👁]           │
│ API Key:  [_______________] * Required      │
│ Notes:    [_______________]                 │
│                                             │
│ [+ Add Another Row]                         │
│                                             │
│ Total: 2 keys to add                        │
│                                             │
│ [Cancel]              [Save All (2 keys)]   │
└─────────────────────────────────────────────┘
```

**State Management:**
```tsx
interface ApiKeyRow {
  id: string; // temporary ID for row
  email_username: string;
  password: string;
  api_key: string;
  notes: string;
}

const [rows, setRows] = useState<ApiKeyRow[]>([
  { id: crypto.randomUUID(), email_username: '', password: '', api_key: '', notes: '' }
]);
```

**Functions:**
- `addRow()` - Add new empty row
- `removeRow(id)` - Remove specific row
- `updateRow(id, field, value)` - Update row field
- `validateRows()` - Check all API keys filled
- `handleSaveAll()` - Bulk insert to database

#### 4.2 Bulk Insert Logic
```tsx
const handleMassAdd = async (rows: ApiKeyRow[]) => {
  const user = await supabase.auth.getUser();
  
  const dataToInsert = rows.map(row => ({
    user_id: user.data.user!.id,
    service_name: serviceName, // from page context
    email_username: row.email_username,
    encrypted_password: row.password ? await encrypt(row.password) : '',
    encrypted_api_key: await encrypt(row.api_key),
    notes: row.notes,
    tags: []
  }));
  
  const { error } = await supabase
    .from('api_keys')
    .insert(dataToInsert);
    
  if (!error) {
    toast.success(`Successfully added ${rows.length} API keys!`);
    refreshKeys();
    closeModal();
  }
};
```

---

### Phase 5: Enhanced Features

#### 5.1 Service Metadata (Optional)
Add service descriptions and icons:

```tsx
// src/lib/serviceMetadata.ts
export const serviceMetadata: Record<string, {
  description: string;
  icon: string;
  color: string;
}> = {
  'OpenAI': {
    description: 'AI model APIs for production and research',
    icon: '🤖',
    color: '#10a37f'
  },
  'Stripe': {
    description: 'Payment processing APIs',
    icon: '💳',
    color: '#635bff'
  },
  'Google Cloud': {
    description: 'Cloud services and APIs',
    icon: '☁️',
    color: '#4285f4'
  }
  // Add more as needed
};
```

#### 5.2 Service Statistics Dashboard
Show aggregated stats on main page:
- Total services
- Total API keys
- Recently updated services
- Most used services

#### 5.3 Bulk Operations
On single website page:
- Select multiple keys
- Bulk delete
- Bulk export
- Bulk tag editing

---

## 🎨 UI/UX Considerations

### Navigation Flow
```
Main Dashboard
    │
    ├── Click "OpenAI" → Website Page (OpenAI)
    │       │
    │       ├── Mass Add → Modal
    │       ├── Add Single → Modal
    │       └── Back → Main Dashboard
    │
    ├── Click "Stripe" → Website Page (Stripe)
    └── ...
```

### Responsive Design
- **Desktop:** 
  - Main: Service grid (3-4 columns) + table below
  - Website: Full table with sidebar stats
  
- **Mobile:**
  - Main: Service cards (1 column) + card view
  - Website: Stacked cards with collapsible sections

### Color Coding
- Each service gets a color (from metadata or auto-generated)
- Use color in service cards, headers, badges

---

## 🔧 Technical Implementation

### Routing Setup
```tsx
// App.tsx or Router.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<Routes>
  <Route path="/api-keys" element={<ApiKeysPage />} />
  <Route path="/api-keys/:serviceName" element={<WebsitePage />} />
</Routes>
```

### Service Name Encoding
Handle special characters in service names:
```tsx
// Navigate
navigate(`/api-keys/${encodeURIComponent(serviceName)}`);

// Read
const { serviceName } = useParams();
const decodedName = decodeURIComponent(serviceName || '');
```

### Data Fetching Optimization
```tsx
// Cache service list
const [services, setServices] = useState<string[]>([]);

// Get unique services
const uniqueServices = [...new Set(apiKeys.map(key => key.service_name))].sort();

// Count by service
const serviceCounts = apiKeys.reduce((acc, key) => {
  acc[key.service_name] = (acc[key.service_name] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
```

---

## ✅ Testing Checklist

### Main Dashboard
- [ ] Service cards display correctly
- [ ] Service names are clickable
- [ ] Click navigates to correct service page
- [ ] Search filters work across all keys
- [ ] Tag filter works
- [ ] Export all keys works
- [ ] Add single key works

### Website Page
- [ ] Correct service name in URL
- [ ] Only shows keys for that service
- [ ] Back button works
- [ ] Mass add modal opens
- [ ] Add single key works
- [ ] Export filtered keys works
- [ ] Edit/Delete work
- [ ] Mobile view works

### Mass Add Modal
- [ ] Add row works
- [ ] Remove row works
- [ ] Form validation works
- [ ] Save all inserts correctly
- [ ] Toast notifications work
- [ ] Encryption works for passwords
- [ ] Modal closes after save
- [ ] Keys refresh after save

---

## 🚀 Deployment Order

1. **Phase 1:** Routing setup (1-2 hours)
2. **Phase 2:** Main Dashboard enhancements (2-3 hours)
3. **Phase 3:** Website Page (2-3 hours)
4. **Phase 4:** Mass Add Modal (3-4 hours)
5. **Phase 5:** Polish & enhancements (2-3 hours)

**Total Estimated Time:** 10-15 hours

---

## 📝 Next Immediate Steps

1. ✅ Review this plan
2. Install React Router (if needed)
3. Create `ServiceOverview.tsx`
4. Update `ApiKeysTable.tsx` (make service names clickable)
5. Create `WebsitePage.tsx`
6. Create `MassAddModal.tsx`
7. Test & polish

---

Ready to start implementation! 🚀
