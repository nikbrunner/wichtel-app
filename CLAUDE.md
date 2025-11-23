# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A family-friendly Secret Santa/Wichtel web app for organizing gift exchanges without user accounts. Uses token-based authentication where each participant gets a unique link to draw their Secret Santa.

**Key Workflow**: Admin creates event → participants receive unique links → each draws a name (can't draw themselves or already-drawn names) → admin can regenerate individual links if needed.

## Development Commands

### Daily Development

```bash
npm run dev           # Start dev server on port 3000
npm run build         # Production build (includes type checking)
npm run preview       # Preview production build
```

### Database Operations

```bash
npm run db:link       # One-time: Link to Supabase project (requires .env)
npm run db:push       # Apply migrations to remote database
npm run db:pull       # Pull schema from remote to local
npm run db:diff       # Show schema differences
npm run db:reset      # Reset local database to current migrations
```

### Code Quality

```bash
npm run format        # Format with Prettier
npm run lint          # Lint and auto-fix with ESLint
npm run check:types   # Type check without emitting
npm run check         # Run all checks (types, lint, format)
```

## Tech Stack Architecture

### Framework: TanStack Start

- **File-based routing**: Routes live in `src/routes/`, filenames determine URLs
- **Server functions**: Use `createServerFn()` from `@tanstack/react-start` for server-side logic
- **SSR**: Fully server-rendered React application with hydration
- **Generated route tree**: `src/routeTree.gen.ts` is auto-generated, never edit manually

### UI: Mantine v8 with SSR Workarounds

**Critical**: Mantine requires specific SSR configuration for TanStack Start:

1. **CSS Import**: Use `?url` query string

   ```ts
   import mantineCss from "@mantine/core/styles.css?url";
   ```

2. **HTML Setup** (in `__root.tsx`):
   - Spread `mantineHtmlProps` on `<html>` element
   - Add `<ColorSchemeScript />` in `<head>`
   - Use `<MantineProvider withGlobalClasses={false}>`

3. **Vite Config**: SSR externalization required
   ```ts
   ssr: {
     noExternal: ["@mantine/core", "@mantine/hooks"];
   }
   ```

See `src/routes/__root.tsx` for reference implementation.

### Database: Supabase (PostgreSQL)

**Client Setup**: Single server-side client in `src/utils/supabase.ts`

- Uses `@supabase/ssr` for cookie-based session handling
- Environment variables via `import.meta.env` (bundled at build time)
- Never create Supabase clients elsewhere - always use `getSupabaseServerClient()`

**Schema**:

- `events` - Event metadata with admin token and slug
- `participants` - Event participants with unique tokens and draw status
- `draws` - Who drew whom (immutable once created)

**Authentication Model**: Token-based (no user accounts)

- Admin token for event management
- Participant tokens for drawing names
- All tokens are UUIDs generated via `crypto.randomUUID()`

## Project Structure

```
src/
├── routes/                    # File-based routing
│   ├── __root.tsx            # Root layout with Mantine setup
│   ├── index.tsx             # Home page (create event form)
│   ├── e.$eventSlug.tsx      # Participant view (draw names)
│   └── admin.$eventSlug.tsx  # Admin view (event management)
│
├── server/                    # Server functions (createServerFn)
│   ├── createEvent.ts        # Create new event with participants
│   ├── drawName.ts           # Draw a name for participant
│   ├── getEventDetails.ts    # Get event info for admin
│   ├── getParticipantInfo.ts # Get participant draw status
│   └── regenerateParticipantLink.ts  # Generate new token
│
├── utils/
│   ├── supabase.ts           # Supabase server client factory
│   ├── wichtel.ts            # Token/slug generation utilities
│   └── seo.ts                # SEO meta tag helpers
│
├── hooks/
│   └── useMutation.ts        # Simple mutation hook (React Query-like API)
│
├── components/               # Error boundaries and not found pages
└── types/
    └── database.ts           # TypeScript types for DB schema
```

## Key Patterns

### Server Functions

All backend logic uses TanStack Start's `createServerFn()`:

```ts
export const myServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: MyInput) => data)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    // ... implementation
  });
```

### Route Loaders

Routes fetch data in `loader` or `beforeLoad`:

```ts
export const Route = createFileRoute("/path")({
  loader: async ({ params }) => {
    const data = await myServerFn({ params });
    return { data };
  }
});
```

### Mutations

Custom `useMutation` hook (in `src/hooks/useMutation.ts`) provides simple async state management:

```ts
const mutation = useMutation({
  fn: vars => serverFn({ data: vars }),
  onSuccess: ({ data }) => {
    /* ... */
  }
});
```

### Token-Based Security

- Tokens are UUIDs stored in database, passed via query params
- Admin tokens control event management
- Participant tokens control name drawing
- No RLS configured (token-based access control sufficient for this use case)

## Environment Variables

Required in `.env` (see `.env.example`):

```bash
VITE_SUPABASE_URL=           # Project URL from Supabase dashboard
VITE_SUPABASE_ANON_KEY=      # Anon/public key from Supabase dashboard
SUPABASE_PROJECT_REF=        # Project reference (from project URL)
DB_PASSWORD=                 # Database password for migrations
```

**Important**: All variables use `VITE_` prefix to work with Vercel deployment (bundled at build time via `import.meta.env`).

## Database Migrations

**Creating Migrations**:

1. Create `supabase/migrations/YYYYMMDD_description.sql`
2. Write SQL changes
3. Run `npm run db:push` to apply

**Migration Naming**: Use format `YYYYMMDD_description.sql` (e.g., `20250123_create_wichtel_tables.sql`)

## Deployment

This app deploys as a Node.js server (Nitro-based) that serves both SSR pages and API endpoints. Suitable for Vercel, Railway, or any Node.js hosting platform.

**Build Output**:

- `dist/client/` - Static assets
- `dist/server/` - Node.js server

## Available MCP Tools

This project has MCP (Model Context Protocol) servers configured for enhanced development workflows:

### Supabase MCP

Tools for interacting with the Supabase database:

- `mcp__supabase__list_tables` - List all tables in the database
- `mcp__supabase__list_migrations` - View migration history
- Additional query and schema inspection tools

**When to use**:

- Inspecting database schema and table structures
- Verifying migrations have been applied
- Debugging data-related issues
- Prefer MCP tools over running raw SQL via bash when possible

### Chrome DevTools MCP

Tools for browser automation and testing:

- `mcp__chrome-devtools__list_pages` - List open browser tabs
- `mcp__chrome-devtools__take_snapshot` - Capture page accessibility tree
- `mcp__chrome-devtools__take_screenshot` - Take visual screenshots
- `mcp__chrome-devtools__navigate_page` - Navigate to URLs
- `mcp__chrome-devtools__click`, `fill_form`, `press_key` - Interact with page elements
- `mcp__chrome-devtools__list_console_messages` - View console logs
- `mcp__chrome-devtools__list_network_requests` - Inspect network traffic
- Performance tracing and analysis tools

**When to use**:

- Manual testing of the web interface
- Debugging UI issues and layout problems
- Verifying user flows (create event → draw name)
- Inspecting console errors or network requests
- Performance profiling

**Workflow example**:

1. Start dev server (`npm run dev`)
2. Navigate to app in browser
3. Use snapshot/screenshot tools to inspect current state
4. Use interaction tools to test flows (fill forms, click buttons)
5. Check console/network for errors

## Testing Strategy

Currently no automated tests. App relies on:

- TypeScript for type safety
- Manual testing of core flows using Chrome DevTools MCP
- Simple domain logic (minimal business rules)
