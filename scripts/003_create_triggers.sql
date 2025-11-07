-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create customer profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.customers (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to auto-create customer profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to generate reference number
CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS TEXT AS $$
DECLARE
  ref_number TEXT;
BEGIN
  ref_number := 'TXN' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  RETURN ref_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate reference number
CREATE OR REPLACE FUNCTION set_transaction_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_number IS NULL THEN
    NEW.reference_number := generate_reference_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_transaction_reference_trigger
  BEFORE INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION set_transaction_reference();
