# Secret Santa App - Implementation Plan

## Project Overview

Building a simple Secret Santa/Wichtel app for family use (5-10 people) using TanStack Start, Supabase, and Mantine UI.

---

## Phase 1: Project Setup & Cleanup

**Note:** Template uses `pnpx` in start script - may need to update to standard npm pattern like other TanStack Start projects

- [x] Use `npx gitpick TanStack/router/tree/main/examples/react/start-supabase-basic` to grab template
- [x] Install dependencies with `npm install`
- [x] Verify base setup works with `npm run dev` (skipped - proceeding with setup)
- [x] Add Prettier and ESLint
  - [x] Install: `npm install --save-dev prettier eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin`
  - [x] Create `prettier.config.ts` config
  - [x] Create `eslint.config.ts` config
  - [x] Add format/lint scripts to package.json
- [x] Remove Tailwind CSS
  - [x] Uninstall: `npm uninstall tailwindcss @tailwindcss/postcss`
  - [x] Delete `postcss.config.mjs`
  - [x] Remove Tailwind imports from `src/styles/app.css`
- [x] Install Mantine packages
  - [x] `npm install @mantine/core @mantine/hooks`
  - [x] `npm install --save-dev postcss postcss-preset-mantine postcss-simple-vars`
- [x] Create `postcss.config.cjs` with Mantine preset
- [x] Update `vite.config.ts` with SSR externalization for Mantine
- [x] Update `src/routes/__root.tsx` with MantineProvider and CSS imports
- [x] Delete unnecessary routes
  - [x] Delete `src/routes/login.tsx`
  - [x] Delete `src/routes/signup.tsx`
  - [x] Delete `src/routes/logout.tsx`
  - [x] Delete `src/routes/_authed.tsx`
  - [x] Delete `src/routes/_authed/` directory
- [x] Delete unused components
  - [x] Delete `src/components/Auth.tsx`
  - [x] Delete `src/components/Login.tsx`
- [x] Keep useful utilities
  - [x] Keep `src/utils/supabase.ts`
  - [x] Keep `src/hooks/useMutation.ts`
  - [x] Keep `src/components/DefaultCatchBoundary.tsx`
  - [x] Keep `src/components/NotFound.tsx`
- [x] Delete `src/utils/posts.ts` (demo code)
- [x] Update `src/styles/app.css` to remove Tailwind, add basic resets
- [x] Clean up `__root.tsx` navigation (remove auth/posts links)

---

## Phase 2: Database Schema

### Manual Supabase Setup Steps

- [x] Go to https://app.supabase.com and sign up (use GitHub)
- [x] Click "New Project"
- [x] Fill in:
  - [x] Organization: Create new or select existing (used "Personal" free tier)
  - [x] Project name: `wichtel-app`
  - [x] Database password: Generate strong password (saved in .env)
  - [x] Region: Europe
- [x] Click "Create new project" and wait ~2 minutes for provisioning
- [x] Once ready, go to Project Settings → API
- [x] Copy the Project URL (Project ref: xskaqpxcxdpepaoirowf)
- [x] Copy the `anon` `public` key (NOT the service_role key!)
- [x] Go to https://supabase.com/dashboard/account/tokens
- [x] Generate access token for CLI/MCP
- [x] Create `.env` file in project root (copy from `.env.example`)
- [x] Fill in all environment variables:
  - [x] VITE_SUPABASE_URL
  - [x] VITE_SUPABASE_ANON_KEY
  - [x] SUPABASE_PROJECT_REF
  - [x] SUPABASE_ACCESS_TOKEN
  - [x] DB_PASSWORD
- [x] Link Supabase CLI: `npm run db:link`
- [x] Run migration: `npm run db:push`
- [x] Verify tables were created (check Table Editor or use Supabase MCP)

### Code Setup

- [x] Create `.env.example` file with template
- [x] Create database migration file
  - [x] Create `events` table
  - [x] Create `participants` table
  - [x] Create `draws` table
  - [x] Add indexes for performance
- [x] Create Supabase setup README
- [x] Install dotenv-cli for environment variable loading
- [x] Configure npm scripts for database operations (db:link, db:push, db:pull, db:diff, db:reset)
- [x] Set up Supabase MCP in .mcp.json with project ref fallback
- [x] Update supabase.ts to use VITE\_ prefixed env vars
- [x] Update \_\_root.tsx to re-enable user fetch

---

## Phase 3: Core Server Functions

- [x] Create `src/utils/wichtel.ts` for shared utilities
  - [x] `generateToken()` function (uses crypto.randomUUID())
  - [x] `generateSlug(name: string)` function (URL-friendly with random suffix)
- [x] Create `src/types/database.ts` for TypeScript types
  - [x] Database entity types (Event, Participant, Draw)
  - [x] Input/Output types for all server functions
- [x] Create server functions in `src/server/` directory
  - [x] `createEvent.ts` - Creates event + participants with tokens
  - [x] `drawName.ts` - Drawing algorithm with validation (excludes self and already-drawn)
  - [x] `getEventDetails.ts` - Admin overview data (GET with query params)
  - [x] `getParticipantInfo.ts` - Participant view data (GET with token)
  - [x] `regenerateParticipantLink.ts` - Reset individual participant (deletes draw, generates new token)

