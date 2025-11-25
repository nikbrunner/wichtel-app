# Admin Accounts Feature - Implementation Plan

## Overview

This document outlines the implementation plan for adding admin accounts to the Wichtel (Secret Santa) app. This feature will allow admins to create accounts, manage multiple events from a dashboard, and track participant draws with date-based visibility controls.

## Architecture Decisions

### Authentication

- **Method**: Supabase Auth with email/password
- **Session Management**: Server-side sessions via `@supabase/ssr`
- **Backward Compatibility**: Keep existing token-based admin access as fallback

### Dashboard Design

- **Layout**: List view with expandable details
- **Event Display**: Accordion-style rows showing event summary, expanding to full details
- **Mobile-First**: Responsive design optimized for family use on phones

### Draw Visibility Rules

- **Admin View**: Participant draw status (who/when) always visible
- **Draw Results**: What each person drew only visible after `event_date` passes
- **Rationale**: Maintains Secret Santa spirit while giving admins oversight

### Migration Strategy

- **Fresh Start**: Database will be emptied before implementation
- **No Legacy Migration**: All events created post-implementation require admin accounts

## Database Schema Changes

### Migration: `20250124_add_admin_accounts.sql`

````sql
-- Add event_date column to track when Secret Santa reveal should happen
ALTER TABLE events
ADD COLUMN event_date DATE NOT NULL;

-- Add admin_user_id to link events to authenticated users
ALTER TABLE events
ADD COLUMN admin_user_id UUID REFERENCES auth.users(id);

-- Make admin_token nullable (backward compatibility)
ALTER TABLE events
ALTER COLUMN admin_token DROP NOT NULL;

-- Add index for faster queries
CREATE INDEX idx_events_admin_user_id ON events(admin_user_id);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Events
CREATE POLICY "Users can view own events" ON events
  FOR SELECT USING (auth.uid() = admin_user_id);

CREATE POLICY "Users can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = admin_user_id);

CREATE POLICY "Users can update own events" ON events
  FOR UPDATE USING (auth.uid() = admin_user_id);

-- RLS Policies: Participants
CREATE POLICY "Users can view own participants" ON participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = participants.event_id
      AND events.admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create participants" ON participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = participants.event_id
      AND events.admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own participants" ON participants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = participants.event_id
      AND events.admin_user_id = auth.uid()
    )
  );

-- RLS Policies: Draws
CREATE POLICY "Users can view own draws" ON draws
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = draws.event_id
      AND events.admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create draws" ON draws
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = draws.event_id
      AND events.admin_user_id = auth.uid()
    )
  );
