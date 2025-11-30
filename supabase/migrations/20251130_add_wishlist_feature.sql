-- Add lock_date to events (nullable for backwards compatibility)
-- Events with NULL lock_date allow immediate drawing (current behavior)
ALTER TABLE events ADD COLUMN lock_date DATE;

-- Add interests_status to participants
-- Values: 'pending' (default), 'skipped', 'submitted'
ALTER TABLE participants ADD COLUMN interests_status TEXT DEFAULT 'pending';
ALTER TABLE participants ADD CONSTRAINT interests_status_check
  CHECK (interests_status IN ('pending', 'skipped', 'submitted'));

-- Create participant_interests table for wishlist items
CREATE TABLE IF NOT EXISTS participant_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT item_not_empty CHECK (length(trim(item)) > 0)
);

-- Create index for efficient querying by participant
CREATE INDEX IF NOT EXISTS idx_participant_interests_participant_id
  ON participant_interests(participant_id);

-- Enable RLS for participant_interests
ALTER TABLE participant_interests ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admin can manage interests for their event's participants
CREATE POLICY "Admin can manage interests" ON participant_interests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM participants p
      JOIN events e ON e.id = p.event_id
      WHERE p.id = participant_interests.participant_id
      AND e.admin_user_id = auth.uid()
    )
  );
