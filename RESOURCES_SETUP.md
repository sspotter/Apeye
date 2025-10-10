# Resource Library Setup

## Database Migration

To set up the Resource Library feature, you need to run the database migration:

### Option 1: Using Supabase CLI (Recommended)

```bash
# Make sure you're logged in to Supabase CLI
supabase login

# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

### Option 2: Manual SQL Execution

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/20251010000000_create_resources_schema.sql`
4. Click **Run** to execute the migration

## Database Schema

The migration creates two tables:

### `resource_categories`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `name` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### `resources`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `category_id` (UUID, Foreign Key to resource_categories)
- `name` (TEXT)
- `url` (TEXT)
- `description` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Automatic Timestamps**: `updated_at` is automatically updated on record changes
- **Cascade Deletes**: Deleting a category automatically deletes its resources
- **Indexed Queries**: Optimized for fast lookups by user_id and category_id

## Usage

Once the migration is complete, navigate to the **Tester** page in your dashboard to start organizing your resources!
