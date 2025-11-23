# Supabase Database Setup

## Quick Setup

1. Create a new Supabase project at [https://app.supabase.com](https://app.supabase.com)

2. Copy the `.env.example` file to `.env`:

   ```bash
   cp .env.example .env
   ```

3. Get your Supabase credentials:
   - Go to Project Settings > API
   - Copy the **Project URL** and paste it as `VITE_SUPABASE_URL`
   - Copy the **anon/public key** and paste it as `VITE_SUPABASE_ANON_KEY`
   - Copy the **project reference** from your URL (e.g., `xskaqpxcxdpepaoirowf`) and paste it as `SUPABASE_PROJECT_REF`
   - Copy your **database password** and paste it as `DB_PASSWORD`

4. Link your local project to Supabase (one-time setup):

   ```bash
   npm run db:link
   ```

   (It will prompt for your database password)

5. Run the database migration:
   ```bash
   npm run db:push
   ```

## Database Scripts

After linking your project, you can use these npm scripts:

- `npm run db:link` - Link your local project to Supabase (one-time setup)
- `npm run db:push` - Push new migrations to the remote database
- `npm run db:pull` - Pull schema changes from the remote database
- `npm run db:diff` - Show differences between local and remote schema
- `npm run db:reset` - Reset local database to current migrations

## Creating New Migrations

1. Create a new file in `supabase/migrations/` with the format: `YYYYMMDD_description.sql`
2. Write your SQL changes in the file
3. Run `npm run db:push` to apply the migration to your remote database

## Database Schema

### Tables

**events**

- `id` (UUID): Primary key
- `name` (TEXT): Event name (e.g., "Weihnachten 2025")
- `slug` (TEXT): URL-friendly slug (unique)
- `admin_token` (TEXT): Secret token for admin access (unique)
- `created_at` (TIMESTAMP): Creation timestamp

**participants**

- `id` (UUID): Primary key
- `event_id` (UUID): Foreign key to events
- `name` (TEXT): Participant name
- `token` (TEXT): Unique token for participant access
- `has_drawn` (BOOLEAN): Whether participant has drawn a name
- `drawn_at` (TIMESTAMP): When they drew (nullable)
- Unique constraint on `(event_id, name)`

**draws**

- `id` (UUID): Primary key
- `event_id` (UUID): Foreign key to events
- `drawer_id` (UUID): Who is drawing (participant)
- `drawn_id` (UUID): Who was drawn (participant)
- `created_at` (TIMESTAMP): When the draw happened
- Check constraint: `drawer_id != drawn_id` (can't draw yourself)

## Row Level Security (RLS)

Currently, this app uses token-based authentication without user accounts, so RLS is not configured. The anon key is safe to use on the client since:

- All data access is controlled via unique tokens
- No sensitive data is stored (just names and gift assignments)
- Tokens are randomly generated UUIDs

For production use, you may want to add RLS policies for additional security.
