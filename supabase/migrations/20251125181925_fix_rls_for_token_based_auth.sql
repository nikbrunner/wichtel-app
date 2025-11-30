-- Fix RLS policies for token-based authentication
-- The app uses token-based auth without Supabase auth users, so auth.uid() is always null.
-- These permissive policies allow public access; token validation happens in app logic.

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own events" ON events;
DROP POLICY IF EXISTS "Users can view own participants" ON participants;
DROP POLICY IF EXISTS "Users can view own draws" ON draws;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can update own participants" ON participants;
DROP POLICY IF EXISTS "Users can delete own events" ON events;
DROP POLICY IF EXISTS "Users can delete own participants" ON participants;
DROP POLICY IF EXISTS "Users can delete own draws" ON draws;

-- Create permissive policies for token-based access
-- Anyone can read events (needed for participant pages to load event info)
CREATE POLICY "Allow public read access to events" ON events
  FOR SELECT USING (true);

-- Anyone can read participants (validation happens via token in app logic)
CREATE POLICY "Allow public read access to participants" ON participants
  FOR SELECT USING (true);

-- Anyone can read draws (needed to show drawn names)
CREATE POLICY "Allow public read access to draws" ON draws
  FOR SELECT USING (true);

-- Anyone can update participants (for has_drawn flag, validated by token in app)
CREATE POLICY "Allow public update to participants" ON participants
  FOR UPDATE USING (true);

-- Anyone can insert draws (validated by token in app logic)
CREATE POLICY "Allow public insert to draws" ON draws
  FOR INSERT WITH CHECK (true);

-- Anyone can update draws (for edge cases)
CREATE POLICY "Allow public update to draws" ON draws
  FOR UPDATE USING (true);

-- Anyone can delete events (admin token validated in app)
CREATE POLICY "Allow public delete events" ON events
  FOR DELETE USING (true);

-- Anyone can delete participants (admin token validated in app)
CREATE POLICY "Allow public delete participants" ON participants
  FOR DELETE USING (true);

-- Anyone can delete draws (admin token validated in app)
CREATE POLICY "Allow public delete draws" ON draws
  FOR DELETE USING (true);
