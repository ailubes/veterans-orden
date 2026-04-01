-- Scope events to commanderies when needed (local commandery-level events)
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS commandery_id uuid REFERENCES commanderies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS events_commandery_idx ON events(commandery_id);
