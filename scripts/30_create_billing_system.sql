-- Create comprehensive billing system tables

-- Customer payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'card', 'bank_account', etc.
  brand TEXT, -- 'visa', 'mastercard', etc.
  last4 TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  stripe_invoice_id TEXT UNIQUE,
  invoice_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'open', 'paid', 'void', 'uncollectible'
  
  -- Billing details
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  due_date DATE NOT NULL,
  
  -- Amounts (in pence)
  subtotal INTEGER NOT NULL,
  tax_amount INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL,
  amount_paid INTEGER DEFAULT 0,
  amount_due INTEGER NOT NULL,
  
  -- Line items as JSON
  line_items JSONB NOT NULL DEFAULT '[]',
  
  -- Customer details at time of invoice
  customer_details JSONB NOT NULL,
  
  -- PDF storage
  pdf_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Invoice payments table
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL, -- in pence
  status TEXT NOT NULL, -- 'succeeded', 'failed', 'pending'
  payment_method_id UUID REFERENCES payment_methods(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Super admin audit table for fastenr staff
CREATE TABLE IF NOT EXISTS super_admin_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add Stripe customer ID to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_org_id ON payment_methods(organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_customer ON payment_methods(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_super_admin_audit_created_at ON super_admin_audit(created_at);
CREATE INDEX IF NOT EXISTS idx_super_admin_audit_target_org ON super_admin_audit(target_organization_id);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_methods
CREATE POLICY "Users can view their organization's payment methods" ON payment_methods
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage their organization's payment methods" ON payment_methods
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for invoices
CREATE POLICY "Users can view their organization's invoices" ON invoices
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for invoice_payments
CREATE POLICY "Users can view their organization's invoice payments" ON invoice_payments
  FOR SELECT USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

-- Super admin audit is only visible to fastenr staff (handled in application)
CREATE POLICY "Super admin audit restricted" ON super_admin_audit
  FOR ALL USING (false);

-- System policies for inserting data
CREATE POLICY "System can insert payment methods" ON payment_methods
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert invoices" ON invoices
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert invoice payments" ON invoice_payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert super admin audit" ON super_admin_audit
  FOR INSERT WITH CHECK (true);

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  year_month TEXT;
  sequence_num INTEGER;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYYYMM');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 8) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_month || '%';
  
  RETURN 'INV-' || year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;