```text

### Updated TypeScript Types

Update `src/types/database.ts`:

```typescript
export interface Event {
  id: string;
  name: string;
  slug: string;
  admin_token: string | null;
  admin_user_id: string | null;
  event_date: string; // ISO date string
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export interface EventWithStats extends Event {
  participant_count: number;
  drawn_count: number;
  not_drawn_count: number;
  days_until_event: number | null;
  is_past: boolean;
}
```text

## Implementation Phases

### Phase 1: Database Schema & Auth Setup

#### 1.1 Create Migration

- **File**: `supabase/migrations/20250124_add_admin_accounts.sql`
- **Tasks**:
  - Add `event_date` column (DATE, NOT NULL)
  - Add `admin_user_id` column (UUID, references auth.users)
  - Make `admin_token` nullable
  - Add index on `admin_user_id`
  - Enable RLS on all tables
  - Create RLS policies for events, participants, draws

#### 1.2 Configure Supabase Auth

- **Dashboard Tasks**:
  - Enable email/password authentication in Supabase dashboard
  - Configure email templates (welcome, password reset)
  - Set site URL for redirects
- **Environment**:
  - Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`

#### 1.3 Update Supabase Client Utilities

- **File**: `src/utils/supabase.ts`
- **Tasks**:
  - Keep existing `getSupabaseServerClient()` function
  - Add `getSupabaseClientClient()` for client-side auth operations
  - Add helper functions:
    - `getCurrentUser()` - Get authenticated user from session
    - `requireAuth()` - Throw error if not authenticated (for server functions)

### Phase 2: Authentication Flow

#### 2.1 Create Auth Routes

**File**: `src/routes/auth/login.tsx`

```typescript
// Login form with email/password
// Uses Mantine TextInput and PasswordInput
// Calls signIn server function
// Redirects to dashboard on success
// Shows error messages on failure
```text

**File**: `src/routes/auth/signup.tsx`

```typescript
// Registration form with email/password/confirm password
// Uses Mantine form validation
// Calls signUp server function
// Shows success message and redirects to login
```text

**File**: `src/routes/auth/logout.tsx`

```typescript
// Simple redirect route that calls signOut
// Redirects to home page after logout
```text

#### 2.2 Create Auth Server Functions

**File**: `src/server/auth/signUp.ts`

```typescript
export const signUp = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password
    });
    if (error) throw new Error(error.message);
    return { success: true, user: authData.user };
  });
```text

**File**: `src/server/auth/signIn.ts`

```typescript
export const signIn = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });
    if (error) throw new Error(error.message);
    return { success: true, user: authData.user };
  });
```text

**File**: `src/server/auth/signOut.ts`

```typescript
export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  await supabase.auth.signOut();
  return { success: true };
});
```text

**File**: `src/server/auth/getCurrentUser.ts`

```typescript
export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();
  if (error || !user) return { user: null };
  return { user };
});
```text

#### 2.3 Update Root Layout

**File**: `src/routes/__root.tsx`

- **Tasks**:
  - Add auth state loading in loader
  - Pass user to all child routes via context
  - Add navigation header with:
    - Logo/title (links to home)
    - Dashboard link (when authenticated)
    - Create Event link (when authenticated)
    - Login/Signup links (when not authenticated)
    - User email + logout button (when authenticated)
  - Add protected route wrapper component

### Phase 3: Event Creation with Auth

#### 3.1 Update Home Page

**File**: `src/routes/index.tsx`

- **Tasks**:
  - Add auth check in `beforeLoad` (redirect to login if not authenticated)
  - Add event date field to form (Mantine DateInput)
  - Update form validation:
    - Event name required
    - Event date required and must be future date
    - Minimum 3 participants
    - Unique participant names
  - Update success screen to show:
    - Admin dashboard link (not just admin token URL)
    - All participant links with copy buttons
    - Message about accessing dashboard for future reference

#### 3.2 Update Create Event Server Function

**File**: `src/server/createEvent.ts`

- **Tasks**:
  - Add `requireAuth()` call to get user ID
  - Update input validator to include `eventDate: string`
  - Validate event date is in the future
  - Set `admin_user_id` when creating event record
  - Keep `admin_token` generation for backward compatibility
  - Save `event_date` to database
  - Return dashboard URL in addition to admin token URL

### Phase 4: Admin Dashboard

#### 4.1 Create Dashboard Route

**File**: `src/routes/dashboard/index.tsx`

```typescript
// Protected route - requires authentication
// Loader: fetch all events for current user via getAdminEvents
// Display:
//   - Header: "My Events" + "Create New Event" button
//   - Empty state if no events
//   - List of event cards/rows:
//     - Event name
//     - Event date with badge (upcoming/past)
//     - Participant count
//     - Draw progress (e.g., "5/10 drawn")
//     - Expand/collapse button
//   - Expanded view:
//     - Participant list table:
//       - Name | Link (with copy button) | Status | Drawn At
//     - "Copy All Links" button
//     - Draw results section (only if event date passed):
//       - Table: Drawer | Drew | Timestamp
//     - Regenerate link modal/form
```text

**Components to create**:

- `EventListItem` - Collapsible event row
- `ParticipantLinkTable` - Table of participants with copy buttons
- `DrawResultsTable` - Table of who drew whom (date-gated)
- `CopyAllLinksButton` - Formats all links as shareable message

#### 4.2 Create Dashboard Server Functions

**File**: `src/server/getAdminEvents.ts`

```typescript
export const getAdminEvents = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const user = await requireAuth(supabase);

  // Fetch events with participant counts
  const { data: events, error } = await supabase
    .from("events")
    .select(
      `
        *,
        participants (
          id,
          name,
          token,
          has_drawn,
          drawn_at
        )
      `
    )
    .eq("admin_user_id", user.id)
    .order("event_date", { ascending: true });

  if (error) throw new Error(error.message);

  // For each event, fetch draw results if event date passed
  const eventsWithDetails = await Promise.all(
    events.map(async event => {
      const isPast = new Date(event.event_date) < new Date();
      let drawResults = null;

      if (isPast) {
        const { data: draws } = await supabase
          .from("draws")
          .select(
            `
              *,
              drawer:participants!drawer_id (name),
              drawn:participants!drawn_id (name)
            `
          )
          .eq("event_id", event.id);
        drawResults = draws;
      }

      // Calculate stats
      const drawnCount = event.participants.filter(p => p.has_drawn).length;
      const totalCount = event.participants.length;

      return {
        ...event,
        drawResults,
        stats: {
          total: totalCount,
          drawn: drawnCount,
          notDrawn: totalCount - drawnCount,
          isPast
        },
        participantLinks: event.participants.map(p => ({
          name: p.name,
          url: `${process.env.VITE_APP_URL}/e/${event.slug}?token=${p.token}`,
          hasDrawn: p.has_drawn,
          drawnAt: p.drawn_at
        }))
      };
    })
  );

  return { events: eventsWithDetails };
});
```text

**File**: `src/server/getEventStats.ts`

```typescript
export const getEventStats = createServerFn({ method: "POST" })
  .inputValidator((data: { eventId: string }) => data)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const user = await requireAuth(supabase);

    // Verify user owns this event
    const { data: event } = await supabase
      .from("events")
      .select("*, participants(*)")
      .eq("id", data.eventId)
      .eq("admin_user_id", user.id)
      .single();

    if (!event) throw new Error("Event not found");

    const now = new Date();
    const eventDate = new Date(event.event_date);
    const daysUntil = Math.ceil(
      (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      totalParticipants: event.participants.length,
      drawnCount: event.participants.filter(p => p.has_drawn).length,
      notDrawnCount: event.participants.filter(p => !p.has_drawn).length,
      daysUntilEvent: daysUntil,
      isPast: daysUntil < 0
    };
  });
```text

### Phase 5: Update Existing Admin Page

#### 5.1 Update Admin Event Route

**File**: `src/routes/admin.$eventSlug.tsx`

- **Tasks**:
  - Update loader to check auth first, then fall back to admin token
  - Add "Back to Dashboard" link at top (when authenticated)
  - Show event date prominently with badge
  - Show draw results section only if event date passed
  - Add message explaining why results are hidden if date hasn't passed
  - Keep existing regenerate link functionality

#### 5.2 Update Get Event Details Server Function

**File**: `src/server/getEventDetails.ts`

- **Tasks**:
  - Accept both authenticated user and admin token
  - Validate access via either method
  - Add event date to response
  - Include draw results only if `event_date < CURRENT_DATE`
  - Add `canViewDrawResults` boolean flag to response

### Phase 6: Link Management & Regeneration

#### 6.1 Update Regenerate Participant Link

**File**: `src/server/regenerateParticipantLink.ts`

- **Tasks**:
  - Update auth check to verify user owns event (via `admin_user_id`)
  - Keep fallback to admin token validation
  - Keep existing token regeneration logic
  - Return new link immediately (construct full URL)
  - Add timestamp to track when link was regenerated

#### 6.2 Add Bulk Operations (Optional Enhancement)

**File**: `src/server/regenerateAllLinks.ts`

```typescript
// Regenerate tokens for all participants in an event
// Useful for security if links were shared inappropriately
```text

**File**: `src/server/exportEventLinks.ts`

```typescript
// Format all participant links as shareable text
// Example:
// "Secret Santa Links for [Event Name]:
//  - Alice: https://...
//  - Bob: https://...
//  - Charlie: https://..."
```text

### Phase 7: UI/UX Polish

#### 7.1 Navigation Updates

**File**: `src/routes/__root.tsx`

- **Tasks**:
  - Add responsive navigation header (Mantine AppShell or custom)
  - Desktop: Horizontal nav with links
  - Mobile: Hamburger menu
  - Show/hide items based on auth state
  - Add user menu dropdown with email and logout

#### 7.2 Event Date UI Components

**File**: `src/components/EventDateBadge.tsx`

```typescript
// Badge component showing event status
// "in 5 days" (blue) for upcoming
// "today" (orange) for today
// "ended 2 days ago" (gray) for past
```text

**File**: `src/components/DrawResultsSection.tsx`

```typescript
// Section showing draw results with date-based visibility
// Shows lock icon + explanation if date hasn't passed
// Shows table of results if date has passed
```text

#### 7.3 Mobile Responsiveness

- **Tasks**:
  - Use Mantine Stack/Group for responsive layouts
  - Accordion/Collapse for event details on mobile
  - Full-width buttons for copy/regenerate actions
  - Large tap targets (min 44px)
  - Stack participant links vertically on mobile
  - Hide less important info in collapsed state on mobile

#### 7.4 Loading States & Feedback

**Components**:

- `EventListSkeleton` - Loading state for dashboard
- `CopySuccessNotification` - Toast when link copied
- `RegenerateLinkModal` - Confirmation modal with loading state
- Error boundaries for auth failures

**File**: `src/hooks/useClipboard.ts`

```typescript
// Hook for copying to clipboard with feedback
// Shows toast notification on success/failure
```text

### Phase 8: Security & Testing

#### 8.1 Security Checklist

- [ ] RLS policies applied to all tables
- [ ] Server functions verify authentication
- [ ] Server functions verify event ownership
- [ ] Admin token fallback doesn't bypass RLS
- [ ] No sensitive data in client-side state
- [ ] Password requirements enforced (Supabase config)
- [ ] Email verification enabled (optional)
- [ ] Rate limiting on auth endpoints (Supabase config)

#### 8.2 Testing Workflow

**Testing Tools**:

- **Chrome DevTools MCP**: For browser automation and UI testing
- **Supabase MCP**: For database inspection and verification

**Manual Testing Checklist**:

1. **Authentication** (use Chrome DevTools MCP):
   - [ ] Start dev server: `npm run dev`
   - [ ] Navigate to signup page using `mcp__chrome-devtools__navigate_page`
   - [ ] Take snapshot of signup form using `mcp__chrome-devtools__take_snapshot`
   - [ ] Fill form and sign up using `mcp__chrome-devtools__fill_form`
   - [ ] Verify success message via snapshot
   - [ ] Navigate to login page
   - [ ] Take snapshot and fill login form
   - [ ] Verify redirect to dashboard after login
   - [ ] Check console for auth-related errors using `mcp__chrome-devtools__list_console_messages`
   - [ ] Test logout functionality
   - [ ] Test error handling: try invalid credentials
   - [ ] Test error handling: try signing up with existing email

2. **Event Creation** (use Chrome DevTools MCP):
   - [ ] Navigate to home/create page while authenticated
   - [ ] Take snapshot to verify auth state and form visibility
   - [ ] Fill form: event name, date (future), 3+ participants
   - [ ] Verify date picker validation (past dates rejected)
   - [ ] Submit form using `mcp__chrome-devtools__click`
   - [ ] Take snapshot of success screen
   - [ ] Verify participant links are displayed
   - [ ] Test copy button functionality
   - [ ] Check network requests using `mcp__chrome-devtools__list_network_requests`
   - [ ] Verify createEvent API call succeeded
   - [ ] Test redirect to login when not authenticated (use new incognito page)

3. **Dashboard** (use Chrome DevTools MCP + Supabase MCP):
   - [ ] Navigate to dashboard route
   - [ ] Take snapshot of dashboard layout
   - [ ] Verify events list appears (use `mcp__supabase__list_tables` to check events table)
   - [ ] Check event ordering (upcoming first)
   - [ ] Test expand/collapse using `mcp__chrome-devtools__click`
   - [ ] Take screenshot of expanded event using `mcp__chrome-devtools__take_screenshot`
   - [ ] Verify participant links, stats display correctly
   - [ ] Test "Copy all links" button
   - [ ] Check clipboard content via JavaScript evaluation
   - [ ] Verify no console errors
   - [ ] Test with 0 events (empty state)

4. **Draw Results Visibility** (use Supabase MCP + Chrome DevTools MCP):
   - [ ] Navigate to dashboard with future event
   - [ ] Take snapshot showing hidden results
   - [ ] Verify lock icon and explanation text visible
   - [ ] Use Supabase MCP to manually update event date to past:
     ```sql
     UPDATE events SET event_date = '2025-01-01' WHERE slug = 'test-event';
     ```
   - [ ] Refresh page using `mcp__chrome-devtools__navigate_page` with reload
   - [ ] Take new snapshot
   - [ ] Verify draw results now visible
   - [ ] Verify draw data appears correctly in UI
   - [ ] Check draws table using `mcp__supabase__list_tables`

5. **Link Regeneration** (use Chrome DevTools MCP + Supabase MCP):
   - [ ] Navigate to dashboard
   - [ ] Click regenerate link button for a participant
   - [ ] Take snapshot of regeneration modal/confirmation
   - [ ] Confirm regeneration
   - [ ] Verify new link displayed immediately
   - [ ] Copy new link
   - [ ] Use Supabase MCP to check participant token changed:
     ```sql
     SELECT token, has_drawn FROM participants WHERE name = 'ParticipantName';
     ```
   - [ ] Verify `has_drawn` reset to false
   - [ ] Test old link no longer works (navigate to old URL)
   - [ ] Test new link works (navigate to new URL)
   - [ ] Verify draw was deleted (check draws table via Supabase MCP)

6. **Participant Flow** (use Chrome DevTools MCP - should be unchanged):
   - [ ] Copy participant link from dashboard
   - [ ] Navigate to participant link in new page
   - [ ] Take snapshot of participant view
   - [ ] Verify participant can see available names
   - [ ] Click to draw a name using `mcp__chrome-devtools__click`
   - [ ] Verify drawn name displayed
   - [ ] Verify cannot draw self (check UI constraints)
   - [ ] Verify cannot draw already-drawn names
   - [ ] Try to access link again
   - [ ] Verify cannot draw multiple times
   - [ ] Check console for JavaScript errors

7. **Mobile Responsiveness** (use Chrome DevTools MCP):
   - [ ] Resize page to mobile dimensions using `mcp__chrome-devtools__resize_page` (375x667)
   - [ ] Take screenshot of mobile layout
   - [ ] Navigate through all pages (login, signup, dashboard, event creation)
   - [ ] Take screenshots of each page at mobile size
   - [ ] Test navigation menu (hamburger if implemented)
   - [ ] Test expand/collapse on touch (dashboard)
   - [ ] Verify buttons are tappable (min 44px)
   - [ ] Test form inputs on mobile
   - [ ] Verify no horizontal scrolling
   - [ ] Test at tablet size (768x1024)

8. **Security** (use Supabase MCP + Chrome DevTools MCP):
   - [ ] Sign up as User A
   - [ ] Create event as User A
   - [ ] Note event ID using `mcp__supabase__list_tables`
   - [ ] Sign out
   - [ ] Sign up as User B (new incognito/page)
   - [ ] Try to access User A's event via direct URL
   - [ ] Verify access denied (404 or redirect)
   - [ ] Try to regenerate User A's participant link as User B
   - [ ] Verify action fails
   - [ ] Use Supabase MCP to verify RLS:
     ```sql
     -- As User B, try to query User A's events (should return empty)
     SELECT * FROM events WHERE admin_user_id = '<user-a-id>';
     ```
   - [ ] Test admin token fallback still works (old URLs)
   - [ ] Verify logout clears session cookies
   - [ ] Verify logged out user cannot access protected routes

#### 8.3 Database Testing (use Supabase MCP)

**MCP Commands for Database Inspection**:

1. **List all tables and verify schema**:
   - Use `mcp__supabase__list_tables` to see all tables
   - Use `mcp__supabase__list_migrations` to verify migration applied

2. **Inspect events table**:

