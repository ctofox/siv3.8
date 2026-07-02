/*
# Comprehensive RLS Policies for All Tables

## Problem
RLS is enabled on all 39 public tables, but only `warehouses` has policies.
The remaining 38 tables are locked — no reads or writes can succeed through
the Supabase client.

## Approach
This app uses the anon key without enforcing authentication (demo ERP).
All policies grant full CRUD to both `anon` and `authenticated` roles,
matching the pattern established in migrations 010, 011, and 012.

Four separate policies per table (SELECT, INSERT, UPDATE, DELETE) —
never `FOR ALL`. Existing policies are dropped first to avoid conflicts.
*/

-- ============================================================
-- Enable RLS on all tables (idempotent)
-- ============================================================
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_receipt_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_records ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper: drop all existing policies on every table
-- We use a DO block to drop policies dynamically so we don't
-- have to enumerate every possible old policy name.
-- ============================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ============================================================
-- accounts
-- ============================================================
CREATE POLICY acc_select  ON accounts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY acc_insert  ON accounts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY acc_update  ON accounts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY acc_delete  ON accounts FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- activity_logs
-- ============================================================
CREATE POLICY log_select  ON activity_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY log_insert  ON activity_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY log_update  ON activity_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY log_delete  ON activity_logs FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- app_settings
-- ============================================================
CREATE POLICY settings_select  ON app_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY settings_insert  ON app_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY settings_update  ON app_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY settings_delete  ON app_settings FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- attendance
-- ============================================================
CREATE POLICY att_select  ON attendance FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY att_insert  ON attendance FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY att_update  ON attendance FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY att_delete  ON attendance FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- brands
-- ============================================================
CREATE POLICY brands_select  ON brands FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY brands_insert  ON brands FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY brands_update  ON brands FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY brands_delete  ON brands FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- categories
-- ============================================================
CREATE POLICY cats_select  ON categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY cats_insert  ON categories FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY cats_update  ON categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY cats_delete  ON categories FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- customer_notes
-- ============================================================
CREATE POLICY cnote_select  ON customer_notes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY cnote_insert  ON customer_notes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY cnote_update  ON customer_notes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY cnote_delete  ON customer_notes FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- customers
-- ============================================================
CREATE POLICY cust_select  ON customers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY cust_insert  ON customers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY cust_update  ON customers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY cust_delete  ON customers FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- deliveries
-- ============================================================
CREATE POLICY del_select  ON deliveries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY del_insert  ON deliveries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY del_update  ON deliveries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY del_delete  ON deliveries FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- delivery_items
-- ============================================================
CREATE POLICY del_item_select  ON delivery_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY del_item_insert  ON delivery_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY del_item_update  ON delivery_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY del_item_delete  ON delivery_items FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- employees
-- ============================================================
CREATE POLICY emp_select  ON employees FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY emp_insert  ON employees FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY emp_update  ON employees FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY emp_delete  ON employees FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- goods_receipt_notes
-- ============================================================
CREATE POLICY grn_select  ON goods_receipt_notes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY grn_insert  ON goods_receipt_notes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY grn_update  ON goods_receipt_notes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY grn_delete  ON goods_receipt_notes FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- inventory_items
-- ============================================================
CREATE POLICY inv_select  ON inventory_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY inv_insert  ON inventory_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY inv_update  ON inventory_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY inv_delete  ON inventory_items FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- invoice_items
-- ============================================================
CREATE POLICY inv_item_select  ON invoice_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY inv_item_insert  ON invoice_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY inv_item_update  ON invoice_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY inv_item_delete  ON invoice_items FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- invoices
-- ============================================================
CREATE POLICY invoice_select  ON invoices FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY invoice_insert  ON invoices FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY invoice_update  ON invoices FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY invoice_delete  ON invoices FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- journal_entries
-- ============================================================
CREATE POLICY je_select  ON journal_entries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY je_insert  ON journal_entries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY je_update  ON journal_entries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY je_delete  ON journal_entries FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- journal_lines
-- ============================================================
CREATE POLICY jl_select  ON journal_lines FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY jl_insert  ON journal_lines FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY jl_update  ON journal_lines FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY jl_delete  ON journal_lines FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- online_order_items
-- ============================================================
CREATE POLICY ooi_select  ON online_order_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY ooi_insert  ON online_order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY ooi_update  ON online_order_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY ooi_delete  ON online_order_items FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- online_orders
-- ============================================================
CREATE POLICY oo_select  ON online_orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY oo_insert  ON online_orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY oo_update  ON online_orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY oo_delete  ON online_orders FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- payment_methods
-- ============================================================
CREATE POLICY pm_select  ON payment_methods FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY pm_insert  ON payment_methods FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY pm_update  ON payment_methods FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY pm_delete  ON payment_methods FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- payments
-- ============================================================
CREATE POLICY pay_select  ON payments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY pay_insert  ON payments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY pay_update  ON payments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY pay_delete  ON payments FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- product_colors
-- ============================================================
CREATE POLICY pc_select  ON product_colors FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY pc_insert  ON product_colors FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY pc_update  ON product_colors FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY pc_delete  ON product_colors FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- product_sizes
-- ============================================================
CREATE POLICY ps_select  ON product_sizes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY ps_insert  ON product_sizes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY ps_update  ON product_sizes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY ps_delete  ON product_sizes FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- product_units
-- ============================================================
CREATE POLICY pu_select  ON product_units FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY pu_insert  ON product_units FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY pu_update  ON product_units FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY pu_delete  ON product_units FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- product_variants
-- ============================================================
CREATE POLICY pv_select  ON product_variants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY pv_insert  ON product_variants FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY pv_update  ON product_variants FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY pv_delete  ON product_variants FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- products
-- ============================================================
CREATE POLICY products_select  ON products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY products_insert  ON products FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY products_update  ON products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY products_delete  ON products FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- profiles
-- ============================================================
CREATE POLICY prof_select  ON profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY prof_insert  ON profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY prof_update  ON profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY prof_delete  ON profiles FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- project_tasks
-- ============================================================
CREATE POLICY ptask_select  ON project_tasks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY ptask_insert  ON project_tasks FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY ptask_update  ON project_tasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY ptask_delete  ON project_tasks FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- projects
-- ============================================================
CREATE POLICY proj_select  ON projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY proj_insert  ON projects FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY proj_update  ON projects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY proj_delete  ON projects FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- purchase_order_items
-- ============================================================
CREATE POLICY poi_select  ON purchase_order_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY poi_insert  ON purchase_order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY poi_update  ON purchase_order_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY poi_delete  ON purchase_order_items FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- purchase_orders
-- ============================================================
CREATE POLICY po_select  ON purchase_orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY po_insert  ON purchase_orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY po_update  ON purchase_orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY po_delete  ON purchase_orders FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- quotation_items
-- ============================================================
CREATE POLICY qi_select  ON quotation_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY qi_insert  ON quotation_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY qi_update  ON quotation_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY qi_delete  ON quotation_items FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- quotations
-- ============================================================
CREATE POLICY quote_select  ON quotations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY quote_insert  ON quotations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY quote_update  ON quotations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY quote_delete  ON quotations FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- sales_return_items
-- ============================================================
CREATE POLICY sri_select  ON sales_return_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY sri_insert  ON sales_return_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY sri_update  ON sales_return_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY sri_delete  ON sales_return_items FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- sales_returns
-- ============================================================
CREATE POLICY sr_select  ON sales_returns FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY sr_insert  ON sales_returns FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY sr_update  ON sales_returns FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY sr_delete  ON sales_returns FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- stock_movements
-- ============================================================
CREATE POLICY sm_select  ON stock_movements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY sm_insert  ON stock_movements FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY sm_update  ON stock_movements FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY sm_delete  ON stock_movements FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- suppliers
-- ============================================================
CREATE POLICY sup_select  ON suppliers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY sup_insert  ON suppliers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY sup_update  ON suppliers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY sup_delete  ON suppliers FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- warehouses
-- ============================================================
CREATE POLICY wh_select  ON warehouses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY wh_insert  ON warehouses FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY wh_update  ON warehouses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY wh_delete  ON warehouses FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- warranty_records
-- ============================================================
CREATE POLICY warranty_select  ON warranty_records FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY warranty_insert  ON warranty_records FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY warranty_update  ON warranty_records FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY warranty_delete  ON warranty_records FOR DELETE TO anon, authenticated USING (true);
