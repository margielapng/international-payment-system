-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customers table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  account_status TEXT DEFAULT 'pending' CHECK (account_status IN ('pending', 'verified', 'suspended', 'closed')),
  kyc_verified BOOLEAN DEFAULT FALSE,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret TEXT,
  backup_codes TEXT[],
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create employees table (NOT linked to auth.users - static login)
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'verifier', 'support')),
  department TEXT,
  mfa_enabled BOOLEAN DEFAULT TRUE,
  mfa_secret TEXT,
  backup_codes TEXT[],
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('international_transfer', 'domestic_transfer', 'payment')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL,
  
  -- Sender details
  sender_name TEXT NOT NULL,
  sender_account TEXT NOT NULL,
  sender_bank TEXT,
  sender_country TEXT NOT NULL,
  
  -- Recipient details
  recipient_name TEXT NOT NULL,
  recipient_account TEXT NOT NULL,
  recipient_bank TEXT NOT NULL,
  recipient_swift TEXT,
  recipient_iban TEXT,
  recipient_country TEXT NOT NULL,
  recipient_address TEXT,
  
  -- Transaction details
  purpose TEXT NOT NULL,
  reference_number TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'verified', 'completed', 'rejected', 'failed')),
  
  -- Verification
  verified_by UUID REFERENCES public.employees(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Risk assessment
  risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
  flagged_for_review BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  user_type TEXT NOT NULL CHECK (user_type IN ('customer', 'employee', 'system')),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT CHECK (status IN ('success', 'failure', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sessions table for JWT refresh tokens
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('customer', 'employee')),
  refresh_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier TEXT NOT NULL, -- IP address or user ID
  endpoint TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(account_status);
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON public.employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON public.transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON public.rate_limits(identifier, endpoint);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
