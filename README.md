# API Key Manager & Resource Organizer

A secure, full-featured web application for managing API keys, passwords, and organizing useful website resources. Built with React, TypeScript, Tailwind CSS, and Supabase.

## 🎯 Project Overview

This application serves two main purposes:
1. **API Key Manager** - Securely store and manage API keys, passwords, and credentials with AES-256 encryption
2. **Resource Organizer** - Organize and categorize useful websites, tools, and resources with an accordion-style interface

## 🆕 Latest Features (Recently Added)

### Multi-Page Service Navigation
- **Service Overview Grid** - Visual dashboard showing all services with icons, colors, and key counts
- **Dedicated Service Pages** - Click any service to view/manage only that service's keys
- **Grid/Table Toggle** - Switch between grid view (services) and table view (all keys)
- **URL Routing** - Navigate to `/api-keys/OpenAI` for service-specific management
- **Clickable Service Names** - Click service names in tables to navigate to service pages

### Mass Add Feature
- **Bulk Key Entry** - Add unlimited API keys in one operation
- **Dynamic Rows** - Add/remove rows as needed with a single click
- **Real-time Progress** - Beautiful gradient progress bar with step descriptions
- **Smart Filtering** - Automatically filters out empty rows before saving
- **Password Toggles** - Individual show/hide toggles for each row

### Mobile Responsiveness
- **Adaptive Layouts** - Desktop shows tables, mobile shows cards
- **Touch-Optimized** - All interactions optimized for touch devices
- **Responsive Grids** - Service cards adapt from 1-4 columns based on screen size
- **Mobile-First** - Designed with mobile users in mind

### AI-Powered Features (Resource Organizer)
- **Auto-fill** - AI automatically fills URL and description based on website name
- **Smart Descriptions** - Generate descriptions with a single click
- **Powered by Google Gemini** - Fast and accurate AI generation

## 📊 Project Statistics

- **Total Components**: 15+ React components
- **Total Pages**: 4 main sections (API Keys, Resources, Settings, Documentation)
- **Routes**: 6+ navigable routes
- **Database Tables**: 3 (api_keys, resource_categories, resources)
- **Pre-configured Services**: 10+ with custom icons and colors
- **Supported Themes**: 3 (Dark, Light, Emerald)
- **Export Formats**: 2 (JSON, CSV)
- **Mobile Responsive**: 100% - Works on all screen sizes
- **Security**: AES-256-GCM encryption + Row Level Security

## ✅ Completed Features

### Core Infrastructure
- [x] React + TypeScript + Vite setup
- [x] Tailwind CSS styling with custom theme system
- [x] Supabase backend integration
- [x] PostgreSQL database with Row Level Security (RLS)
- [x] User authentication (email/password)

### Theme System
- [x] Three complete themes: Dark (default), Light, and Emerald
- [x] Custom CSS variables for consistent theming
- [x] Persistent theme selection (localStorage)
- [x] Smooth theme transitions
- [x] Theme switcher in navigation

### API Key Management

- [x] **Database Schema**
  - [x] Encrypted storage for passwords and API keys
  - [x] Service name, email/username fields
  - [x] Notes and tags for organization
  - [x] Timestamps (created_at, updated_at)
  - [x] Row Level Security policies

- [x] **CRUD Operations**
  - [x] Create new API key entries
  - [x] Read/view all keys
  - [x] Update existing keys
  - [x] Delete keys with confirmation
  - [x] **Bulk/Mass Add** - Add multiple API keys at once

- [x] **Security Features**
  - [x] AES-256 encryption using Web Crypto API
  - [x] Session-based encryption keys
  - [x] Show/hide sensitive data
  - [x] Copy to clipboard functionality
  - [x] Automatic key clearing on logout
  - [x] Individual password visibility toggles

- [x] **Organization & Search**
  - [x] Tag-based categorization
  - [x] Search across service names, emails, and notes
  - [x] Filter by tags
  - [x] Sort by creation date
  - [x] **Service-based grouping and filtering**

- [x] **Data Management**
  - [x] Export to JSON format
  - [x] Export to CSV format
  - [x] Import from JSON file
  - [x] Encrypted data preservation on export
  - [x] **Service-specific export/import**

- [x] **Multi-Page Navigation**
  - [x] React Router integration
  - [x] URL-based routing
  - [x] Main dashboard with all services
  - [x] **Dedicated service pages** (e.g., `/api-keys/OpenAI`)
  - [x] Breadcrumb navigation
  - [x] Back button functionality

- [x] **Service Overview**
  - [x] **Service cards grid view**
  - [x] Service metadata (icons, colors, descriptions)
  - [x] 10+ pre-configured popular services
  - [x] Auto-generated colors for new services
  - [x] Key count per service
  - [x] Last updated timestamp per service
  - [x] **Grid/Table view toggle**
  - [x] Clickable service names

- [x] **Single Service Pages**
  - [x] Filtered view showing only one service's keys
  - [x] Service-specific header with icon and stats
  - [x] Add keys with pre-filled service name
  - [x] Mass add modal for bulk operations
  - [x] Service-scoped export/import
  - [x] Color-coded UI per service

