# Wichtel App (Secret Santa)

A family-friendly Secret Santa/Wichtel web app for organizing gift exchanges.

## Tech Stack

- **Frontend**: TanStack Start (React Router SSR framework)
- **UI**: Mantine v8 (with SSR workarounds for TanStack Start)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password) with Row Level Security

## Key Features

### Admin Features

- **User Accounts**: Sign up and log in to manage your events
- **Dashboard**: View all your events at `/` with participant stats and draw progress
- **Event Management**:
  - Create events with participant names and event dates
  - View participant links with copy functionality
  - Copy all participant links at once for easy sharing
  - Regenerate individual participant links with confirmation modal
- **Draw Results**: View who drew whom after the event date passes (date-gated visibility)
- **Date-Based Visibility**: Draw results hidden until event date to preserve surprise

### Participant Features

- Each participant gets a unique link to draw their Secret Santa
- Can't draw yourself or already-drawn names
- Simple, mobile-friendly draw interface

### Security

- Row Level Security (RLS) policies protect user data
- Each admin can only see and manage their own events
- Token-based participant access (no accounts needed for participants)

## Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Fill in your Supabase credentials (see supabase/README.md)
   ```

3. **Link to Supabase and run migrations** (one-time setup):

   ```bash
   npm run db:link
   npm run db:push
   ```

4. **Start dev server**:
   ```bash
   npm run dev
   ```

## Important npm Scripts

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Database

- `npm run db:link` - Link to Supabase project (one-time setup)
- `npm run db:push` - Push migrations to remote database
- `npm run db:pull` - Pull schema from remote database
- `npm run db:diff` - Show schema differences

### Code Quality

- `npm run format` - Format code with Prettier
- `npm run lint` - Lint code with ESLint

## Project Structure

```plaintext
src/
├── routes/          # TanStack Start file-based routes
│   ├── __root.tsx   # Root layout with Mantine setup
│   └── index.tsx    # Home page
├── utils/
│   └── supabase.ts  # Supabase client setup
supabase/
├── migrations/      # SQL migration files
└── README.md        # Database setup instructions
```

## Database Schema

See `supabase/README.md` for full schema documentation.

**Core tables**:

- `events` - Secret Santa events
- `participants` - Event participants with unique tokens
- `draws` - Who drew whom (drawer_id → drawn_id)

## Mantine + TanStack Start SSR

This app uses specific workarounds for Mantine SSR with TanStack Start:

- CSS imported with `?url` query: `import mantineCss from '@mantine/core/styles.css?url'`
- `mantineHtmlProps` spread on `<html>` element
- `ColorSchemeScript` in `<head>`
- `MantineProvider` with `withGlobalClasses={false}`
- SSR externalization in `vite.config.ts`

See `src/routes/__root.tsx` for implementation details.

## Development Notes

- **Admin authentication**: Supabase Auth with email/password (required for creating events)
- **Participant access**: Token-based (no accounts needed for participants)
- **Mobile-first**: Designed for family use on phones with responsive layouts
- **Row Level Security**: Database-level access control ensures admins only see their own data

For detailed setup instructions, see `supabase/README.md`.

## Deployment Considerations

- Requires Supabase project with Auth enabled
- Email confirmation can be disabled for development
- RLS policies automatically protect user data
- Build outputs to `.output/` for Node.js deployment (Vercel, Railway, etc.)

## TODO

- [x] fix: title and favicon
- [x] refactor: At least 3 participants
- [x] feat: Admin Accounts
  - [x] Events Overview Dashboard
  - [x] Participant Links Management
  - [x] Draw Stats
  - [x] Date-based draw results visibility
  - [x] Event date tracking
  - [x] Link regeneration with modal
  - [x] RLS Security
- [ ] feat: Add zod for validation
- [ ] style: Better styling
- [ ] style: Better font
- [ ] feat: Internationalization
