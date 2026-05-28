-- Finance & Invoicing: number plans, documents, items, payments

CREATE TABLE IF NOT EXISTS number_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  template VARCHAR(255) NOT NULL,
  period VARCHAR(20) NOT NULL DEFAULT 'yearly',
  doctype VARCHAR(50) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  next_number INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  full_number VARCHAR(255) NOT NULL,
  number_plan_id INTEGER REFERENCES number_plans(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  issue_date DATE NOT NULL,
  sale_date DATE NOT NULL,
  due_date DATE,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'transfer',
  payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
  total_net NUMERIC(12,2) NOT NULL,
  total_vat NUMERIC(12,2) NOT NULL,
  total_gross NUMERIC(12,2) NOT NULL,
  notes TEXT,
  customer_name VARCHAR(255),
  customer_address TEXT,
  customer_tax_id VARCHAR(50),
  issuer_name VARCHAR(255),
  issuer_address TEXT,
  issuer_tax_id VARCHAR(50),
  issuer_bank_name VARCHAR(255),
  issuer_bank_account VARCHAR(48),
  reference_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  ordinal INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(10,3) NOT NULL DEFAULT 1,
  unit_net_price NUMERIC(12,2) NOT NULL,
  vat_rate NUMERIC(5,2) NOT NULL,
  net_amount NUMERIC(12,2) NOT NULL,
  vat_amount NUMERIC(12,2) NOT NULL,
  gross_amount NUMERIC(12,2) NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  tariff_id INTEGER REFERENCES tariffs(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50),
  reference VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
