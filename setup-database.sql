CREATE TABLE IF NOT EXISTS sales_data (
  id BIGSERIAL PRIMARY KEY,
  invoice_number INTEGER,
  transaction_type TEXT,
  date DATE,
  account_number TEXT,
  customer TEXT,
  product TEXT,
  mass INTEGER,
  sales_value DECIMAL(12,2),
  sales_qty INTEGER,
  r_kg DECIMAL(8,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_data_date ON sales_data(date);
CREATE INDEX IF NOT EXISTS idx_sales_data_customer ON sales_data(customer);
CREATE INDEX IF NOT EXISTS idx_sales_data_product ON sales_data(product);
CREATE INDEX IF NOT EXISTS idx_sales_data_invoice ON sales_data(invoice_number);

ALTER TABLE sales_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on sales_data" ON sales_data
  FOR ALL USING (true);