- [x] **Mass Add Modal**
  - [x] Dynamic row addition/removal
  - [x] Unlimited entries in one operation
  - [x] Bulk encryption and database insert
  - [x] Real-time progress indicators
  - [x] Progress bar with step descriptions
  - [x] Password visibility toggles per row
  - [x] Smart empty row filtering
  - [x] Beautiful gradient UI

### User Interface
- [x] **Navigation**
  - [x] Multi-page navigation (API Keys, Settings, Documentation)
  - [x] Responsive header with user info
  - [x] Sign out functionality

- [x] **API Keys Page**
  - [x] Searchable data table
  - [x] **Grid view with service cards**
  - [x] **Table view with all keys**
  - [x] **View toggle switch**
  - [x] Inline edit and delete
  - [x] Show/hide sensitive fields
  - [x] Tag filtering
  - [x] Export/import buttons
  - [x] **Clickable service names** (navigate to service page)
  - [x] **Mobile-responsive card layout**
  - [x] **Desktop table layout**

- [x] **Settings Page**
  - [x] Account information display
  - [x] Theme selector with visual previews
  - [x] Sign out option

- [x] **Documentation Page**
  - [x] Security overview
  - [x] Usage instructions
  - [x] Best practices guide
  - [x] Organization tips

- [x] **Authentication**
  - [x] Sign up form
  - [x] Sign in form
  - [x] Error handling
  - [x] Loading states

### Design & Responsiveness
- [x] Clean, modern UI design
- [x] **Fully responsive layout** (mobile to desktop)
- [x] **Mobile-first approach**
- [x] **Adaptive table/card views**
  - [x] Desktop: Full table with all columns
  - [x] Mobile: Card-based layout
  - [x] Automatic switching based on screen size
- [x] Smooth animations and transitions
- [x] **Gradient progress bars**
- [x] **Service-specific color theming**
- [x] Consistent spacing and typography
- [x] Professional color schemes
- [x] Touch-friendly buttons on mobile
- [x] Hover effects on desktop

### Resource Organizer
- [x] **Database Schema**
  - [x] Resource categories table
  - [x] Resources table
  - [x] Migration files created
  - [x] **Applied to Supabase**

- [x] **Category Management**
  - [x] Create new categories
  - [x] Edit categories
  - [x] Delete categories with confirmation
  - [x] Category-based organization

- [x] **Resource Display**
  - [x] **Accordion-style layout**
  - [x] Expandable category sections
  - [x] Resource cards with name, URL, description
  - [x] Clickable website links (open in new tab)
  - [x] Favicon display from URLs
  - [x] Edit and delete buttons per resource
  - [x] **Collapsible resource details**

- [x] **Add Resource Functionality**
  - [x] Add resource modal/form
  - [x] Category selection dropdown
  - [x] **Create new category inline**
  - [x] URL validation
  - [x] Favicon auto-fetch
  - [x] **AI-powered auto-fill** (URL and description)
  - [x] **AI description generation**

- [x] **Organization Features**
  - [x] Search resources by name
  - [x] Filter by category
  - [x] **Tag-based filtering**
  - [x] Sort by category
  - [x] **Resource count per category**
  - [x] **Expand/collapse all functionality**

- [x] **Export/Import**
  - [x] Export to JSON
  - [x] Export to CSV
  - [x] Import from JSON
  - [x] Bulk import support

- [x] **Mobile Optimization**
  - [x] **Fully responsive accordion**
  - [x] **Mobile-optimized cards**
  - [x] Touch-friendly interactions
  - [x] Stacked layouts on small screens

## 🚧 Future Enhancements

### API Key Management
- [ ] **Advanced Features**
  - [ ] API key expiration tracking
  - [ ] Usage tracking and analytics
  - [ ] API key rotation reminders
  - [ ] Key strength validation
  - [ ] Duplicate detection
  - [ ] **Form validation** in Mass Add Modal
  - [ ] Batch editing (apply changes to multiple keys)

- [ ] **Service Management**
  - [ ] Custom service icons upload
  - [ ] Service templates (pre-filled forms)
  - [ ] Service grouping (e.g., "Development", "Production")
  - [ ] Favorite services
  - [ ] Recently viewed services

### Resource Organizer
- [ ] **Organization Features**
  - [ ] Drag-and-drop reordering
  - [ ] Nested categories
  - [ ] Resource bookmarklet (add from any page)
  - [ ] Duplicate URL detection

- [ ] **AI Enhancements**
  - [ ] Auto-categorization suggestions
  - [ ] Smart tag generation
  - [ ] Related resources recommendations

### Security & Authentication
- [ ] Master password for encryption key
- [ ] Two-factor authentication (2FA)
- [ ] Session timeout settings
- [ ] Biometric authentication support
- [ ] Security audit logs
- [ ] Password strength meter