   ```sql
   -- Check events have correct columns
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'events';
````

3. **Create test data** (via Supabase SQL editor or MCP):

   ```sql
   -- First create test users via Supabase Auth UI or signUp endpoint
   -- Then insert test events

   INSERT INTO events (name, slug, admin_token, admin_user_id, event_date)
   VALUES
     ('Future Event', 'future-test', 'test-token-1', '<user-id>', '2025-12-25'),
     ('Past Event', 'past-test', 'test-token-2', '<user-id>', '2025-01-01');

   -- Insert test participants
   INSERT INTO participants (event_id, name, token, has_drawn)
   VALUES
     ('<future-event-id>', 'Alice', 'alice-token-1', false),
     ('<future-event-id>', 'Bob', 'bob-token-1', false),
     ('<future-event-id>', 'Charlie', 'charlie-token-1', false),
     ('<past-event-id>', 'Dave', 'dave-token-1', true),
     ('<past-event-id>', 'Eve', 'eve-token-1', true),
     ('<past-event-id>', 'Frank', 'frank-token-1', true);

   -- Insert test draws for past event
   INSERT INTO draws (event_id, drawer_id, drawn_id)
   VALUES
     ('<past-event-id>', '<dave-id>', '<eve-id>'),
     ('<past-event-id>', '<eve-id>', '<frank-id>'),
     ('<past-event-id>', '<frank-id>', '<dave-id>');
   ```

4. **Verify RLS policies work**:

   ```sql
   -- As authenticated User A, should see their events
   SELECT * FROM events WHERE admin_user_id = auth.uid();

