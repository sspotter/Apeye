# Service Documentation & Notes Feature

## 🎯 Overview

A collapsible markdown editor/viewer for each service page that allows you to store documentation, code snippets, integration notes, and API usage examples.

## ✨ Key Features

### 1. **Collapsible Section**
- Expandable/collapsible panel above the API keys table
- Shows line count preview when collapsed
- Clean, minimal design that doesn't clutter the page

### 2. **Markdown Support**
- Write formatted documentation with markdown
- Supports:
  - **Headers** (`#`, `##`, `###`)
  - **Code blocks** (```)
  - **Inline code** (`)
  - **Lists** (`-`, `*`)
  - **Bold text** (`**text**`)
  - Line breaks and paragraphs

### 3. **Edit/View Modes**
- **View Mode**: Beautiful rendered markdown
- **Edit Mode**: Textarea with markdown syntax
- Toggle between modes with Edit button
- Auto-save on "Save" button

### 4. **File Upload**
- Upload existing `.md` or `.markdown` files
- Drag existing documentation into the app
- Automatically populates the editor

### 5. **Per-Service Storage**
- Each service has its own markdown notes
- Notes are tied to service name
- Stored securely in Supabase with RLS

## 📊 Use Cases

### API Integration Documentation
```markdown
# OpenAI API Integration

## Setup
1. Get API key from https://platform.openai.com
2. Set environment variable: `OPENAI_API_KEY`

## Example Code
```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const response = await client.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello!" }]
});
```

## Rate Limits
- Free tier: 3 RPM
- Paid tier: 60 RPM
```

### Stripe Payment Setup
```markdown
# Stripe Payment Integration

## Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Webhooks
Endpoint: https://myapp.com/api/webhooks/stripe
Events: payment_intent.succeeded, customer.subscription.updated

## Testing
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
```

### AWS Configuration
```markdown
# AWS Configuration Notes

## Required IAM Permissions
- `s3:PutObject`
- `s3:GetObject`
- `cloudfront:CreateInvalidation`

## Deployment Command
```bash
aws s3 sync ./dist s3://my-bucket --delete
aws cloudfront create-invalidation --distribution-id E1234 --paths "/*"
```

## Environment Variables
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION=us-east-1`
```

## 🗄️ Database Schema

### Table: `service_notes`

```sql
CREATE TABLE service_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  markdown_content TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, service_name)
);
```

### Key Points:
- **One note per service per user** (unique constraint)
- **Cascade delete** when user is deleted
- **Row Level Security** enabled
- **Auto-updated timestamp** on updates

## 🎨 UI Components

### MarkdownNotesSection
Location: `src/components/MarkdownNotesSection.tsx`

**Props:**
- `serviceName: string` - The service to load notes for

**Features:**
- Collapsible header with chevron icon
- Edit/View mode toggle
- Save/Cancel buttons
- File upload input
- Markdown renderer
- Loading states

### States:
```typescript
isExpanded: boolean      // Panel open/closed
isEditing: boolean       // Edit/View mode
content: string          // Current markdown
originalContent: string  // Backup for cancel
loading: boolean         // Fetching from DB
saving: boolean          // Saving to DB
noteId: string | null    // DB record ID
```

## 🔧 Implementation

### 1. Apply Database Migration

```bash
# Apply the migration to your Supabase project
psql -h db.xxxxxxxxxxxx.supabase.co -U postgres -d postgres -f supabase/migrations/20250115_create_service_notes.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Paste migration content
3. Run query

### 2. Component Integration

Already integrated in `WebsitePage.tsx`:

```tsx
<MarkdownNotesSection serviceName={decodedServiceName} />
```

### 3. Usage Flow

1. **Navigate to service page** (e.g., `/api-keys/OpenAI`)
2. **Click the collapsed section** to expand
3. **Click "Edit"** to enter edit mode
4. **Write markdown** or upload a `.md` file
5. **Click "Save"** to persist to database
6. **Click outside or toggle** to view rendered markdown

## 📝 Markdown Rendering

### Supported Syntax:

