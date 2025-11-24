-- Add unique constraint on drawer_id to prevent race conditions
-- where two concurrent requests could both draw for the same participant
ALTER TABLE draws ADD CONSTRAINT draws_drawer_id_unique UNIQUE (drawer_id);