   -- As authenticated User A, should NOT see User B's events
   SELECT * FROM events WHERE admin_user_id = '<user-b-id>'; -- should return empty

   -- Test participants RLS
   SELECT * FROM participants WHERE event_id IN (
     SELECT id FROM events WHERE admin_user_id = auth.uid()
   );

   -- Test draws RLS
   SELECT * FROM draws WHERE event_id IN (
     SELECT id FROM events WHERE admin_user_id = auth.uid()
   );
   ```

5. **Test event date logic**:

   ```sql
   -- Query to test date filtering (mimics what getAdminEvents does)
   SELECT
     e.*,
     e.event_date < CURRENT_DATE as is_past,
     COUNT(p.id) as participant_count,
     SUM(CASE WHEN p.has_drawn THEN 1 ELSE 0 END) as drawn_count
   FROM events e
   LEFT JOIN participants p ON p.event_id = e.id
   WHERE e.admin_user_id = '<user-id>'
   GROUP BY e.id;
   ```

6. **Clean up test data**:

   ```sql
   -- Delete test draws
   DELETE FROM draws WHERE event_id IN (
     SELECT id FROM events WHERE slug LIKE 'test-%' OR slug LIKE '%-test'
   );

   -- Delete test participants
   DELETE FROM participants WHERE event_id IN (
     SELECT id FROM events WHERE slug LIKE 'test-%' OR slug LIKE '%-test'
   );