### Data Management
- [ ] Automated scheduled backups
- [ ] Version history and restore
- [ ] Advanced import validation
- [ ] Merge duplicate entries
- [ ] Archive old/unused keys

### UI/UX Improvements
- [ ] Keyboard shortcuts
- [ ] Command palette (⌘K / Ctrl+K)
- [ ] Dark mode improvements
- [ ] Custom color themes
- [ ] Dashboard with statistics and charts
- [ ] Recent activity timeline
- [ ] Quick actions menu

### Integration & Export
- [ ] Browser extension (Chrome, Firefox, Edge)
- [ ] Mobile apps (iOS, Android)
- [ ] API for third-party tools
- [ ] Cloud vault integration (AWS Secrets Manager, HashiCorp Vault)
- [ ] Sync across devices
- [ ] Webhooks for automation
- [ ] CLI tool for developers

### Performance & Optimization
- [ ] Lazy loading for large datasets
- [ ] Virtual scrolling for tables
- [ ] Caching strategies
- [ ] Offline mode support
- [ ] Progressive Web App (PWA)

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS with custom theme system
- **Backend**: Supabase (PostgreSQL, Authentication, RLS)
- **Encryption**: Web Crypto API (AES-256-GCM)
- **AI Integration**: Google Gemini API (AI auto-fill & generation)
- **Icons**: Lucide React
- **State Management**: React Context API
- **Notifications**: React Hot Toast
- **Alerts**: SweetAlert2

## 📦 Database Schema

### Current Tables

#### `api_keys`
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key → auth.users)
- service_name: text
- email_username: text
- encrypted_password: text (AES-256 encrypted)
- encrypted_api_key: text (AES-256 encrypted)
- notes: text
- tags: text[]
- created_at: timestamptz
- updated_at: timestamptz
```

#### `resource_categories` (Migration file created)
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key → auth.users)
- name: text
- description: text
- icon: text
- created_at: timestamptz
- updated_at: timestamptz
```

#### `resources` (Migration file created)
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key → auth.users)
- category_id: uuid (foreign key → resource_categories)
- name: text
- url: text
- description: text
- favicon_url: text
- tags: text[]
- created_at: timestamptz
- updated_at: timestamptz
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Supabase account and project

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd api-key-manager
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run database migrations
Apply the migration files in `supabase/migrations/` to your Supabase project

5. Start the development server
```bash
npm run dev
```

6. Build for production
```bash
npm run build
```

## 🔐 Security Features

- **AES-256-GCM Encryption**: All passwords and API keys are encrypted client-side before storage
- **Row Level Security**: Database policies ensure users can only access their own data
- **Session-based Keys**: Encryption keys are generated per session and stored in sessionStorage
- **No Plaintext Storage**: Sensitive data is never stored or transmitted in plaintext
- **Automatic Cleanup**: Encryption keys are cleared on logout

## 📝 Usage

### Managing API Keys

#### Main Dashboard
1. Sign up or sign in to your account
2. Navigate to **API Keys** section
3. **Grid View** (default):
   - See all your services as cards
   - View key count per service
   - Click any service to view its keys
4. **Table View** (toggle):
   - See all keys in a table
   - Click service names to navigate
   - Search and filter across all keys

#### Adding Single Keys
1. Click "Add Key" button
2. Enter service name, credentials, and notes
3. Add tags for organization
4. Click "Save" to encrypt and store

#### Mass Adding Keys
1. Navigate to a service page (e.g., `/api-keys/OpenAI`)
2. Click "Mass Add Keys" button
3. Fill in multiple entries:
   - API Key (required)
   - Email/Username (optional)
   - Password (optional)
   - Notes (optional)
4. Click "Add Another Entry" for more rows
5. Click "Save All" to bulk insert
6. Watch real-time progress bar

#### Service Pages
- View all keys for a specific service
- Add keys with pre-filled service name
- Export/import service-specific data
- Color-coded service themes

#### Viewing & Managing Keys
1. **Desktop**: Full table with all columns
2. **Mobile**: Card-based layout
3. Use eye icon to reveal sensitive data
4. Click copy to clipboard for quick access
5. Edit or delete individual keys
6. Filter by tags or search

#### Export & Import
1. Export all keys (JSON/CSV)
2. Export by service (filtered)
3. Import from JSON file
4. Encrypted data preserved

### Managing Resources

#### Adding Resources
1. Navigate to **Websites** section
2. Click "Add Resource" button
3. Fill in resource details:
   - Category (select or create new)
   - Website name
   - URL
   - Description
4. Use **AI Auto-fill** for URL and description
5. Use **AI Generate** for description only

#### Organizing Resources
1. Resources grouped by category
2. Expand/collapse categories
3. Search across all resources
4. Export/import your collection

### Theme Switching
1. Click the theme icon in the navigation bar
2. Cycles through: Light → Dark → Emerald
3. Theme preference is saved automatically

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Supabase](https://supabase.com)
- Icons from [Lucide](https://lucide.dev)
- Styled with [Tailwind CSS](https://tailwindcss.com)
