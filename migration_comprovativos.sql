BEGIN;

ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS proof_url text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS submitted_at timestamp;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS approved_by integer REFERENCES users(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS approved_at timestamp;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_date timestamp;

COMMIT;