   -- Delete test events
   DELETE FROM events WHERE slug LIKE 'test-%' OR slug LIKE '%-test';
   ```

## Commit Strategy & Testing

This section outlines the commit strategy with mandatory testing checkpoints before each commit. **IMPORTANT**: Run all tests before committing, and ensure the app builds and runs without errors.

### Commit 1: Database Migration & Schema Updates ✅

**Changes**:

- Create migration `supabase/migrations/20250124_add_admin_accounts.sql`
- Update `src/types/database.ts` with new types

**Testing Before Commit**:

1. Run `npm run db:push` to apply migration
2. Use `mcp__supabase__list_migrations` to verify migration applied
3. Use `mcp__supabase__list_tables` to verify schema changes:
   - `events` table has `event_date` column (date, not null)
   - `events` table has `admin_user_id` column (uuid, nullable)
   - `admin_token` is now nullable
4. Verify RLS is enabled on all tables
5. Run `npm run check:types` to verify TypeScript types compile
6. Run `npm run build` to ensure no build errors

**Commit Message**:

````text
feat(db): add admin accounts schema with RLS policies

- Add event_date column to events table
- Add admin_user_id column linking events to auth.users
- Make admin_token nullable for backward compatibility
- Enable Row Level Security on events, participants, draws
- Add RLS policies for user-scoped data access
- Update TypeScript types for new schema
```text

### Commit 2: Supabase Auth Utilities ✅

**Changes**:

- Update `src/utils/supabase.ts` with auth helpers
- Add `getCurrentUser()` and `requireAuth()` functions

**Testing Before Commit**:

1. Run `npm run check:types` - no TypeScript errors
2. Verify helper functions are properly exported
3. Run `npm run build` to ensure no build errors
4. Verify no breaking changes to existing Supabase client usage

**Commit Message**:

```text
feat(auth): add Supabase auth utility functions

- Add getSupabaseClientClient for client-side auth
- Add getCurrentUser helper to get authenticated user
- Add requireAuth helper for protected server functions
- Maintain backward compatibility with existing server client
```text

### Commit 3: Auth Server Functions ✅

**Changes**:

- Create `src/server/auth/signUp.ts`
- Create `src/server/auth/signIn.ts`
- Create `src/server/auth/signOut.ts`
- Create `src/server/auth/getCurrentUser.ts`

**Testing Before Commit**:

1. Run `npm run check:types` - no TypeScript errors
2. Run `npm run build` - verify server functions compile
3. Start dev server: `npm run dev`
4. Test with Chrome DevTools MCP:
   - Navigate to signup endpoint (will fail, route not created yet - OK)
   - Verify server function is accessible (check Network panel for 404, not 500)
5. Check console for any import/syntax errors

**Commit Message**:

```text
feat(auth): implement authentication server functions

- Add signUp server function for user registration
- Add signIn server function for email/password login
- Add signOut server function for logout
- Add getCurrentUser server function for session check
- Use Supabase Auth with SSR cookie handling
```text

### Commit 4: Auth Routes (Login/Signup/Logout) ✅

**Changes**:

- Create `src/routes/auth/login.tsx`
- Create `src/routes/auth/signup.tsx`
- Create `src/routes/auth/logout.tsx`

**Testing Before Commit**:

1. Run `npm run check:types` - no TypeScript errors
2. Run `npm run build` - routes compile correctly
3. Start dev server: `npm run dev`
4. Test with Chrome DevTools MCP:
   - Navigate to `/auth/login` using `mcp__chrome-devtools__navigate_page`
   - Take snapshot: `mcp__chrome-devtools__take_snapshot` - verify form renders
   - Navigate to `/auth/signup` - verify form renders
   - Check console: `mcp__chrome-devtools__list_console_messages` - no errors
5. **Full Auth Flow Test**:
   - Fill signup form: `mcp__chrome-devtools__fill_form` (email, password)
   - Submit form
   - Verify success/redirect behavior
   - Navigate to login
   - Sign in with same credentials
   - Verify successful login (check for auth cookies/session)
   - Test logout
6. **Error Handling Test**:
   - Try signup with existing email - verify error message
   - Try login with wrong password - verify error message

**Commit Message**:

```text
feat(auth): add login, signup, and logout routes

- Add login page with email/password form
- Add signup page with registration form and validation
- Add logout redirect route
- Use Mantine form components for consistent UI
- Implement error handling and user feedback
```text

### Commit 5: Update Root Layout with Auth Nav ✅

**Changes**:

- Update `src/routes/__root.tsx` with navigation and auth state

**Testing Before Commit**:

1. Run `npm run check:types` - no TypeScript errors
2. Run `npm run build` - verify builds successfully
3. Start dev server: `npm run dev`
4. Test with Chrome DevTools MCP:
   - Navigate to home: `mcp__chrome-devtools__navigate_page`
   - Take snapshot when logged out - verify login/signup links visible
   - Sign in
   - Take new snapshot - verify dashboard link, user email, logout visible
   - Test all nav links (click each one)
   - Test logout button
   - Verify nav works on mobile: `mcp__chrome-devtools__resize_page` (375, 667)
5. Check console for errors after each navigation

**Commit Message**:

```text
feat(ui): add authentication-aware navigation

- Add navigation header with conditional links based on auth state
- Show login/signup links when not authenticated
- Show dashboard, create event, logout when authenticated
- Display user email in navigation
- Mobile-responsive navigation layout
```text

### Commit 6: Update Event Creation with Auth & Date ✅

**Changes**:

- Update `src/routes/index.tsx` with auth requirement and date field
- Update `src/server/createEvent.ts` with admin_user_id and event_date
- Install dependencies: `npm install @mantine/dates dayjs`

**Testing Before Commit**:

1. Run `npm run check:types` - no TypeScript errors
2. Run `npm run build` - verify builds successfully
3. Start dev server: `npm run dev`
4. Test with Chrome DevTools MCP:
   - **Not authenticated test**:
     - Navigate to home while logged out
     - Verify redirects to login
   - **Authenticated test**:
     - Sign in first
     - Navigate to home
     - Take snapshot - verify date picker appears
     - Fill form with event name, future date, 3+ participants
     - Submit form
     - Verify success screen shows participant links
   - **Validation test**:
     - Try past date - verify error
     - Try < 3 participants - verify error
     - Try duplicate names - verify error
5. **Database verification** with Supabase MCP:
   - Check events table for new event
   - Verify `admin_user_id` is set correctly
   - Verify `event_date` is saved
   - Verify participants created with tokens

**Commit Message**:

```text
feat(events): require auth and add event date to creation flow

- Add authentication requirement for event creation
- Add event date field with Mantine DateInput
- Validate event date must be in future
- Link created events to authenticated admin user
- Install @mantine/dates and dayjs dependencies
- Update success screen with dashboard link
```text

### Commit 7: ✅ Dashboard Route & Components (Part 1 - Basic Layout)

**Design Notes** (from user feedback):

- Dashboard should be at `/` (home route) - more intuitive UX ✅
- Event creation moved to `/new-event` route
- Layout structure:
````

<running events section> | <new event button>

---

