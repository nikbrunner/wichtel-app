-- Migration: Add DELETE policies and fix CASCADE on draws FK
-- This enables delete operations for events, participants, and draws

-- 1. Add DELETE policies for RLS

-- Events: Users can delete own events
CREATE POLICY "Users can delete own events" ON events
  FOR DELETE USING (auth.uid() = admin_user_id);

-- Participants: Users can delete participants from own events
CREATE POLICY "Users can delete own participants" ON participants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = participants.event_id
      AND events.admin_user_id = auth.uid()
    )
  );

-- Draws: Users can delete draws from own events
CREATE POLICY "Users can delete own draws" ON draws
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = draws.event_id
      AND events.admin_user_id = auth.uid()
    )
  );

-- 2. Fix foreign key constraints on draws table to cascade on participant delete
-- This prevents orphaned draw records when a participant is deleted

ALTER TABLE draws DROP CONSTRAINT IF EXISTS draws_drawer_id_fkey;
ALTER TABLE draws DROP CONSTRAINT IF EXISTS draws_drawn_id_fkey;

ALTER TABLE draws
  ADD CONSTRAINT draws_drawer_id_fkey
  FOREIGN KEY (drawer_id) REFERENCES participants(id) ON DELETE CASCADE;

ALTER TABLE draws
  ADD CONSTRAINT draws_drawn_id_fkey
  FOREIGN KEY (drawn_id) REFERENCES participants(id) ON DELETE CASCADE;
