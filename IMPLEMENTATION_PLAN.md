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
- [ ] Delete unnecessary routes
  - [ ] Delete `src/routes/login.tsx`
  - [ ] Delete `src/routes/signup.tsx`
  - [ ] Delete `src/routes/logout.tsx`
  - [ ] Delete `src/routes/_authed.tsx`
  - [ ] Delete `src/routes/_authed/` directory
- [ ] Delete unused components
  - [ ] Delete `src/components/Auth.tsx`
  - [ ] Delete `src/components/Login.tsx`
- [ ] Keep useful utilities
  - [ ] Keep `src/utils/supabase.ts`
  - [ ] Keep `src/hooks/useMutation.ts`
  - [ ] Keep `src/components/DefaultCatchBoundary.tsx`
  - [ ] Keep `src/components/NotFound.tsx`
- [ ] Delete `src/utils/posts.ts` (demo code)
- [ ] Update `src/styles/app.css` to remove Tailwind, add basic resets

---

## Phase 2: Database Schema

- [ ] Create Supabase project (or use existing)
- [ ] Set up environment variables
  - [ ] Create `.env` file
  - [ ] Add `VITE_SUPABASE_URL`
  - [ ] Add `VITE_SUPABASE_ANON_KEY`
- [ ] Create database tables via Supabase SQL Editor
  - [ ] Create `events` table
  - [ ] Create `participants` table
  - [ ] Create `draws` table
- [ ] Test Supabase connection

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
