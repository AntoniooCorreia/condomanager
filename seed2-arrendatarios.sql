BEGIN;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_date timestamp;

INSERT INTO payments (user_id, amount, status, due_date, paid_date, description) VALUES
  (21, '640.00', 'paid', now() - interval '120 days', now() - interval '122 days', 'Renda mensal'),
  (21, '640.00', 'paid', now() - interval '90 days', now() - interval '92 days', 'Renda mensal'),
  (21, '640.00', 'paid', now() - interval '60 days', now() - interval '61 days', 'Renda mensal'),
  (21, '640.00', 'paid', now() - interval '30 days', now() - interval '31 days', 'Renda mensal'),
  (21, '640.00', 'pending', now() + interval '8 days', NULL, 'Renda mensal'),
  (34, '650.00', 'paid', now() - interval '120 days', now() - interval '110 days', 'Renda mensal'),
  (34, '650.00', 'paid', now() - interval '90 days', now() - interval '80 days', 'Renda mensal'),
  (34, '650.00', 'paid', now() - interval '60 days', now() - interval '50 days', 'Renda mensal'),
  (34, '650.00', 'pending', now() - interval '35 days', NULL, 'Renda mensal'),
  (35, '700.00', 'paid', now() - interval '120 days', now() - interval '121 days', 'Renda mensal'),
  (35, '700.00', 'paid', now() - interval '90 days', now() - interval '82 days', 'Renda mensal'),
  (35, '700.00', 'paid', now() - interval '60 days', now() - interval '63 days', 'Renda mensal'),
  (35, '700.00', 'pending', now() - interval '30 days', NULL, 'Renda mensal'),
  (36, '620.00', 'paid', now() - interval '120 days', now() - interval '128 days', 'Renda mensal'),
  (36, '620.00', 'paid', now() - interval '90 days', now() - interval '97 days', 'Renda mensal'),
  (36, '620.00', 'paid', now() - interval '60 days', now() - interval '68 days', 'Renda mensal'),
  (36, '620.00', 'paid', now() - interval '30 days', now() - interval '37 days', 'Renda mensal'),
  (36, '620.00', 'paid', now() + interval '15 days', now() + interval '1 days', 'Renda mensal'),
  (37, '750.00', 'paid', now() - interval '120 days', now() - interval '112 days', 'Renda mensal'),
  (37, '750.00', 'paid', now() - interval '90 days', now() - interval '78 days', 'Renda mensal'),
  (37, '750.00', 'paid', now() - interval '60 days', now() - interval '49 days', 'Renda mensal'),
  (37, '750.00', 'pending', now() - interval '40 days', NULL, 'Renda mensal'),
  (38, '680.00', 'paid', now() - interval '120 days', now() - interval '123 days', 'Renda mensal'),
  (38, '680.00', 'paid', now() - interval '90 days', now() - interval '93 days', 'Renda mensal'),
  (38, '680.00', 'paid', now() - interval '60 days', now() - interval '62 days', 'Renda mensal'),
  (38, '680.00', 'paid', now() - interval '30 days', now() - interval '33 days', 'Renda mensal'),
  (38, '680.00', 'pending', now() + interval '11 days', NULL, 'Renda mensal'),
  (39, '600.00', 'paid', now() - interval '90 days', now() - interval '84 days', 'Renda mensal'),
  (39, '600.00', 'paid', now() - interval '60 days', now() - interval '61 days', 'Renda mensal'),
  (39, '600.00', 'pending', now() - interval '32 days', NULL, 'Renda mensal');

COMMIT;