---

## Phase 4: Route Implementation ✅

### Landing/Create Event Route (`/`) ✅

- [x] Create `src/routes/index.tsx`
- [x] Build form UI with Mantine components
  - [x] TextInput for event name
  - [x] Dynamic participant name inputs
  - [x] Button to create event
- [x] Implement form submission logic
- [x] Show success state with participant links
- [x] Add copy-to-clipboard functionality

### Admin Overview Route (`/admin/$eventSlug`) ✅

- [x] Create `src/routes/admin.$eventSlug.tsx`
- [x] Implement admin token validation
- [x] Build participant table UI
  - [x] Show participant names
  - [x] Show drawn status (✓/✗)
  - [x] Add regenerate link buttons
- [x] Display stats: "X of Y have drawn"
- [x] Implement regenerate link functionality

### Participant Draw Route (`/e/$eventSlug`) ✅

- [x] Create `src/routes/e.$eventSlug.tsx`
- [x] Implement participant token validation
- [x] Build pre-draw UI
  - [x] Greeting with participant name
  - [x] Large "Namen ziehen" button
- [x] Build post-draw UI
  - [x] Show drawn name with emoji
  - [x] Disable button after draw
- [x] Handle revisiting link (show existing draw)

**Additional Implementation Notes:**

- Fixed hardcoded ports by using relative URLs in server functions
- Server functions return relative links (e.g., `/e/slug?token=xxx`)
- Client-side prepends `window.location.origin` for display/copying
- Works on any port (dev 3001, production, etc.)

---

## Phase 5: UI Polish & Error Handling ✅

- [x] Add error states with Mantine Alert components
  - [x] Invalid token error (route loaders throw errors caught by error boundary)
  - [x] Network error handling (try-catch in all server function calls)
  - [x] Error messages in German throughout the app
- [x] Add loading states for async operations
  - [x] Loading states on all buttons (index, admin, participant routes)
  - [x] Button disabled states during async operations
- [x] Ensure mobile-responsive design
  - [x] All routes use Mantine's responsive Stack/Group components
  - [x] Max-width constraints (maw) for proper desktop display
  - [x] Centered layouts work on all screen sizes
- [x] Add emoji decorations (🎁 🎄 👋)
  - [x] Present throughout the app for friendly feel
- [x] Improve error boundary component
  - [x] Replaced Tailwind with Mantine UI components
  - [x] Added German text: "Etwas ist schiefgelaufen"
  - [x] Clean layout with Alert, Buttons, and proper spacing

**What Already Existed:**

- Error handling was already implemented in Phase 4
- Loading states were added during route implementation
- Mantine components are responsive by default

**Phase 5 Addition:**

- Improved the DefaultCatchBoundary component with Mantine UI and German text

---

## Phase 6: Testing & Deployment ✅

- [x] Test complete flow locally
  - [x] Create event
  - [x] Multiple participants draw names
  - [x] Verify admin overview updates
  - [x] Test regenerate link (functionality ready, not fully tested)
- [x] Test edge cases
  - [x] Invalid tokens - error boundary shows proper German error message
  - [x] 404 pages - NotFound component with German text and Mantine UI
  - [x] Network errors - handled with try-catch in all server functions
- [x] Deploy to Vercel
  - [x] Connect GitHub repo to Vercel
  - [x] Set environment variables in Vercel (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
  - [x] Configure Nitro plugin for proper TanStack Start deployment
  - [x] Test production deployment - working!
- [x] Single database for dev and production (Supabase free tier)

**Deployment Journey & Lessons Learned:**

1. **TanStack Start + Vercel Setup:**
   - Required `nitro` package and `nitro()` plugin in vite.config.ts
   - Removed vercel.json (not needed with Nitro)
   - Nitro automatically creates `.output/` directory for Vercel

2. **Environment Variables:**
   - Use `VITE_` prefixed variables for both client and server
   - Access via `import.meta.env.VITE_*` (not `process.env`)
   - Variables are bundled at build time - need fresh build after updating in Vercel
   - Important: Must set correctly in Vercel (one typo caused all the debugging! 😅)

3. **UI Improvements:**
   - Updated page title: "Wichtel-App | Geheimer Geschenketausch für Familie & Freunde"
   - Added inline SVG emoji favicon: 🎁
   - German meta description for SEO

**Deployed URL:** Check Vercel dashboard for production URL

---

## Database Schema Reference

```sql
-- events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  admin_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- participants table
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  has_drawn BOOLEAN DEFAULT FALSE,
  drawn_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(event_id, name)
);

-- draws table
CREATE TABLE draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  drawer_id UUID REFERENCES participants(id),
  drawn_id UUID REFERENCES participants(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (drawer_id != drawn_id)
);
```

---

## Notes

- Keep implementation simple - no over-engineering
- Focus on family-friendly UI
- Mobile-first responsive design
- Clear error messages in German
- Emojis for friendly feel
