-- Proper RLS for hybrid auth: Supabase Auth for admins, tokens for participants
-- Strategy: Restrictive RLS for admin operations, service role key bypasses for participant operations

-- Drop all existing policies first
DROP POLICY IF EXISTS "Allow public read access to events" ON events;
DROP POLICY IF EXISTS "Allow public read access to participants" ON participants;
DROP POLICY IF EXISTS "Allow public read access to draws" ON draws;
DROP POLICY IF EXISTS "Allow public update to participants" ON participants;
DROP POLICY IF EXISTS "Allow public insert to draws" ON draws;
DROP POLICY IF EXISTS "Allow public update to draws" ON draws;
DROP POLICY IF EXISTS "Allow public delete events" ON events;
DROP POLICY IF EXISTS "Allow public delete participants" ON participants;
DROP POLICY IF EXISTS "Allow public delete draws" ON draws;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Users can create participants" ON participants;
DROP POLICY IF EXISTS "Users can create draws" ON draws;

-- EVENTS: Only admin can manage their own events
CREATE POLICY "Admin can view own events" ON events
  FOR SELECT USING (auth.uid() = admin_user_id);

CREATE POLICY "Admin can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = admin_user_id);

CREATE POLICY "Admin can update own events" ON events
  FOR UPDATE USING (auth.uid() = admin_user_id);

CREATE POLICY "Admin can delete own events" ON events
  FOR DELETE USING (auth.uid() = admin_user_id);

-- PARTICIPANTS: Only admin can manage participants in their events
CREATE POLICY "Admin can view own participants" ON participants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = participants.event_id AND events.admin_user_id = auth.uid())
  );

CREATE POLICY "Admin can create participants" ON participants
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM events WHERE events.id = participants.event_id AND events.admin_user_id = auth.uid())
  );

CREATE POLICY "Admin can update own participants" ON participants
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = participants.event_id AND events.admin_user_id = auth.uid())
  );

CREATE POLICY "Admin can delete own participants" ON participants
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = participants.event_id AND events.admin_user_id = auth.uid())
  );

-- DRAWS: Only admin can manage draws in their events
CREATE POLICY "Admin can view own draws" ON draws
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = draws.event_id AND events.admin_user_id = auth.uid())
  );

CREATE POLICY "Admin can create draws" ON draws
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM events WHERE events.id = draws.event_id AND events.admin_user_id = auth.uid())
  );

CREATE POLICY "Admin can update own draws" ON draws
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = draws.event_id AND events.admin_user_id = auth.uid())
  );

CREATE POLICY "Admin can delete own draws" ON draws
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = draws.event_id AND events.admin_user_id = auth.uid())
  );
