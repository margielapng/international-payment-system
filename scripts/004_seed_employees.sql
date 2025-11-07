-- Seed initial employee accounts
-- Password for all: SecurePass123!@# (hashed with bcrypt)
-- Note: In production, these should be changed immediately

INSERT INTO public.employees (employee_id, full_name, email, password_hash, role, department, mfa_enabled)
VALUES
  ('EMP001', 'Admin User', 'admin@payment-system.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU7u3oi', 'admin', 'Administration', TRUE),
  ('EMP002', 'John Verifier', 'john.verifier@payment-system.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU7u3oi', 'verifier', 'Compliance', TRUE),
  ('EMP003', 'Sarah Support', 'sarah.support@payment-system.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU7u3oi', 'support', 'Customer Service', TRUE)
ON CONFLICT (employee_id) DO NOTHING;
