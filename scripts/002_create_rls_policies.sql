-- RLS Policies for customers table
CREATE POLICY "customers_select_own" ON public.customers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "customers_insert_own" ON public.customers
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "customers_update_own" ON public.customers
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for transactions table
CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT USING (
    customer_id IN (SELECT id FROM public.customers WHERE auth.uid() = id)
  );

CREATE POLICY "transactions_insert_own" ON public.transactions
  FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM public.customers WHERE auth.uid() = id)
  );

CREATE POLICY "transactions_update_own" ON public.transactions
  FOR UPDATE USING (
    customer_id IN (SELECT id FROM public.customers WHERE auth.uid() = id)
  );

-- RLS Policies for audit_logs (read-only for users)
CREATE POLICY "audit_logs_select_own" ON public.audit_logs
  FOR SELECT USING (
    user_id = auth.uid() OR 
    user_id IN (SELECT id FROM public.customers WHERE auth.uid() = id)
  );

-- RLS Policies for sessions
CREATE POLICY "sessions_select_own" ON public.sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "sessions_insert_own" ON public.sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "sessions_delete_own" ON public.sessions
  FOR DELETE USING (user_id = auth.uid());

-- Note: Employees table has RLS enabled but no policies yet
-- Employee access will be handled through service role key in API routes
