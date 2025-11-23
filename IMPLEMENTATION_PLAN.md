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
- [x] Update supabase.ts to use VITE_ prefixed env vars
- [x] Update __root.tsx to re-enable user fetch

---

## Phase 3: Core Server Functions

- [ ] Create `src/utils/wichtel.ts` for shared utilities
  - [ ] `generateToken()` function
  - [ ] `generateSlug(name: string)` function
- [ ] Create server functions in `src/server/` directory
  - [ ] `createEvent.ts` - Creates event + participants with tokens
  - [ ] `drawName.ts` - Drawing algorithm with validation
  - [ ] `getEventDetails.ts` - Admin overview data
  - [ ] `getParticipantInfo.ts` - Participant view data
  - [ ] `regenerateParticipantLink.ts` - Reset individual participant

---

## Phase 4: Route Implementation

### Landing/Create Event Route (`/`)
- [ ] Create `src/routes/index.tsx`
- [ ] Build form UI with Mantine components
  - [ ] TextInput for event name
  - [ ] Dynamic participant name inputs
  - [ ] Button to create event
- [ ] Implement form submission logic
- [ ] Show success state with participant links
- [ ] Add copy-to-clipboard functionality

### Admin Overview Route (`/admin/$eventSlug`)
- [ ] Create `src/routes/admin.$eventSlug.tsx`
- [ ] Implement admin token validation
- [ ] Build participant table UI
  - [ ] Show participant names
  - [ ] Show drawn status (✓/✗)
  - [ ] Add regenerate link buttons
- [ ] Display stats: "X of Y have drawn"
- [ ] Implement regenerate link functionality

### Participant Draw Route (`/e/$eventSlug`)
- [ ] Create `src/routes/e.$eventSlug.tsx`
- [ ] Implement participant token validation
- [ ] Build pre-draw UI
  - [ ] Greeting with participant name
  - [ ] Large "Namen ziehen" button
- [ ] Build post-draw UI
  - [ ] Show drawn name with emoji
  - [ ] Disable button after draw
- [ ] Handle revisiting link (show existing draw)

---

## Phase 5: UI Polish & Error Handling

- [ ] Add error states with Mantine Alert components
  - [ ] Invalid token error
  - [ ] No one left to draw error
  - [ ] Network error handling
- [ ] Add loading states for async operations
- [ ] Ensure mobile-responsive design
- [ ] Add emoji decorations (🎁 🎄 👋)
- [ ] Test all user flows

---

## Phase 6: Testing & Deployment

- [ ] Test complete flow locally
  - [ ] Create event
  - [ ] Multiple participants draw names
  - [ ] Verify admin overview updates
  - [ ] Test regenerate link
- [ ] Test edge cases
  - [ ] Invalid tokens
  - [ ] Lost links
  - [ ] All names drawn
- [ ] Deploy to Vercel
  - [ ] Connect GitHub repo to Vercel
  - [ ] Set environment variables in Vercel
  - [ ] Test production deployment
- [ ] Create Supabase project for production (if separate from dev)

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