  <past events section>
  ```
- "New Event" button navigates to `/new-event` (will become modal later)
- Test data created: 4 events (1 past, 3 upcoming) with 13 participants

**Changes**:

- Create `src/routes/dashboard/index.tsx` (basic layout, no components yet)
- Create `src/server/getAdminEvents.ts`
- Create `src/hooks/useClipboard.ts`
- Update navigation to make dashboard the default view
- Create test events (past and future) for development

**Testing Before Commit**:

1. Run `npm run check:types` - no TypeScript errors
2. Run `npm run build` - verify builds successfully
3. Start dev server: `npm run dev`
4. Test with Chrome DevTools MCP:
   - Sign in
   - Navigate to `/dashboard`
   - Take snapshot - verify basic layout renders
   - Verify events list appears (even if unstyled)
   - Test with 0 events (empty state)
   - Test with 1+ events (should show event data)
5. **Database verification**:
   - Use Supabase MCP to verify getAdminEvents queries correctly
   - Verify only current user's events returned
   - Verify event_date filtering works
6. Check console for errors

**Commit Message**:

````text
feat(dashboard): add basic dashboard route and data fetching

- Add dashboard route with protected access
- Add getAdminEvents server function
- Fetch and display user's events
- Add useClipboard hook for link copying
- Basic layout without detailed components
```text

### Commit 8: ⬜ Dashboard Components (Part 2 - Event List UI)

**Changes**:

- Create `src/components/EventListItem.tsx`
- Create `src/components/EventDateBadge.tsx`
- Create `src/components/ParticipantLinkTable.tsx`
- Update `src/routes/dashboard/index.tsx` to use components

**Testing Before Commit**:

1. Run `npm run check:types` - no TypeScript errors
2. Run `npm run build` - verify builds successfully
3. Start dev server: `npm run dev`
4. Test with Chrome DevTools MCP:
   - Navigate to dashboard
   - Take screenshot: `mcp__chrome-devtools__take_screenshot`
   - Verify event cards render correctly
   - Test expand/collapse: `mcp__chrome-devtools__click` on expand button
   - Take screenshot of expanded event
   - Verify participant links displayed
   - Test copy button for individual link
   - Verify date badge shows correct status (future/past)
   - **Mobile test**: Resize to 375x667, verify responsive layout
5. Check console for errors

**Commit Message**:

```text
feat(dashboard): add event list components and UI

- Add EventListItem component with expand/collapse
- Add EventDateBadge showing countdown/status
- Add ParticipantLinkTable with copy buttons
- Implement collapsible event details
- Mobile-responsive card layout
```text

### Commit 9: ⬜ Dashboard Draw Results Section

**Changes**:

- Create `src/components/DrawResultsSection.tsx`
- Create `src/components/CopyAllLinksButton.tsx`
- Update dashboard to show draw results (date-gated)

**Testing Before Commit**:

1. Run `npm run check:types` - no TypeScript errors
2. Run `npm run build` - verify builds successfully
3. Start dev server: `npm run dev`
4. Test with Chrome DevTools MCP:
   - Create event with future date
   - Navigate to dashboard
   - Expand event
   - Verify draw results section shows lock icon + explanation
   - Take screenshot
   - **Update event date to past** using Supabase MCP:
     ```sql
     UPDATE events SET event_date = '2025-01-01' WHERE slug = 'test-event';
     ```
   - Refresh dashboard
   - Verify draw results now visible
   - Test "Copy all links" button
   - Verify clipboard contains formatted message
5. Check console for errors

**Commit Message**:

```text
feat(dashboard): add draw results with date-based visibility

- Add DrawResultsSection component
- Hide draw results until event date passes
- Show lock icon and explanation for future events
- Add CopyAllLinksButton for bulk link sharing
- Implement date-gated visibility logic
```text

### Commit 10: ⬜ Link Regeneration from Dashboard

**Changes**:

- Create `src/components/RegenerateLinkModal.tsx`
- Update `src/server/regenerateParticipantLink.ts` with auth check
- Integrate regeneration into dashboard

**Testing Before Commit**:

1. Run `npm run check:types` - no TypeScript errors
2. Run `npm run build` - verify builds successfully
3. Start dev server: `npm run dev`
4. Test with Chrome DevTools MCP + Supabase MCP:
   - Navigate to dashboard
   - Expand an event
   - Click "Regenerate link" for a participant
   - Verify modal appears
   - Confirm regeneration
   - Verify new link displayed
   - **Database check**:
     ```sql
     SELECT token, has_drawn FROM participants WHERE name = 'TestName';
     ```
   - Verify token changed and has_drawn reset to false
   - Test old link - verify no longer works
   - Test new link - verify works
5. Check console for errors

**Commit Message**:

```text
feat(dashboard): add participant link regeneration

- Add RegenerateLinkModal component
- Update regenerateParticipantLink with auth verification
- Reset participant draw status on regeneration
- Display new link immediately in dashboard
- Invalidate old token
```text

### Commit 11: ⬜ Update Admin Event Page

**Changes**:

- Update `src/routes/admin.$eventSlug.tsx` with auth check and date logic
- Update `src/server/getEventDetails.ts` with auth and date filtering

**Testing Before Commit**:

1. Run `npm run check:types` - no TypeScript errors
2. Run `npm run build` - verify builds successfully
3. Start dev server: `npm run dev`
4. Test with Chrome DevTools MCP:
   - Navigate to admin event page (authenticated)
   - Verify "Back to Dashboard" link appears
   - Verify event date displayed
   - Test with future event - verify results hidden
   - Test with past event - verify results visible
   - **Test backward compatibility**:
     - Sign out
     - Navigate to admin page with `?token=xxx` query param
     - Verify still works (token fallback)
5. Check console for errors

**Commit Message**:

```text
feat(admin): update admin event page with auth and date checks

- Add authentication as primary access method
- Keep admin token as fallback for backward compatibility
- Add "Back to Dashboard" link when authenticated
- Show event date prominently
- Implement date-based draw results visibility
- Update getEventDetails with auth support
```text

### Commit 12: ⬜ Loading States & Error Boundaries

**Changes**:

- Create `src/components/EventListSkeleton.tsx`
- Add loading states to dashboard
- Add error boundaries to routes

**Testing Before Commit**:

1. Run `npm run check:types` - no TypeScript errors
2. Run `npm run build` - verify builds successfully
3. Start dev server: `npm run dev`
4. Test with Chrome DevTools MCP:
   - Navigate to dashboard
   - Verify skeleton shows briefly during load
   - Take screenshot of skeleton state
   - Test slow network (use `mcp__chrome-devtools__emulate` with "Slow 3G")
   - Verify loading state persists appropriately
   - Test error case (modify server function to throw error)
   - Verify error boundary catches and displays error
5. Check console for errors

**Commit Message**:

```text
feat(ui): add loading states and error boundaries

- Add EventListSkeleton for loading state
- Add loading indicators to dashboard
- Add error boundaries to handle failures gracefully
- Improve UX during data fetching
```text

### Commit 13: ⬜ Mobile Responsiveness Polish

**Changes**:

- Refine mobile layouts across all pages
- Adjust tap target sizes
- Optimize mobile navigation

**Testing Before Commit**:

1. Run `npm run check:types` - no TypeScript errors
2. Run `npm run build` - verify builds successfully
3. Start dev server: `npm run dev`
4. Test with Chrome DevTools MCP at multiple sizes:
   - **Mobile** (375x667): `mcp__chrome-devtools__resize_page`
     - Test all pages
     - Take screenshots of each
     - Verify no horizontal scroll
     - Verify buttons are tappable
   - **Tablet** (768x1024):
     - Test all pages
     - Take screenshots
   - **Desktop** (1920x1080):
     - Test all pages
     - Verify layouts scale appropriately
5. Test touch interactions (expand/collapse, buttons)
6. Check console for errors at each size

**Commit Message**:

```text
style(responsive): improve mobile and tablet layouts

- Optimize layouts for mobile (375px) and tablet (768px)
- Increase tap target sizes to minimum 44px
- Improve navigation on small screens
- Fix horizontal scroll issues
- Enhance touch interactions
```text

### Commit 14: ⬜ Final Testing & Documentation

**Changes**:

- Update README.md with new features
- Run full test suite
- Fix any remaining issues

**Testing Before Commit**:

1. Run `npm run check:types` - no errors
2. Run `npm run check:lint` - no errors
3. Run `npm run format` - format all files
4. Run `npm run build` - production build succeeds
5. **Full Integration Test** using both MCPs:
   - Complete signup → login → create event → dashboard → draw → regenerate flow
   - Test all 8 test categories from section 8.2
   - Verify RLS with two different users
   - Test mobile responsiveness end-to-end
6. **Database cleanup**: Remove test data

**Commit Message**:

```text
docs: update README with admin accounts feature

- Document new authentication flow
- Add dashboard usage instructions
- Update feature list
- Document event date visibility rules
- Add deployment considerations
```text

## Testing Commands Summary

Run these before EVERY commit:

```bash
# Type checking
npm run check:types

# Linting
npm run check:lint

# Build verification
npm run build

# Start dev server (for MCP testing)
npm run dev
```text

## Dependencies to Install

```bash
npm install @mantine/dates dayjs
```text

- `@mantine/dates` - Date picker component for event creation
- `dayjs` - Date manipulation and formatting (lightweight alternative to moment.js)

## File Structure After Implementation

```text
src/
├── routes/
│   ├── __root.tsx                      # Updated with auth nav
│   ├── index.tsx                       # Updated with auth requirement
│   ├── auth/
│   │   ├── login.tsx                   # New
│   │   ├── signup.tsx                  # New
│   │   └── logout.tsx                  # New
│   ├── dashboard/
│   │   └── index.tsx                   # New
│   ├── e.$eventSlug.tsx                # Unchanged (participant view)
│   └── admin.$eventSlug.tsx            # Updated with auth + date checks
│
├── server/
│   ├── auth/
│   │   ├── signUp.ts                   # New
│   │   ├── signIn.ts                   # New
│   │   ├── signOut.ts                  # New
│   │   └── getCurrentUser.ts           # New
│   ├── createEvent.ts                  # Updated
│   ├── getAdminEvents.ts               # New
│   ├── getEventDetails.ts              # Updated
│   ├── getEventStats.ts                # New
│   ├── regenerateParticipantLink.ts    # Updated
│   ├── drawName.ts                     # Unchanged
│   └── getParticipantInfo.ts           # Unchanged
│
├── components/
│   ├── EventListItem.tsx               # New
│   ├── ParticipantLinkTable.tsx        # New
│   ├── DrawResultsSection.tsx          # New
│   ├── EventDateBadge.tsx              # New
│   ├── CopyAllLinksButton.tsx          # New
│   └── RegenerateLinkModal.tsx         # New
│
├── hooks/
│   ├── useMutation.ts                  # Unchanged
│   └── useClipboard.ts                 # New
│
├── utils/
│   ├── supabase.ts                     # Updated with auth helpers
│   ├── wichtel.ts                      # Unchanged
│   └── seo.ts                          # Unchanged
│
└── types/
    └── database.ts                     # Updated with new types
```text

## Backward Compatibility Notes

### Admin Token Fallback

The existing token-based admin access will continue to work:

- Admin URLs with `?token=xxx` will still be validated
- Server functions check auth first, then fall back to token
- This allows gradual migration if needed

### Participant Flow

The participant experience remains completely unchanged:

- Still uses unique tokens in URLs
- No authentication required for participants
- Draw logic unchanged
- Mobile-first UI preserved

### Future Removal (Optional)

Once all admins have migrated to accounts:

- Can remove `admin_token` column
- Can simplify server function auth checks
- Can remove token validation logic
- Schedule for v2.0 or later

## Success Criteria

This feature is complete when:

1. ✅ Admins can sign up and log in
2. ✅ Creating events requires authentication
3. ✅ Dashboard shows all events for authenticated admin
4. ✅ Dashboard shows participant links with copy functionality
5. ✅ Dashboard shows draw progress (who/when)
6. ✅ Draw results hidden until event date passes
7. ✅ Links can be regenerated from dashboard
8. ✅ Mobile-responsive UI works well
9. ✅ RLS policies protect user data
10. ✅ All tests pass

## Next Steps After Completion

Consider these enhancements for future versions:

- Email notifications when participants draw
- Bulk link regeneration
- Event templates for recurring Secret Santa
- Participant grouping (can't draw family members)
- Gift idea tracking
- Budget recommendations
- Event archive/deletion
- Admin account settings (password change, email change)
- Two-factor authentication
- Shared admin access (multiple admins per event)

---

**Document Version**: 1.0
**Created**: 2025-01-24
**Author**: Claude (with Nik)
**Status**: Ready for Implementation
````
