CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE event_status AS ENUM (
  'PENDING',
  'PROCESSING',
  'PROCESSED',
  'FAILED'
);

CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'GENERATED',
  pdf_url TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE outbox_events (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status event_status NOT NULL DEFAULT 'PENDING',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  published_at TIMESTAMPTZ,
  retries INT NOT NULL DEFAULT 0,
  error TEXT
);

CREATE INDEX idx_outbox_status_created
ON outbox_events (status, created_at);

CREATE INDEX idx_outbox_aggregate
ON outbox_events (aggregate_id);



CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outbox_updated_at
BEFORE UPDATE ON outbox_events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