| Syntax | Example | Rendered |
|--------|---------|----------|
| Headers | `# Title` | <h1>Title</h1> |
| Subheaders | `## Section` | <h2>Section</h2> |
| Code blocks | ` ```js ... ``` ` | Syntax highlighted block |
| Inline code | `` `const x = 1` `` | `const x = 1` |
| Lists | `- Item` | • Item |
| Bold | `**text**` | **text** |

### Rendering Logic:
- Simple regex-based parser
- Converts markdown to React components
- Styled with theme classes
- Code blocks with monospace font
- Proper spacing and typography

## 🔐 Security

### Row Level Security Policies:

```sql
-- Users can only view their own notes
CREATE POLICY "Users can view their own service notes"
  ON service_notes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own notes
CREATE POLICY "Users can insert their own service notes"
  ON service_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own notes
CREATE POLICY "Users can update their own service notes"
  ON service_notes FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own notes
CREATE POLICY "Users can delete their own service notes"
  ON service_notes FOR DELETE
  USING (auth.uid() = user_id);
```

## 🎯 Benefits

### For Developers:
- **Quick Reference** - Code snippets right where you need them
- **Context Switching** - No need to jump to external docs
- **Team Knowledge** - Share setup instructions
- **Version Control** - Track what works with each API version

### For Teams:
- **Onboarding** - New developers can see setup steps
- **Consistency** - Same integration approach across team
- **Documentation** - Living docs that stay updated
- **Best Practices** - Share learned patterns

### For Organization:
- **Centralized Knowledge** - All API docs in one place
- **Reduced Errors** - Copy-paste working examples
- **Faster Development** - No searching for examples
- **Better Maintenance** - Update notes as APIs change

## 🚀 Future Enhancements

### Potential Features:
- [ ] **Rich text editor** (WYSIWYG)
- [ ] **Syntax highlighting** for code blocks (e.g., Prism.js)
- [ ] **Markdown preview** (side-by-side edit/preview)
- [ ] **Version history** (track changes over time)
- [ ] **Templates** (pre-filled common patterns)
- [ ] **Search** within notes
- [ ] **Export** notes to PDF or HTML
- [ ] **Link detection** (auto-link URLs)
- [ ] **Image upload** support
- [ ] **Collaborative editing** (real-time)
- [ ] **AI assistance** (generate documentation)

## 📊 Example Templates

### API Configuration Template
```markdown
# {{SERVICE_NAME}} API

## Authentication
Type: [API Key / OAuth / Bearer Token]
Location: [Header / Query Param / Body]

## Base URL
Production: https://api.example.com/v1
Staging: https://staging.api.example.com/v1

## Common Endpoints
- GET /users - List users
- POST /users - Create user
- PUT /users/:id - Update user

## Example Request
```http
GET /users HTTP/1.1
Host: api.example.com
Authorization: Bearer YOUR_API_KEY
```
```

### Webhook Configuration Template
```markdown
# Webhook Setup

## Endpoint
URL: https://myapp.com/webhooks/{{service}}
Method: POST

## Events to Subscribe
- [ ] user.created
- [ ] user.updated
- [ ] payment.succeeded

## Signature Verification
```javascript
const crypto = require('crypto');
const signature = req.headers['x-signature'];
const payload = JSON.stringify(req.body);
const expected = crypto
  .createHmac('sha256', process.env.WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');
  
if (signature !== expected) {
  throw new Error('Invalid signature');
}
```
```

## ✅ Testing Checklist

- [ ] Database migration applied successfully
- [ ] Can expand/collapse the section
- [ ] Can enter edit mode
- [ ] Can save markdown content
- [ ] Can cancel without saving
- [ ] Can upload `.md` file
- [ ] Markdown renders correctly
- [ ] Code blocks display properly
- [ ] Different services have separate notes
- [ ] Notes persist after page refresh
- [ ] RLS policies prevent unauthorized access

---

**Status:** ✅ Complete and ready to use!

This feature transforms the API Key Manager into a comprehensive API documentation hub. 🚀
