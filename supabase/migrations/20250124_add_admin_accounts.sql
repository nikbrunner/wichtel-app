-- Add event_date column to track when Secret Santa reveal should happen
ALTER TABLE events
ADD COLUMN event_date DATE NOT NULL DEFAULT CURRENT_DATE;

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
