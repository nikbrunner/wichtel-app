# Wichtel App (Secret Santa)

A family-friendly Secret Santa/Wichtel web app for organizing gift exchanges.

## Tech Stack

- **Frontend**: TanStack Start (React Router SSR framework)
- **UI**: Mantine v8 (with SSR workarounds for TanStack Start)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Token-based (no user accounts needed)

## Key Features

- Admin creates events with participant names
- Each participant gets a unique link to draw their Secret Santa
- Can't draw yourself or already-drawn names
- Admin can regenerate individual participant links
- Mobile-first, family-friendly UI

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

```
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

- **No user accounts**: Uses token-based authentication (event admin tokens + participant tokens)
- **Mobile-first**: Designed for family use on phones
- **Simple deployment**: Static files + Supabase backend

For detailed setup instructions, see `supabase/README.md`.
